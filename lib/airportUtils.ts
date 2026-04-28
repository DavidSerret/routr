import type { TpAirport } from './travelpayouts';

const NON_AIRPORT_PREFIXES = ['X', 'Q', 'Z'];

const NON_AIRPORT_KEYWORDS = [
  'bus station',
  'bus terminal',
  'railway',
  'train station',
  'rail station',
  'ferry',
  'ferry terminal',
  'port',
  'harbor',
  'harbour',
  'metro',
  'subway',
  'limo',
  'off-line point',
  'off line point',
];

export function isRealAirport(airport: TpAirport): boolean {
  if (!airport.code || !/^[A-Z]{3}$/.test(airport.code)) return false;
  if (!airport.country_code) return false;
  if (!airport.coordinates?.lat || !airport.coordinates?.lon) return false;
  if (NON_AIRPORT_PREFIXES.includes(airport.code[0])) return false;

  const nameLower = (airport.name ?? '').toLowerCase();
  const nameEnLower = (airport.name_translations?.en ?? '').toLowerCase();
  if (NON_AIRPORT_KEYWORDS.some(kw => nameLower.includes(kw) || nameEnLower.includes(kw))) return false;

  return true;
}

export function countryCodeToFlag(code: string): string {
  if (!code || code.length !== 2) return '🌍';
  return code
    .toUpperCase()
    .split('')
    .map(c => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join('');
}
