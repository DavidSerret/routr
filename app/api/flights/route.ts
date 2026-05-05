import { NextRequest, NextResponse } from 'next/server';
import { searchFlights } from '@/lib/duffel';
import { normalizeDuffelOffer, isValidOffer } from '@/lib/duffelNormalizer';
import { assignBadges } from '@/lib/utils';
import { getCache, setCache, TTL } from '@/lib/cache';
import type { FlightOffer, OpenJawCombination } from '@/lib/types';

type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first';

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

  // Resolve origins/destinations (comma-separated for multi-city, fallback to single)
  const originsParam = p.get('origins');
  const destinationsParam = p.get('destinations');
  const origins = originsParam ? originsParam.split(',').filter(Boolean) : [origin ?? ''].filter(Boolean);
  const destinations = destinationsParam ? destinationsParam.split(',').filter(Boolean) : [destination ?? ''].filter(Boolean);

  if (origins.length === 0 || destinations.length === 0 || !date) {
    return NextResponse.json({ error: 'Missing required params: origin, destination, date' }, { status: 400 });
  }

  const passengers = [
    ...Array(adults).fill({ type: 'adult' as const }),
    ...Array(children).fill({ type: 'child' as const }),
  ];

  // Route multi-city to open-jaw handler
  if (tripType === 'multi-city' && returnDate) {
    return handleOpenJawSearch(origins, destinations, date, returnDate, passengers, cabin);
  }

  // Route grouped airport searches (multiple origins or destinations)
  if (origins.length > 1 || destinations.length > 1) {
    if (tripType === 'round-trip' && returnDate) {
      return handleOpenJawSearch(origins, destinations, date, returnDate, passengers, cabin);
    }
    return handleGroupedOneWaySearch(origins, destinations, date, passengers, cabin);
  }

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

    const seen = new Map<string, typeof normalized[0]>();
    for (const offer of normalized) {
      const key = `${offer.origin}-${offer.destination}-${offer.departureAt.slice(0, 16)}-${offer.duration}`;
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

async function handleGroupedOneWaySearch(
  origins: string[],
  destinations: string[],
  date: string,
  passengers: { type: 'adult' | 'child' | 'infant_without_seat' }[],
  cabin: CabinClass
): Promise<NextResponse> {
  const topOrigins = origins.slice(0, 5);
  const topDestinations = destinations.slice(0, 5);

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

  const allOffers: FlightOffer[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      allOffers.push(
        ...(result.value.offers ?? []).filter(isValidOffer).map(normalizeDuffelOffer)
      );
    }
  }

  const seen = new Map<string, FlightOffer>();
  for (const offer of allOffers) {
    const key = `${offer.origin}-${offer.destination}-${offer.departureAt.slice(0, 16)}-${offer.duration}`;
    if (!seen.has(key) || offer.price < seen.get(key)!.price) {
      seen.set(key, offer);
    }
  }

  const flights = assignBadges(
    Array.from(seen.values())
      .sort((a, b) => a.price - b.price)
      .slice(0, 30)
  );

  return NextResponse.json({
    flights,
    cached: false,
    updatedAt: new Date().toISOString(),
    totalCount: flights.length,
    currencyCode: flights[0]?.currency ?? 'EUR',
  });
}

async function handleOpenJawSearch(
  origins: string[],
  destinations: string[],
  outboundDate: string,
  returnDate: string,
  passengers: { type: 'adult' | 'child' | 'infant_without_seat' }[],
  cabin: CabinClass
): Promise<NextResponse> {
  const topOrigins = origins.slice(0, 5);
  const topDestinations = destinations.slice(0, 5);

  // Search all origin→destination pairs for outbound
  const outboundPairs: [string, string][] = [];
  for (const o of topOrigins) {
    for (const d of topDestinations) {
      outboundPairs.push([o, d]);
    }
  }

  // Search all destination→origin pairs for return
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
      outboundOffers.push(
        ...(result.value.offers ?? []).filter(isValidOffer).map(normalizeDuffelOffer)
      );
    }
  }

  const returnOffers: FlightOffer[] = [];
  for (const result of returnResults) {
    if (result.status === 'fulfilled') {
      returnOffers.push(
        ...(result.value.offers ?? []).filter(isValidOffer).map(normalizeDuffelOffer)
      );
    }
  }

  // Group outbound by destination airport, return by origin airport (the hub connecting them)
  const outboundByDest = groupBy(outboundOffers, o => o.destination);
  const returnByOrigin = groupBy(returnOffers, r => r.origin);

  const combinations: OpenJawCombination[] = [];

  for (const [hubAirport, outbounds] of outboundByDest) {
    const returns = returnByOrigin.get(hubAirport) ?? [];
    if (returns.length === 0) continue;

    const bestOutbound = outbounds.reduce((a, b) => a.price < b.price ? a : b);
    const bestReturn = returns.reduce((a, b) => a.price < b.price ? a : b);

    combinations.push({
      outbound: bestOutbound,
      return: bestReturn,
      totalPrice: bestOutbound.price + bestReturn.price,
      isOpenJaw: bestOutbound.origin !== bestReturn.destination,
    });
  }

  const sorted = combinations
    .sort((a, b) => a.totalPrice - b.totalPrice)
    .slice(0, 20);

  return NextResponse.json({
    flights: sorted,
    mode: 'open-jaw',
    cached: false,
    updatedAt: new Date().toISOString(),
    totalCount: sorted.length,
  });
}

function groupBy<T>(arr: T[], keyFn: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of arr) {
    const key = keyFn(item);
    const existing = map.get(key);
    if (existing) existing.push(item);
    else map.set(key, [item]);
  }
  return map;
}
