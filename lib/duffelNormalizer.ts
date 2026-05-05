import airportsData from '@/lib/data/airports.json';
import type { FlightOffer, FlightSegment, Layover } from './types';

const airports = airportsData as { code: string; city: string }[];

function getCityName(iata: string): string {
  return airports.find(a => a.code === iata)?.city ?? iata;
}

function segmentDuration(departureAt: string, arrivalAt: string): string {
  const mins = Math.round((new Date(arrivalAt).getTime() - new Date(departureAt).getTime()) / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function normalizeDuffelOffer(offer: any): FlightOffer {
  const firstSlice = offer.slices[0];
  const firstSegment = firstSlice.segments[0];
  const lastOutboundSegment = firstSlice.segments[firstSlice.segments.length - 1];

  const stops = firstSlice.segments.length - 1;

  const primaryAirline = firstSegment.marketing_carrier?.iata_code ?? '';
  const primaryAirlineName = firstSegment.marketing_carrier?.name ?? primaryAirline;
  const flightNumber = `${primaryAirline}${firstSegment.marketing_carrier_flight_number ?? ''}`;

  const baggageAllowances: any[] = offer.passengers?.[0]?.baggages ?? [];
  const baggageIncluded = baggageAllowances.some(b => b.type === 'checked' && b.quantity > 0);
  const carryOnIncluded = baggageAllowances.some(b => b.type === 'carry_on' && b.quantity > 0);

  const duration = firstSlice.duration ? parseDuration(firstSlice.duration) : null;

  const origin = firstSegment.origin?.iata_code ?? firstSegment.origin?.id ?? '';
  const destination = lastOutboundSegment.destination?.iata_code ?? lastOutboundSegment.destination?.id ?? '';
  const date = firstSegment.departing_at?.slice(0, 10) ?? '';

  const bookingUrl = `https://www.google.com/travel/flights?q=flights+from+${origin}+to+${destination}+on+${date}`;

  const segments: FlightSegment[] = firstSlice.segments.map((seg: any) => {
    const segOrigin = seg.origin?.iata_code ?? seg.origin?.id ?? '';
    const segDest = seg.destination?.iata_code ?? seg.destination?.id ?? '';
    return {
      flightNumber: `${seg.marketing_carrier?.iata_code ?? ''}${seg.marketing_carrier_flight_number ?? ''}`,
      origin: segOrigin,
      originCity: seg.origin?.city_name ?? getCityName(segOrigin),
      destination: segDest,
      destinationCity: seg.destination?.city_name ?? getCityName(segDest),
      departureAt: seg.departing_at,
      arrivalAt: seg.arriving_at,
      duration: segmentDuration(seg.departing_at, seg.arriving_at),
      airline: seg.marketing_carrier?.name ?? seg.marketing_carrier?.iata_code ?? '',
      airlineCode: seg.marketing_carrier?.iata_code ?? '',
      aircraft: seg.aircraft?.name ?? null,
    };
  });

  const layovers: Layover[] = segments.slice(0, -1).map((seg, i) => {
    const durationMinutes = Math.round(
      (new Date(segments[i + 1].departureAt).getTime() - new Date(seg.arrivalAt).getTime()) / 60000
    );
    const h = Math.floor(durationMinutes / 60);
    const m = durationMinutes % 60;
    return {
      airport: seg.destination,
      airportCity: getCityName(seg.destination),
      durationMinutes,
      durationLabel: m > 0 ? `${h}h ${m}m` : `${h}h`,
    };
  });

  // Return slice (round-trip)
  const returnSlice = offer.slices.length > 1 ? offer.slices[1] : null;
  const returnFirstSeg = returnSlice?.segments[0] ?? null;
  const returnLastSeg = returnSlice
    ? returnSlice.segments[returnSlice.segments.length - 1]
    : null;

  return {
    id: offer.id,
    price: parseFloat(offer.total_amount),
    currency: offer.total_currency,
    airline: primaryAirline,
    airlineName: primaryAirlineName,
    airlineLogo: `https://pics.avs.io/200/200/${primaryAirline}.png`,
    flightNumber,
    departureAt: firstSegment.departing_at,
    arrivalAt: lastOutboundSegment.arriving_at,
    returnAt: returnFirstSeg?.departing_at ?? null,
    returnArrivalAt: returnLastSeg?.arriving_at ?? null,
    returnDuration: returnSlice?.duration ? parseDuration(returnSlice.duration) : null,
    returnStops: returnSlice ? returnSlice.segments.length - 1 : null,
    returnAirline: returnFirstSeg?.marketing_carrier?.iata_code ?? null,
    returnAirlineName: returnFirstSeg?.marketing_carrier?.name ?? null,
    returnFlightNumber: returnFirstSeg
      ? `${returnFirstSeg.marketing_carrier?.iata_code ?? ''}${returnFirstSeg.marketing_carrier_flight_number ?? ''}`
      : null,
    expiresAt: offer.expires_at,
    stops,
    origin,
    destination,
    duration,
    bookingUrl,
    baggageIncluded,
    carryOnIncluded,
    aircraft: firstSegment.aircraft?.name ?? null,
    segments,
    layovers: layovers.length > 0 ? layovers : undefined,
    source: 'duffel',
    badges: [],
    updatedAt: new Date().toISOString(),
  };
}

// Parse ISO 8601 duration (e.g. PT2H35M) to minutes
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return 0;
  return parseInt(match[1] ?? '0') * 60 + parseInt(match[2] ?? '0');
}

export function isValidOffer(offer: any): boolean {
  const firstSlice = offer.slices?.[0];
  const firstSegment = firstSlice?.segments?.[0];
  if (!firstSegment) return false;

  // Drop Duffel test airline
  if ((firstSegment.marketing_carrier?.iata_code ?? '') === 'ZZ') return false;

  // Drop midnight departures — always bad test data
  if ((firstSegment.departing_at ?? '').includes('T00:00:00')) return false;

  // Drop implausible direct flights over 13h (European departures can't reach
  // Southeast Asia non-stop; real max is ~12h30m LHR→SIN)
  const isDirectFlight = firstSlice.segments.length === 1;
  if (isDirectFlight && firstSlice.duration && parseDuration(firstSlice.duration) > 13 * 60) return false;

  return true;
}
