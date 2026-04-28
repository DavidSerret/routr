import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { FlightOffer } from "./types";
import { airlineLogoUrl, bookingUrl } from "./travelpayouts";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatTime(isoDatetime: string): string {
  const date = new Date(isoDatetime);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function formatDate(isoDate: string): string {
  const date = new Date(isoDate + (isoDate.includes('T') ? '' : 'T00:00:00'));
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateShort(isoDatetime: string): string {
  return new Date(isoDatetime).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function getStopLabel(count: number): string {
  if (count === 0) return 'Direct';
  if (count === 1) return '1 stop';
  return `${count} stops`;
}

export function getMinutesFromMidnight(isoDatetime: string): number {
  const date = new Date(isoDatetime);
  return date.getHours() * 60 + date.getMinutes();
}

export function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date();
}

type TicketInput = {
  price: number;
  airline: string;
  flight_number: number;
  departure_at: string;
  return_at: string | null;
  expires_at: string;
  transfers: number;
};

export function normalizeTpFlightOffer(
  raw: TicketInput,
  origin: string,
  destination: string,
  currency: string,
  airlineNames: Map<string, string>
): FlightOffer {
  const id = `${raw.airline}-${raw.flight_number}-${raw.departure_at}`;
  const name = airlineNames.get(raw.airline) ?? raw.airline;
  return {
    id,
    price: raw.price,
    currency,
    airline: raw.airline,
    airlineName: name,
    airlineLogo: airlineLogoUrl(raw.airline),
    flightNumber: raw.flight_number,
    departureAt: raw.departure_at,
    returnAt: raw.return_at,
    expiresAt: raw.expires_at,
    stops: raw.transfers,
    origin,
    destination,
    bookingUrl: bookingUrl(origin, destination, raw.departure_at),
    source: 'travelpayouts',
    badges: [],
    updatedAt: new Date().toISOString(),
  };
}

export function assignBadges(flights: FlightOffer[]): FlightOffer[] {
  if (flights.length === 0) return flights;

  const cheapestIdx = flights.reduce((minIdx, f, i) =>
    f.price < flights[minIdx].price ? i : minIdx, 0);

  const fewestStopsIdx = flights.reduce((minIdx, f, i) =>
    f.stops < flights[minIdx].stops ? i : minIdx, 0);

  const scoreFn = (f: FlightOffer) => {
    const maxPrice = Math.max(...flights.map(x => x.price));
    const maxStops = Math.max(...flights.map(x => x.stops));
    return (f.price / (maxPrice || 1)) * 0.7 + (f.stops / (maxStops || 1)) * 0.3;
  };

  const bestIdx = flights.reduce((minIdx, f, i) =>
    scoreFn(f) < scoreFn(flights[minIdx]) ? i : minIdx, 0);

  return flights.map((f, i) => {
    const badges: FlightOffer['badges'] = [];
    if (i === cheapestIdx) badges.push('cheapest');
    else if (i === fewestStopsIdx && fewestStopsIdx !== cheapestIdx) badges.push('fastest');
    else if (i === bestIdx && bestIdx !== cheapestIdx && bestIdx !== fewestStopsIdx) badges.push('best-value');
    return { ...f, badges };
  });
}
