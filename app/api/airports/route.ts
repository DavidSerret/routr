import { NextRequest, NextResponse } from 'next/server';
import { getAirports, getCities, getCountries } from '@/lib/staticData';
import { buildGeographicGroups } from '@/lib/geographicGroups';
import { isRealAirport, countryCodeToFlag } from '@/lib/airportUtils';
import type { AirportSearchResult, AirportResult } from '@/lib/types';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '8', 10);

  if (q.length < 1) return NextResponse.json([]);

  try {
    const [airports, cities, countries] = await Promise.all([
      getAirports(),
      getCities(),
      getCountries(),
    ]);

    const query = q.toLowerCase();
    const realAirports = airports.filter(isRealAirport);

    const cityMap = new Map(cities.map(c => [c.code, c]));
    const countryMap = new Map(countries.map(c => [c.code, c]));

    // 1. Geographic groups (shown first, min 3 chars)
    const groups = buildGeographicGroups(query, realAirports, countries);

    // 2. Individual airport matches
    const individualResults: AirportResult[] = realAirports
      .filter(airport => {
        const city = cityMap.get(airport.city_code);
        const country = countryMap.get(airport.country_code);
        const candidates = [
          airport.code,
          airport.name,
          airport.city_code,
          airport.country_code,
          airport.name_translations?.en,
          airport.name_translations?.es,
          airport.name_translations?.de,
          airport.name_translations?.fr,
          airport.name_translations?.it,
          airport.name_translations?.ru,
          city?.name,
          city?.name_translations?.['en'],
          city?.name_translations?.['es'],
          country?.name,
          country?.name_translations?.['en'],
          country?.name_translations?.['es'],
        ];
        return candidates.some(s => s?.toLowerCase().includes(query));
      })
      .slice(0, limit)
      .map(airport => {
        const city = cityMap.get(airport.city_code);
        const country = countryMap.get(airport.country_code);
        return {
          code: airport.code,
          name: airport.name_translations?.en ?? airport.name,
          cityName: city?.name_translations?.['en'] ?? city?.name ?? airport.city_code,
          countryCode: airport.country_code,
          countryName: country?.name ?? airport.country_code,
          isGroup: false as const,
        };
      });

    const combined: AirportSearchResult[] = [
      ...groups.slice(0, 2),
      ...individualResults,
    ].slice(0, limit + 2);

    return NextResponse.json(combined);
  } catch (err) {
    console.error('Airport search error:', err);
    return NextResponse.json([]);
  }
}
