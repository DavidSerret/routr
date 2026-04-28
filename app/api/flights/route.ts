import { NextRequest, NextResponse } from 'next/server';
import { getCache, setCache, TTL } from '@/lib/cache';
import { fetchCheapTickets, fetchMonthlyPrices } from '@/lib/travelpayouts';
import { normalizeTpFlightOffer, assignBadges } from '@/lib/utils';
import type { FlightOffer } from '@/lib/types';

interface FlightSearchBody {
  originLocationCode: string | string[];
  destinationLocationCode: string | string[];
  departureDate: string;
  returnDate?: string;
  currencyCode?: string;
}

async function fetchFlightsForPair(
  origin: string,
  destination: string,
  params: FlightSearchBody
): Promise<FlightOffer[]> {
  const currency = params.currencyCode ?? 'EUR';
  const cacheKey = [
    'tp:flights:v2',
    origin,
    destination,
    params.departureDate.slice(0, 7),
    params.returnDate?.slice(0, 7) ?? 'ow',
    currency,
  ].join(':');

  const cached = await getCache<FlightOffer[]>(cacheKey);
  if (cached) return cached;

  // Fetch cheap (grouped by stop-count) and monthly (one best per month) in parallel
  const [cheapTickets, monthlyTickets] = await Promise.all([
    fetchCheapTickets(origin, destination, params.departureDate, params.returnDate, currency).catch(() => []),
    fetchMonthlyPrices(origin, destination, currency).catch(() => []),
  ]);

  const airlineNames = new Map<string, string>();

  // Deduplicate by id across both sources
  const seen = new Set<string>();
  const flights: FlightOffer[] = [];

  for (const t of [...cheapTickets, ...monthlyTickets]) {
    const offer = normalizeTpFlightOffer(t, origin, destination, currency, airlineNames);
    if (!seen.has(offer.id)) {
      seen.add(offer.id);
      flights.push(offer);
    }
  }

  flights.sort((a, b) => a.price - b.price);
  await setCache(cacheKey, flights, TTL.FLIGHTS);
  return flights;
}

export async function POST(req: NextRequest) {
  let body: FlightSearchBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const origins = Array.isArray(body.originLocationCode)
    ? body.originLocationCode
    : [body.originLocationCode];
  const destinations = Array.isArray(body.destinationLocationCode)
    ? body.destinationLocationCode
    : [body.destinationLocationCode];

  if (!origins.length || !destinations.length || !body.departureDate) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const pairs: [string, string][] = [];
  for (const o of origins) {
    for (const d of destinations) {
      if (o !== d) pairs.push([o, d]);
    }
  }

  try {
    const results = await Promise.all(
      pairs.map(([o, d]) => fetchFlightsForPair(o, d, body).catch(() => [] as FlightOffer[]))
    );

    const seen = new Set<string>();
    const merged: FlightOffer[] = [];
    for (const batch of results) {
      for (const flight of batch) {
        if (!seen.has(flight.id)) {
          seen.add(flight.id);
          merged.push(flight);
        }
      }
    }

    merged.sort((a, b) => a.price - b.price);
    const withBadges = assignBadges(merged);

    const message = withBadges.length === 0
      ? 'No recent price data for this route. Try nearby airports or a different month.'
      : undefined;

    return NextResponse.json({
      flights: withBadges,
      cached: false,
      updatedAt: new Date().toISOString(),
      totalCount: withBadges.length,
      currencyCode: body.currencyCode ?? 'EUR',
      ...(message ? { message } : {}),
    });
  } catch (err) {
    console.error('Flight search error:', err);
    return NextResponse.json({ error: 'Search failed. Please try again.' }, { status: 500 });
  }
}
