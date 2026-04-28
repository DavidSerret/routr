import { getCache, setCache, TTL } from './cache';
import { fetchAirportsJson } from './travelpayouts';
import type { TpAirport } from './travelpayouts';
import type { TpCity, TpCountry } from './types';

const TP_BASE = 'https://api.travelpayouts.com';

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function getAirports(): Promise<TpAirport[]> {
  const cached = await getCache<TpAirport[]>('tp:static:airports');
  if (cached) return cached;
  const data = await fetchAirportsJson();
  await setCache('tp:static:airports', data, TTL.AIRPORTS);
  return data;
}

export async function getCities(): Promise<TpCity[]> {
  const cached = await getCache<TpCity[]>('tp:static:cities');
  if (cached) return cached;
  const data = await fetchJson<TpCity[]>(`${TP_BASE}/data/en/cities.json`);
  await setCache('tp:static:cities', data, TTL.AIRPORTS);
  return data;
}

export async function getCountries(): Promise<TpCountry[]> {
  const cached = await getCache<TpCountry[]>('tp:static:countries');
  if (cached) return cached;
  const data = await fetchJson<TpCountry[]>(`${TP_BASE}/data/en/countries.json`);
  await setCache('tp:static:countries', data, TTL.AIRPORTS);
  return data;
}
