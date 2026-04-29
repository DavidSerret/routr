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

export interface FlightOffer {
  id: string;
  price: number;
  currency: string;
  airline: string;
  airlineName: string;
  airlineLogo: string;
  flightNumber: number;
  departureAt: string;
  returnAt: string | null;
  expiresAt: string;
  stops: number;
  origin: string;
  destination: string;
  bookingUrl: string;
  source: 'travelpayouts';
  badges: FlightBadge[];
  updatedAt: string;
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
