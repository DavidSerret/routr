import airportsData from '@/lib/data/airports.json';

interface AirportEntry {
  code: string;
  lat: number;
  lon: number;
}

const airports = airportsData as AirportEntry[];

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const coordCache = new Map<string, { lat: number; lon: number } | null>();

function getCoords(iata: string): { lat: number; lon: number } | null {
  if (coordCache.has(iata)) return coordCache.get(iata)!;
  const entry = airports.find(a => a.code === iata);
  const result = entry ? { lat: entry.lat, lon: entry.lon } : null;
  coordCache.set(iata, result);
  return result;
}

export function distanceBetweenAirports(iata1: string, iata2: string): number | null {
  if (iata1 === iata2) return 0;
  const a = getCoords(iata1);
  const b = getCoords(iata2);
  if (!a || !b) return null;
  return Math.round(haversineKm(a.lat, a.lon, b.lat, b.lon));
}

export function distanceLabel(km: number): string {
  if (km < 50) return '';
  if (km < 150) return `${km} km apart — easily reachable by train or bus`;
  if (km < 400) return `${km} km apart — consider transport cost`;
  return `${km} km apart — significantly different cities`;
}
