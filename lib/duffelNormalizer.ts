import type { FlightOffer, FlightSegment } from './types';

export function normalizeDuffelOffer(offer: any): FlightOffer {
  const firstSlice = offer.slices[0];
  const lastSlice = offer.slices[offer.slices.length - 1];
  const firstSegment = firstSlice.segments[0];
  const lastSegment = lastSlice.segments[lastSlice.segments.length - 1];

  const stops = firstSlice.segments.length - 1;

  const primaryAirline = firstSegment.marketing_carrier?.iata_code ?? '';
  const primaryAirlineName = firstSegment.marketing_carrier?.name ?? primaryAirline;
  const flightNumber = `${primaryAirline}${firstSegment.marketing_carrier_flight_number ?? ''}`;

  const baggageAllowances: any[] = offer.passengers?.[0]?.baggages ?? [];
  const baggageIncluded = baggageAllowances.some(b => b.type === 'checked' && b.quantity > 0);
  const carryOnIncluded = baggageAllowances.some(b => b.type === 'carry_on' && b.quantity > 0);

  const duration = firstSlice.duration ? parseDuration(firstSlice.duration) : null;

  const origin = firstSegment.origin?.iata_code ?? firstSegment.origin?.id ?? '';
  const destination = lastSegment.destination?.iata_code ?? lastSegment.destination?.id ?? '';
  const date = firstSegment.departing_at?.slice(0, 10) ?? '';

  const bookingUrl = `https://www.google.com/travel/flights?q=flights+from+${origin}+to+${destination}+on+${date}`;

  const segments: FlightSegment[] = firstSlice.segments.map((seg: any) => ({
    flightNumber: `${seg.marketing_carrier?.iata_code ?? ''}${seg.marketing_carrier_flight_number ?? ''}`,
    origin: seg.origin?.iata_code ?? seg.origin?.id ?? '',
    destination: seg.destination?.iata_code ?? seg.destination?.id ?? '',
    departureAt: seg.departing_at,
    arrivalAt: seg.arriving_at,
    airline: seg.marketing_carrier?.iata_code ?? '',
    aircraft: seg.aircraft?.name ?? null,
  }));

  return {
    id: offer.id,
    price: parseFloat(offer.total_amount),
    currency: offer.total_currency,
    airline: primaryAirline,
    airlineName: primaryAirlineName,
    airlineLogo: `https://pics.avs.io/200/200/${primaryAirline}.png`,
    flightNumber,
    departureAt: firstSegment.departing_at,
    arrivalAt: lastSegment.arriving_at,
    returnAt: offer.slices.length > 1
      ? offer.slices[1].segments[0].departing_at
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
