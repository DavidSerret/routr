export type TripType = 'one-way' | 'round-trip' | 'multi-city';
export type CabinClass = 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
export type Alliance = 'STAR_ALLIANCE' | 'ONEWORLD' | 'SKYTEAM';

export interface Airport {
  iataCode: string;
  name: string;
  cityName: string;
  countryCode: string;
  countryFlag: string;
  latitude?: number;
  longitude?: number;
}

// Airport search result types returned by /api/airports
export interface AirportResult {
  code: string;
  name: string;
  cityName: string;
  countryCode: string;
  countryName: string;
  isGroup?: false;
}

export interface AirportGroupResult {
  code: string;
  name: string;
  cityName: string;
  countryCode: string;
  isGroup: true;
  groupType: 'continent' | 'subregion' | 'country';
  airports: Array<{ code: string; cityCode: string; countryCode: string }>;
}

export type AirportSearchResult = AirportResult | AirportGroupResult;

export type FlightBadge = 'cheapest' | 'fastest' | 'best-value';

export interface FlightSegment {
  flightNumber: string;
  origin: string;
  originCity: string;
  destination: string;
  destinationCity: string;
  departureAt: string;
  arrivalAt: string;
  duration: string;
  airline: string;
  airlineCode: string;
  aircraft: string | null;
}

export interface Layover {
  airport: string;
  airportCity: string;
  durationMinutes: number;
  durationLabel: string;
}

export interface FlightOffer {
  id: string;
  price: number;
  currency: string;
  airline: string;
  airlineName: string;
  airlineLogo: string;
  flightNumber: string;
  departureAt: string;
  arrivalAt: string;
  returnAt: string | null;
  returnArrivalAt: string | null;
  returnDuration: number | null;
  returnStops: number | null;
  returnAirline: string | null;
  returnAirlineName: string | null;
  returnFlightNumber: string | null;
  expiresAt: string;
  stops: number;
  origin: string;
  destination: string;
  duration: number | null;
  bookingUrl: string;
  baggageIncluded: boolean;
  carryOnIncluded: boolean;
  aircraft: string | null;
  segments: FlightSegment[];
  source: 'duffel' | 'travelpayouts';
  badges: FlightBadge[];
  updatedAt: string;
  layovers?: Layover[];
}

export interface CalendarDay {
  date: string;
  price: number;
  currency: string;
  stops: number;
  airline: string;
}

export interface SearchParams {
  tripType: TripType;
  origins: Airport[];
  destinations: Airport[];
  departureDate: string;
  returnDate?: string;
  adults: number;
  children: number;
  infants: number;
  infantSeatType: 'lap' | 'seat';
  cabinClass: CabinClass;
  flexibleDates: boolean;
  flexibleDaysRange: 1 | 3 | 7;
  multiCityLegs?: MultiCityLeg[];
}

export interface MultiCityLeg {
  id: string;
  origin: Airport | null;
  destination: Airport | null;
  date: string;
}

export interface FilterState {
  priceMin: number;
  priceMax: number;
  stops: ('direct' | '1' | '2+')[];
  airlines: string[];
  departureTimeMin: number;
  departureTimeMax: number;
  avoidRedEye: boolean;
  cabinClass: 'economy' | 'premium_economy' | 'business' | 'first';
}

export interface OpenJawCombination {
  outbound: FlightOffer;
  return: FlightOffer;
  totalPrice: number;
  isOpenJaw: boolean;
  outboundAirport?: string;
  returnAirport?: string;
  distanceKm?: number;
}

export interface MonthlyPrice {
  month: string;
  price: number;
  airline: string;
}

export interface PopularDestination {
  destination: string;
  price: number;
  airline: string;
  airlineLogo: string;
  departureAt: string;
  link: string;
}
