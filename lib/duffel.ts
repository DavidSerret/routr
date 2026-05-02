const DUFFEL_BASE = 'https://api.duffel.com';

function getToken(): string {
  return process.env.DUFFEL_API_TOKEN!;
}

function duffelHeaders() {
  return {
    'Authorization': `Bearer ${getToken()}`,
    'Duffel-Version': 'v2',
    'Content-Type': 'application/json',
    'Accept-Encoding': 'gzip',
  };
}

export interface DuffelSlice {
  origin: string;
  destination: string;
  departure_date: string; // YYYY-MM-DD
}

export interface DuffelSearchParams {
  slices: DuffelSlice[];
  passengers: { type: 'adult' | 'child' | 'infant_without_seat' }[];
  cabin_class: 'economy' | 'premium_economy' | 'business' | 'first';
}

export async function searchFlights(params: DuffelSearchParams) {
  const body = {
    data: {
      cabin_class: params.cabin_class,
      slices: params.slices,
      passengers: params.passengers,
    },
  };

  const res = await fetch(`${DUFFEL_BASE}/air/offer_requests?return_offers=true`, {
    method: 'POST',
    headers: duffelHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(`Duffel API error: ${res.status} — ${JSON.stringify(error)}`);
  }

  const data = await res.json();
  return data.data;
}
