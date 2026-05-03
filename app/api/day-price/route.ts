import { NextRequest, NextResponse } from 'next/server';
import { searchFlights } from '@/lib/duffel';
import { normalizeDuffelOffer, isValidOffer } from '@/lib/duffelNormalizer';
import { getCache, setCache } from '@/lib/cache';
import type { FlightOffer } from '@/lib/types';

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const origin = p.get('origin');
  const destination = p.get('destination');
  const date = p.get('date');
  const adults = Math.max(1, parseInt(p.get('adults') ?? '1', 10));
  const cabin = (p.get('cabin') ?? 'economy') as 'economy' | 'premium_economy' | 'business' | 'first';

  if (!origin || !destination || !date) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }

  const cacheKey = `duffel:day:v1:${origin}:${destination}:${date}:${adults}:${cabin}`;
  const cached = await getCache<object>(cacheKey);
  if (cached) return NextResponse.json({ ...cached, cached: true });

  try {
    const result = await searchFlights({
      slices: [{ origin, destination, departure_date: date }],
      passengers: Array(adults).fill({ type: 'adult' as const }),
      cabin_class: cabin,
      limit: 10,
    });

    const offers: FlightOffer[] = (result.offers ?? [])
      .filter(isValidOffer)
      .map(normalizeDuffelOffer);

    if (offers.length === 0) {
      await setCache(cacheKey, { date, price: null }, 60 * 60);
      return NextResponse.json({ date, price: null, cached: false });
    }

    const cheapest = offers.reduce((a, b) => a.price < b.price ? a : b);
    const response = {
      date,
      price: cheapest.price,
      currency: cheapest.currency ?? 'EUR',
      airline: cheapest.airline,
      stops: cheapest.stops,
    };

    await setCache(cacheKey, response, 60 * 60 * 6);
    return NextResponse.json({ ...response, cached: false });
  } catch {
    // Return 200 with null price so client can distinguish "loaded, no flights" from "still loading"
    return NextResponse.json({ date, price: null, cached: false });
  }
}
