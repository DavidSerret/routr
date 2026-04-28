import type { TpAirport } from './travelpayouts';

export function isRealAirport(airport: TpAirport): boolean {
  if (!airport.code || !/^[A-Z]{3}$/.test(airport.code)) return false;
  if (!airport.country_code) return false;
  if (!airport.coordinates?.lat || !airport.coordinates?.lon) return false;
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
