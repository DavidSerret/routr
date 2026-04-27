import { NextRequest, NextResponse } from 'next/server';
import { getCache, setCache, TTL } from '@/lib/cache';
import { fetchAirportsJson } from '@/lib/travelpayouts';
import { COUNTRY_FLAG_MAP } from '@/lib/constants';
import type { Airport } from '@/lib/types';

const AIRPORTS_CACHE_KEY = 'tp:airports:all';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim().toLowerCase();
  const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '8', 10);

  if (!q || q.length < 2) {
    return NextResponse.json({ airports: [] });
  }

  try {
    let rawAirports = await getCache<ReturnType<typeof fetchAirportsJson> extends Promise<infer T> ? T : never>(AIRPORTS_CACHE_KEY);
    if (!rawAirports) {
      rawAirports = await fetchAirportsJson();
      await setCache(AIRPORTS_CACHE_KEY, rawAirports, TTL.AIRPORTS);
    }

    const nameEn = (a: typeof rawAirports[number]) =>
      a.name_translations?.en || a.name;

    const airports: Airport[] = (rawAirports ?? [])
      .filter(a =>
        a.code &&
        a.flightable &&
        (
          a.code.toLowerCase().includes(q) ||
          a.city_code?.toLowerCase().includes(q) ||
          nameEn(a)?.toLowerCase().includes(q)
        )
      )
      .slice(0, limit)
      .map(a => ({
        iataCode: a.code,
        name: nameEn(a) ?? a.code,
        cityName: a.city_code,
        countryCode: a.country_code,
        countryFlag: COUNTRY_FLAG_MAP[a.country_code] ?? '🌍',
        latitude: a.coordinates?.lat,
        longitude: a.coordinates?.lon,
      }));

    return NextResponse.json({ airports });
  } catch (err) {
    console.error('Airport search error:', err);
    return NextResponse.json({ airports: [] });
  }
}
