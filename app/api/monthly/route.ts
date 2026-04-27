import { NextRequest, NextResponse } from 'next/server';
import { getCache, setCache, TTL } from '@/lib/cache';
import { fetchMonthlyPrices } from '@/lib/travelpayouts';
import type { MonthlyPrice } from '@/lib/types';

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.searchParams.get('origin');
  const destination = req.nextUrl.searchParams.get('destination');
  const currency = req.nextUrl.searchParams.get('currency') ?? 'EUR';

  if (!origin || !destination) {
    return NextResponse.json({ error: 'Missing origin or destination' }, { status: 400 });
  }

  const cacheKey = `tp:monthly:${origin}:${destination}:${currency}`;
  const cached = await getCache<{ months: MonthlyPrice[]; updatedAt: string }>(cacheKey);
  if (cached) {
    return NextResponse.json({ ...cached, cached: true });
  }

  try {
    const tickets = await fetchMonthlyPrices(origin, destination, currency);

    const months: MonthlyPrice[] = tickets.map(t => ({
      month: t.departure_at.slice(0, 7),
      price: t.price,
      airline: t.airline,
    }));

    months.sort((a, b) => a.month.localeCompare(b.month));

    const payload = { months, updatedAt: new Date().toISOString() };
    await setCache(cacheKey, payload, TTL.MONTHLY);
    return NextResponse.json({ ...payload, cached: false });
  } catch (err) {
    console.error('Monthly prices error:', err);
    return NextResponse.json({ months: [], updatedAt: new Date().toISOString(), cached: false });
  }
}
