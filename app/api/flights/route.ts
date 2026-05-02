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

    const flights = assignBadges(
      (result.offers ?? [])
        .map(normalizeDuffelOffer)
        .sort((a: { price: number }, b: { price: number }) => a.price - b.price)
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
