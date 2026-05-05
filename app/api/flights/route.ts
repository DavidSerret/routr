import { NextRequest, NextResponse } from 'next/server';
import { searchFlights } from '@/lib/duffel';
import { normalizeDuffelOffer, isValidOffer } from '@/lib/duffelNormalizer';
import { assignBadges } from '@/lib/utils';
import { getCache, setCache, TTL } from '@/lib/cache';
import { distanceBetweenAirports } from '@/lib/airportDistance';
import type { FlightOffer, OpenJawCombination } from '@/lib/types';

type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first';
type Passenger = { type: 'adult' | 'child' | 'infant_without_seat' };

const PAGE_SIZE = 30;

function deduplicateByFingerprint(offers: FlightOffer[]): FlightOffer[] {
  const seen = new Map<string, FlightOffer>();
  for (const offer of offers) {
    const key = `${offer.origin}-${offer.destination}-${offer.departureAt.slice(0, 16)}-${offer.duration}`;
    if (!seen.has(key) || offer.price < seen.get(key)!.price) {
      seen.set(key, offer);
    }
  }
  return Array.from(seen.values());
}

function combinationScore(combo: OpenJawCombination): number {
  let score = combo.totalPrice;
  if (combo.isOpenJaw && combo.distanceKm !== undefined && combo.distanceKm > 0) {
    score += combo.distanceKm * 0.05;
  }
  return score;
}

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;

  const origin = p.get('origin');
  const destination = p.get('destination');
  const date = p.get('date');
  const returnDate = p.get('return_date');
  const tripType = p.get('tripType') ?? 'one-way';
  const adults = Math.max(1, parseInt(p.get('adults') ?? '1', 10));
  const children = Math.max(0, parseInt(p.get('children') ?? '0', 10));
  const cabin = (p.get('cabin') ?? 'economy') as CabinClass;
  const page = Math.max(1, parseInt(p.get('page') ?? '1', 10));

  // Resolve origins/destinations (comma-separated for multi-city, fallback to single)
  const originsParam = p.get('origins');
  const destinationsParam = p.get('destinations');
  const origins = originsParam ? originsParam.split(',').filter(Boolean) : [origin ?? ''].filter(Boolean);
  const destinations = destinationsParam ? destinationsParam.split(',').filter(Boolean) : [destination ?? ''].filter(Boolean);

  if (origins.length === 0 || destinations.length === 0 || !date) {
    return NextResponse.json({ error: 'Missing required params: origin, destination, date' }, { status: 400 });
  }

  const passengers: Passenger[] = [
    ...Array(adults).fill({ type: 'adult' as const }),
    ...Array(children).fill({ type: 'child' as const }),
  ];

  // Route multi-city to open-jaw handler (open-jaw allowed)
  if (tripType === 'multi-city' && returnDate) {
    return handleOpenJawSearch(origins, destinations, date, returnDate, passengers, cabin, adults, children, page, true);
  }

  // Route grouped airport searches (multiple origins or destinations)
  if (origins.length > 1 || destinations.length > 1) {
    if (tripType === 'round-trip' && returnDate) {
      // Round-trip: same-airport pairs only (no open-jaw)
      return handleOpenJawSearch(origins, destinations, date, returnDate, passengers, cabin, adults, children, page, false);
    }
    return handleGroupedOneWaySearch(origins, destinations, date, passengers, cabin, adults, children, page);
  }

  // Single-pair search
  const singleOrigin = origins[0];
  const singleDest = destinations[0];

  const cacheKey = `duffel:v1:${singleOrigin}:${singleDest}:${date}:${returnDate ?? 'ow'}:${adults}:${children}:${cabin}`;
  const cached = await getCache<object>(cacheKey);
  if (cached) return NextResponse.json({ ...cached, cached: true });

  try {
    const slices = [{ origin: singleOrigin, destination: singleDest, departure_date: date }];
    if (tripType === 'round-trip' && returnDate) {
      slices.push({ origin: singleDest, destination: singleOrigin, departure_date: returnDate });
    }

    const result = await searchFlights({ slices, passengers, cabin_class: cabin });

    const normalized = (result.offers ?? []).filter(isValidOffer).map(normalizeDuffelOffer);
    const flights = assignBadges(
      deduplicateByFingerprint(normalized)
        .sort((a, b) => a.price - b.price)
        .slice(0, PAGE_SIZE)
    );

    const response = {
      flights,
      page: 1,
      hasMore: false,
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

async function handleGroupedOneWaySearch(
  origins: string[],
  destinations: string[],
  date: string,
  passengers: Passenger[],
  cabin: CabinClass,
  adults: number,
  children: number,
  page: number
): Promise<NextResponse> {
  const topOrigins = origins.slice(0, 5);
  const topDestinations = destinations.slice(0, 5);

  const cacheKey = `grouped-ow:${topOrigins.join('+')}->${topDestinations.join('+')}:${date}:${adults}:${children}:${cabin}`;
  let allFlights = await getCache<FlightOffer[]>(cacheKey);

  if (!allFlights) {
    const pairs: [string, string][] = [];
    for (const o of topOrigins) {
      for (const d of topDestinations) {
        pairs.push([o, d]);
      }
    }

    const results = await Promise.allSettled(
      pairs.map(([o, d]) =>
        searchFlights({
          slices: [{ origin: o, destination: d, departure_date: date }],
          passengers,
          cabin_class: cabin,
        })
      )
    );

    const raw: FlightOffer[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled') {
        raw.push(...(result.value.offers ?? []).filter(isValidOffer).map(normalizeDuffelOffer));
      }
    }

    allFlights = assignBadges(
      deduplicateByFingerprint(raw).sort((a, b) => a.price - b.price)
    );

    if (allFlights.length > 0) {
      await setCache(cacheKey, allFlights, TTL.FLIGHTS);
    }
  }

  const totalCount = allFlights.length;
  const paginated = allFlights.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return NextResponse.json({
    flights: paginated,
    page,
    hasMore: page * PAGE_SIZE < totalCount,
    cached: false,
    updatedAt: new Date().toISOString(),
    totalCount,
    currencyCode: paginated[0]?.currency ?? 'EUR',
  });
}

async function handleOpenJawSearch(
  origins: string[],
  destinations: string[],
  outboundDate: string,
  returnDate: string,
  passengers: Passenger[],
  cabin: CabinClass,
  adults: number,
  children: number,
  page: number,
  allowOpenJaw: boolean
): Promise<NextResponse> {
  const topOrigins = origins.slice(0, 5);
  const topDestinations = destinations.slice(0, 5);

  const mode = allowOpenJaw ? 'oj' : 'rt';
  const cacheKey = `openjaw:${mode}:${topOrigins.join('+')}->${topDestinations.join('+')}:${outboundDate}:${returnDate}:${adults}:${children}:${cabin}`;
  let allCombinations = await getCache<OpenJawCombination[]>(cacheKey);

  if (!allCombinations) {
    const outboundPairs: [string, string][] = [];
    for (const o of topOrigins) {
      for (const d of topDestinations) {
        outboundPairs.push([o, d]);
      }
    }

    const returnPairs: [string, string][] = [];
    for (const d of topDestinations) {
      for (const o of topOrigins) {
        returnPairs.push([d, o]);
      }
    }

    const [outboundResults, returnResults] = await Promise.all([
      Promise.allSettled(
        outboundPairs.map(([o, d]) =>
          searchFlights({
            slices: [{ origin: o, destination: d, departure_date: outboundDate }],
            passengers,
            cabin_class: cabin,
          })
        )
      ),
      Promise.allSettled(
        returnPairs.map(([d, o]) =>
          searchFlights({
            slices: [{ origin: d, destination: o, departure_date: returnDate }],
            passengers,
            cabin_class: cabin,
          })
        )
      ),
    ]);

    const outboundOffers: FlightOffer[] = [];
    for (const result of outboundResults) {
      if (result.status === 'fulfilled') {
        outboundOffers.push(...(result.value.offers ?? []).filter(isValidOffer).map(normalizeDuffelOffer));
      }
    }

    const returnOffers: FlightOffer[] = [];
    for (const result of returnResults) {
      if (result.status === 'fulfilled') {
        returnOffers.push(...(result.value.offers ?? []).filter(isValidOffer).map(normalizeDuffelOffer));
      }
    }

    // Top 15 outbound and return by price
    const topOutbounds = deduplicateByFingerprint(outboundOffers)
      .sort((a, b) => a.price - b.price)
      .slice(0, 15);
    const topReturns = deduplicateByFingerprint(returnOffers)
      .sort((a, b) => a.price - b.price)
      .slice(0, 15);

    // Build all valid outbound × return combinations
    const combinations: OpenJawCombination[] = [];
    for (const outbound of topOutbounds) {
      for (const ret of topReturns) {
        // Return must depart after outbound arrives
        if (new Date(ret.departureAt) < new Date(outbound.arrivalAt)) continue;

        const isSameAirports =
          outbound.destination === ret.origin &&
          outbound.origin === ret.destination;

        // Round-trip mode: only same-airport pairs; open-jaw mode: allow all
        if (!allowOpenJaw && !isSameAirports) continue;

        const isOpenJaw = !isSameAirports;

        const distanceKm = isOpenJaw
          ? (distanceBetweenAirports(outbound.destination, ret.origin) ?? undefined)
          : 0;

        combinations.push({
          outbound,
          return: ret,
          totalPrice: outbound.price + ret.price,
          isOpenJaw,
          outboundAirport: outbound.destination,
          returnAirport: ret.origin,
          distanceKm,
        });
      }
    }

    combinations.sort((a, b) => combinationScore(a) - combinationScore(b));
    allCombinations = combinations;

    if (allCombinations.length > 0) {
      await setCache(cacheKey, allCombinations, TTL.FLIGHTS);
    }
  }

  const totalCount = allCombinations.length;
  const paginated = allCombinations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return NextResponse.json({
    flights: paginated,
    page,
    hasMore: page * PAGE_SIZE < totalCount,
    mode: 'open-jaw',
    cached: false,
    updatedAt: new Date().toISOString(),
    totalCount,
  });
}
