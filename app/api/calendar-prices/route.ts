import { NextRequest, NextResponse } from 'next/server';
import { searchFlights } from '@/lib/duffel';
import { isValidOffer } from '@/lib/duffelNormalizer';
import { getCache, setCache, TTL } from '@/lib/cache';

async function fetchPriceForDate(
  origin: string,
  destination: string,
  date: string,
  cabin: string,
  adults: number,
): Promise<{ date: string; price: number | null; currency: string }> {
  try {
    const passengers = Array(adults).fill({ type: 'adult' as const });
    const result = await searchFlights({
      slices: [{ origin, destination, departure_date: date }],
      passengers,
      cabin_class: cabin as 'economy' | 'premium_economy' | 'business' | 'first',
      limit: 10,
    });

    const validOffers = (result.offers ?? []).filter(isValidOffer);
    if (validOffers.length === 0) return { date, price: null, currency: 'EUR' };

    const cheapest = validOffers.reduce((a: any, b: any) =>
      parseFloat(a.total_amount) < parseFloat(b.total_amount) ? a : b,
    );

    return {
      date,
      price: parseFloat(cheapest.total_amount),
      currency: cheapest.total_currency ?? 'EUR',
    };
  } catch {
    return { date, price: null, currency: 'EUR' };
  }
}

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const origin = p.get('origin');
  const destination = p.get('destination');
  const month = p.get('month'); // yyyy-MM
  const cabin = p.get('cabin') ?? 'economy';
  const adults = Math.max(1, parseInt(p.get('adults') ?? '1', 10));

  if (!origin || !destination || !month) {
    return NextResponse.json({ error: 'Missing required params: origin, destination, month' }, { status: 400 });
  }

  const cacheKey = `cal-prices:v1:${origin}:${destination}:${month}:${cabin}:${adults}`;
  const cached = await getCache<object>(cacheKey);
  if (cached) return NextResponse.json({ ...cached, cached: true });

  // Generate all future dates in the month
  const parts = month.split('-');
  const year = parseInt(parts[0], 10);
  const monthNum = parseInt(parts[1], 10); // 1-based

  const todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  const daysInMonth = new Date(year, monthNum, 0).getDate();
  const dates: string[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    if (dateStr >= todayStr) dates.push(dateStr);
  }

  if (dates.length === 0) {
    return NextResponse.json({ dayPrices: {}, currency: 'EUR', updatedAt: new Date().toISOString(), cached: false });
  }

  // Batch in groups of 10, parallel within each batch
  const BATCH_SIZE = 10;
  const dayPrices: Record<string, number> = {};
  let currency = 'EUR';

  for (let i = 0; i < dates.length; i += BATCH_SIZE) {
    const batch = dates.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map(date => fetchPriceForDate(origin, destination, date, cabin, adults)),
    );
    for (const r of results) {
      if (r.price !== null) {
        dayPrices[r.date] = r.price;
        currency = r.currency;
      }
    }
  }

  const response = {
    dayPrices,
    currency,
    updatedAt: new Date().toISOString(),
  };

  if (Object.keys(dayPrices).length > 0) {
    await setCache(cacheKey, response, TTL.CALENDAR_PRICES);
  }

  return NextResponse.json({ ...response, cached: false });
}
