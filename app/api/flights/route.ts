import { NextRequest, NextResponse } from 'next/server';
import { searchFlights } from '@/lib/duffel';
import { normalizeDuffelOffer } from '@/lib/duffelNormalizer';
import { assignBadges } from '@/lib/utils';
import { getCache, setCache, TTL } from '@/lib/cache';

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;

  const origin = p.get('origin');
  const destination = p.get('destination');
  const date = p.get('date');
  const returnDate = p.get('return_date');
  const tripType = p.get('tripType') ?? 'one-way';
  const adults = Math.max(1, parseInt(p.get('adults') ?? '1', 10));
  const children = Math.max(0, parseInt(p.get('children') ?? '0', 10));
  const cabin = (p.get('cabin') ?? 'economy') as 'economy' | 'premium_economy' | 'business' | 'first';

  if (!origin || !destination || !date) {
    return NextResponse.json({ error: 'Missing required params: origin, destination, date' }, { status: 400 });
  }

  const cacheKey = `duffel:v1:${origin}:${destination}:${date}:${returnDate ?? 'ow'}:${adults}:${children}:${cabin}`;
  const cached = await getCache<object>(cacheKey);
  if (cached) return NextResponse.json({ ...cached, cached: true });

  try {
    const passengers = [
      ...Array(adults).fill({ type: 'adult' as const }),
      ...Array(children).fill({ type: 'child' as const }),
    ];

    const slices = [{ origin, destination, departure_date: date }];
    if (tripType === 'round-trip' && returnDate) {
      slices.push({ origin: destination, destination: origin, departure_date: returnDate });
    }

    const result = await searchFlights({ slices, passengers, cabin_class: cabin });

    // Normalize all offers
    const normalized = (result.offers ?? []).map(normalizeDuffelOffer);

    // Deduplicate by outbound flight number + departure time (minute precision).
    // For round-trips Duffel returns every outbound×inbound combination as a separate
    // offer. We keep only the cheapest combination for each distinct outbound flight.
    const seen = new Map<string, typeof normalized[0]>();
    for (const offer of normalized) {
      const key = `${offer.flightNumber}-${offer.departureAt.slice(0, 16)}`;
      const existing = seen.get(key);
      if (!existing || offer.price < existing.price) {
        seen.set(key, offer);
      }
    }

    const flights = assignBadges(
      Array.from(seen.values())
        .sort((a, b) => a.price - b.price)
        .slice(0, 30)
    );

    const response = {
      flights,
      cached: false,
      updatedAt: new Date().toISOString(),
      totalCount: flights.length,
      currencyCode: flights[0]?.currency ?? 'EUR',
    };

    if (flights.length > 0) {
      await setCache(cacheKey, response, TTL.FLIGHTS);
    }

    return NextResponse.json(response);
  } catch (err) {
    console.error('Duffel search error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Flight search failed. Please try again.' }, { status: 500 });
  }
}
