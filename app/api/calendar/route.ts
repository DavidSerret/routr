import { NextRequest, NextResponse } from 'next/server';
import { getCache, setCache, TTL } from '@/lib/cache';
import { fetchCalendarPrices } from '@/lib/travelpayouts';
import type { CalendarDay } from '@/lib/types';

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.searchParams.get('origin');
  const destination = req.nextUrl.searchParams.get('destination');
  const month = req.nextUrl.searchParams.get('month');
  const currency = req.nextUrl.searchParams.get('currency') ?? 'EUR';

  if (!origin || !destination || !month) {
    return NextResponse.json({ error: 'Missing origin, destination, or month' }, { status: 400 });
  }

  const cacheKey = `tp:calendar:${origin}:${destination}:${month}:${currency}`;
  const cached = await getCache<{ days: CalendarDay[]; updatedAt: string }>(cacheKey);
  if (cached) {
    return NextResponse.json({ ...cached, cached: true });
  }

  try {
    const tickets = await fetchCalendarPrices(origin, destination, month, currency);

    const days: CalendarDay[] = tickets.map(t => ({
      date: t.departure_at.slice(0, 10),
      price: t.price,
      currency,
      stops: t.transfers,
      airline: t.airline,
    }));

    days.sort((a, b) => a.date.localeCompare(b.date));

    const payload = { days, updatedAt: new Date().toISOString() };
    await setCache(cacheKey, payload, TTL.CALENDAR);
    return NextResponse.json({ ...payload, cached: false });
  } catch (err) {
    console.error('Calendar fetch error:', err);
    return NextResponse.json({ days: [], updatedAt: new Date().toISOString(), cached: false });
  }
}
