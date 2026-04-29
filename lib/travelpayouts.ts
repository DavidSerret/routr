const TP_BASE = 'https://api.travelpayouts.com';

function getToken(): string {
  return process.env.TRAVELPAYOUTS_TOKEN ?? '';
}

function tpHeaders(): Record<string, string> {
  return {
    'X-Access-Token': getToken(),
    'Accept-Encoding': 'gzip, deflate',
  };
}

export interface TpCheapTicket {
  price: number;
  airline: string;
  flight_number: number;
  departure_at: string;
  return_at: string | null;
  expires_at: string;
  transfers: number;
  duration: number;
  duration_to: number;
  duration_back: number;
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
  flight_number: number;
  departure_at: string;
  return_at: string | null;
  expires_at: string;
  transfers: number;
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

type RawTicket = Omit<TpCheapTicket, 'transfers'>;

function parseTicketsFromResponse(data: Record<string, Record<string, RawTicket>>): TpCheapTicket[] {
  const tickets: TpCheapTicket[] = [];
  for (const destData of Object.values(data)) {
    for (const [transfersKey, ticket] of Object.entries(destData)) {
      tickets.push({ ...ticket, transfers: parseInt(transfersKey, 10) });
    }
  }
  return tickets;
}

export async function fetchCheapTickets(
  origin: string,
  destination: string,
  departDate: string,
  returnDate?: string,
  currency = 'EUR'
): Promise<TpCheapTicket[]> {
  const token = getToken();
  const params = new URLSearchParams({
    origin,
    destination,
    depart_date: departDate.slice(0, 7), // YYYY-MM — month-level gives more results
    currency,
    token,
  });
  if (returnDate) params.set('return_date', returnDate.slice(0, 7));

  const res = await fetch(`${TP_BASE}/v1/prices/cheap?${params}`, { headers: tpHeaders() });
  if (!res.ok) throw new Error(`TP cheap tickets error: ${res.status} ${await res.text()}`);
  const json = await res.json() as { success: boolean; data: Record<string, Record<string, RawTicket>>; currency: string };
  if (!json.success || !json.data) return [];

  return parseTicketsFromResponse(json.data);
}

export async function fetchDirectTickets(
  origin: string,
  destination: string,
  departDate: string,
  currency = 'EUR'
): Promise<TpCheapTicket[]> {
  const token = getToken();
  const params = new URLSearchParams({
    origin,
    destination,
    depart_date: departDate.slice(0, 7),
    currency,
    token,
  });

  const res = await fetch(`${TP_BASE}/v1/prices/direct?${params}`, { headers: tpHeaders() });
  if (!res.ok) throw new Error(`TP direct tickets error: ${res.status} ${await res.text()}`);
  const json = await res.json() as { success: boolean; data: Record<string, Record<string, RawTicket>>; currency: string };
  if (!json.success || !json.data) return [];

  return parseTicketsFromResponse(json.data);
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
    token: getToken(),
  });

  const res = await fetch(`${TP_BASE}/v1/prices/calendar?${params}`, { headers: tpHeaders() });
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
    token: getToken(),
  });

  const res = await fetch(`${TP_BASE}/v1/prices/monthly?${params}`, { headers: tpHeaders() });
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
    token: getToken(),
  });

  const res = await fetch(`${TP_BASE}/v1/city-directions?${params}`, { headers: tpHeaders() });
  if (!res.ok) throw new Error(`TP city-directions error: ${res.status}`);
  const json = await res.json() as { success: boolean; data: Record<string, TpDestination>; currency: string };
  if (!json.success || !json.data) return [];

  return Object.values(json.data);
}

export function airlineLogoUrl(iataCode: string, size = 200): string {
  return `https://pics.avs.io/${size}/${size}/${iataCode}.png`;
}

export function bookingUrl(origin: string, destination: string, departureAt: string): string {
  const date = departureAt.slice(0, 10).replace(/-/g, '');
  return `https://www.aviasales.com/search/${origin}${date}${destination}1`;
}
