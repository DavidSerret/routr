import { NextRequest, NextResponse } from 'next/server';
import { getAirports } from '@/lib/staticData';
import { buildGeographicGroups } from '@/lib/geographicGroups';
import type { AirportSearchResult, AirportResult } from '@/lib/types';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '8', 10);

  if (q.length < 1) return NextResponse.json([]);

  const airports = getAirports();
  const query = q.toLowerCase();

  // 1. Geographic groups (shown first, min 3 chars)
  const groups = buildGeographicGroups(query, airports);

  // 2. Individual airport matches
  const individualResults: AirportResult[] = airports
    .filter(airport => {
      const candidates = [
        airport.code,
        airport.name,
        airport.city,
        airport.city_es,
        airport.country,
        airport.country_es,
        airport.cc,
      ];
      return candidates.some(s => s?.toLowerCase().includes(query));
    })
    .slice(0, limit)
    .map(airport => ({
      code: airport.code,
      name: airport.name,
      cityName: airport.city,
      countryCode: airport.cc,
      countryName: airport.country,
      isGroup: false as const,
    }));

  const combined: AirportSearchResult[] = [
    ...groups.slice(0, 2),
    ...individualResults,
  ].slice(0, limit + 2);

  return NextResponse.json(combined);
}
