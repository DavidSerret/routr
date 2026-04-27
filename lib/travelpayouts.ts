const TP_TOKEN = process.env.TRAVELPAYOUTS_TOKEN!;
const TP_BASE = 'https://api.travelpayouts.com';

const tpHeaders = {
  'X-Access-Token': TP_TOKEN,
  'Accept-Encoding': 'gzip, deflate',
};

export interface TpCheapTicket {
  price: number;
  airline: string;
  flight_number: number;
  departure_at: string;
  return_at: string | null;
  expires_at: string;
  transfers: number;
  return_transfers: number;
  link: string;
}

export interface TpCalendarTicket {
  price: number;
  airline: string;
  transfers: number;
  departure_at: string;
}

export interface TpMonthlyTicket {
  price: number;
  airline: string;
  departure_at: string;
  return_at: string | null;
  expires_at: string;
}

export interface TpDestination {
  destination: string;
  origin: string;
  price: number;
  airline: string;
  departure_at: string;
  return_at: string | null;
  duration: number;
  link: string;
}

export interface TpAirport {
  iata_code: string;
  name: string;
  name_en: string;
  city_code: string;
  city_name: string;
  country_code: string;
  coordinates: { lon: number; lat: number };
}

export async function fetchCheapTickets(
  origin: string,
  destination: string,
  departDate: string,
  returnDate?: string,
  currency = 'EUR'
): Promise<TpCheapTicket[]> {
  const params = new URLSearchParams({
    origin,
    destination,
    depart_date: departDate,
    currency,
    token: TP_TOKEN,
  });
  if (returnDate) params.set('return_date', returnDate);

  const res = await fetch(`${TP_BASE}/v1/prices/cheap?${params}`, { headers: tpHeaders });
  if (!res.ok) throw new Error(`TP cheap tickets error: ${res.status}`);
  const json = await res.json() as { success: boolean; data: Record<string, Record<string, TpCheapTicket>>; currency: string };
  if (!json.success || !json.data) return [];

  const tickets: TpCheapTicket[] = [];
  for (const destData of Object.values(json.data)) {
    for (const ticket of Object.values(destData)) {
      tickets.push(ticket);
    }
  }
  return tickets;
}

export async function fetchDirectTickets(
  origin: string,
  destination: string,
  departDate: string,
  currency = 'EUR'
): Promise<TpCheapTicket[]> {
  const params = new URLSearchParams({
    origin,
    destination,
    depart_date: departDate,
    currency,
    token: TP_TOKEN,
  });

  const res = await fetch(`${TP_BASE}/v1/prices/direct?${params}`, { headers: tpHeaders });
  if (!res.ok) throw new Error(`TP direct tickets error: ${res.status}`);
  const json = await res.json() as { success: boolean; data: Record<string, Record<string, TpCheapTicket>>; currency: string };
  if (!json.success || !json.data) return [];

  const tickets: TpCheapTicket[] = [];
  for (const destData of Object.values(json.data)) {
    for (const ticket of Object.values(destData)) {
      tickets.push(ticket);
    }
  }
  return tickets;
}

export async function fetchCalendarPrices(
  origin: string,
  destination: string,
  month: string,
  currency = 'EUR'
): Promise<TpCalendarTicket[]> {
  const params = new URLSearchParams({
    origin,
    destination,
    depart_date: month,
    calendar_type: 'departure_date',
    currency,
    token: TP_TOKEN,
  });

  const res = await fetch(`${TP_BASE}/v1/prices/calendar?${params}`, { headers: tpHeaders });
  if (!res.ok) throw new Error(`TP calendar error: ${res.status}`);
  const json = await res.json() as { success: boolean; data: Record<string, TpCalendarTicket>; currency: string };
  if (!json.success || !json.data) return [];

  return Object.values(json.data);
}

export async function fetchMonthlyPrices(
  origin: string,
  destination: string,
  currency = 'EUR'
): Promise<TpMonthlyTicket[]> {
  const params = new URLSearchParams({
    origin,
    destination,
    currency,
    token: TP_TOKEN,
  });

  const res = await fetch(`${TP_BASE}/v1/prices/monthly?${params}`, { headers: tpHeaders });
  if (!res.ok) throw new Error(`TP monthly error: ${res.status}`);
  const json = await res.json() as { success: boolean; data: Record<string, TpMonthlyTicket>; currency: string };
  if (!json.success || !json.data) return [];

  return Object.values(json.data);
}

export async function fetchPopularDestinations(
  origin: string,
  currency = 'EUR'
): Promise<TpDestination[]> {
  const params = new URLSearchParams({
    origin,
    currency,
    token: TP_TOKEN,
  });

  const res = await fetch(`${TP_BASE}/v1/city-directions?${params}`, { headers: tpHeaders });
  if (!res.ok) throw new Error(`TP city-directions error: ${res.status}`);
  const json = await res.json() as { success: boolean; data: Record<string, TpDestination>; currency: string };
  if (!json.success || !json.data) return [];

  return Object.values(json.data);
}

let airportsCache: TpAirport[] | null = null;

export async function fetchAirportsJson(): Promise<TpAirport[]> {
  if (airportsCache) return airportsCache;
  const res = await fetch(`${TP_BASE}/data/en/airports.json`, { headers: tpHeaders });
  if (!res.ok) throw new Error(`TP airports.json error: ${res.status}`);
  airportsCache = await res.json() as TpAirport[];
  return airportsCache!;
}

export function airlineLogoUrl(iataCode: string, size = 200): string {
  return `https://pics.avs.io/${size}/${size}/${iataCode}.png`;
}

export function bookingUrl(link: string): string {
  return `https://www.aviasales.com/search/${link.replace(/^\/search\//, '')}`;
}
