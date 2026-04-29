import airportsData from './data/airports.json';

export interface CuratedAirport {
  code: string;
  name: string;
  city: string;
  city_es: string;
  cc: string;
  country: string;
  country_es: string;
  lat: number;
  lon: number;
}

export function getAirports(): CuratedAirport[] {
  return airportsData as CuratedAirport[];
}
