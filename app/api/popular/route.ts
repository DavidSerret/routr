import { NextRequest, NextResponse } from 'next/server';
import { getCache, setCache, TTL } from '@/lib/cache';
import { fetchPopularDestinations, airlineLogoUrl, bookingUrl } from '@/lib/travelpayouts';
import type { PopularDestination } from '@/lib/types';

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.searchParams.get('origin');
  const currency = req.nextUrl.searchParams.get('currency') ?? 'EUR';

  if (!origin) {
    return NextResponse.json({ error: 'Missing origin' }, { status: 400 });
  }

  const cacheKey = `tp:popular:${origin}:${currency}`;
  const cached = await getCache<{ destinations: PopularDestination[]; updatedAt: string }>(cacheKey);
  if (cached) {
    return NextResponse.json({ ...cached, cached: true });
  }

  try {
    const raw = await fetchPopularDestinations(origin, currency);

    const destinations: PopularDestination[] = raw.map(d => ({
      destination: d.destination,
      price: d.price,
      airline: d.airline,
      airlineLogo: airlineLogoUrl(d.airline),
      departureAt: d.departure_at,
      link: bookingUrl(d.link),
    }));

    const payload = { destinations, updatedAt: new Date().toISOString() };
    await setCache(cacheKey, payload, TTL.POPULAR);
    return NextResponse.json({ ...payload, cached: false });
  } catch (err) {
    console.error('Popular destinations error:', err);
    return NextResponse.json({ destinations: [], updatedAt: new Date().toISOString(), cached: false });
  }
}
