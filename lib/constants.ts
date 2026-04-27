import type { Alliance, CabinClass } from './types';

type AircraftCategory = 'WIDE_BODY' | 'NARROW_BODY' | 'REGIONAL' | 'TURBOPROP';

export const CABIN_CLASSES: { value: CabinClass; label: string }[] = [
  { value: 'ECONOMY', label: 'Economy' },
  { value: 'PREMIUM_ECONOMY', label: 'Premium Economy' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'FIRST', label: 'First' },
];

export const ALLIANCES: { value: Alliance; label: string; airlines: string[] }[] = [
  {
    value: 'STAR_ALLIANCE',
    label: 'Star Alliance',
    airlines: ['UA', 'LH', 'AC', 'TG', 'NH', 'OS', 'AV', 'SN', 'A3', 'AI', 'CA', 'MS', 'ET', 'EW', 'OU', 'BR', 'LO', 'SK', 'SQ', 'TP', 'TK', 'ZH'],
  },
  {
    value: 'ONEWORLD',
    label: 'Oneworld',
    airlines: ['AA', 'BA', 'IB', 'QR', 'CX', 'JL', 'MH', 'AY', 'AT', 'UL', 'QF', 'AS', 'RJ', 'SB'],
  },
  {
    value: 'SKYTEAM',
    label: 'SkyTeam',
    airlines: ['AF', 'KL', 'DL', 'KE', 'MU', 'CI', 'CZ', 'AZ', 'AM', 'GA', 'ME', 'OK', 'RO', 'SU', 'UX', 'VN'],
  },
];

export const AIRCRAFT_CATEGORIES: { value: AircraftCategory; label: string }[] = [
  { value: 'WIDE_BODY', label: 'Wide-body' },
  { value: 'NARROW_BODY', label: 'Narrow-body' },
  { value: 'REGIONAL', label: 'Regional' },
  { value: 'TURBOPROP', label: 'Turboprop' },
];

export const AIRCRAFT_TYPES: { code: string; name: string; category: AircraftCategory }[] = [
  { code: '388', name: 'Airbus A380', category: 'WIDE_BODY' },
  { code: '359', name: 'Airbus A350-900', category: 'WIDE_BODY' },
  { code: '351', name: 'Airbus A350-1000', category: 'WIDE_BODY' },
  { code: '333', name: 'Airbus A330-300', category: 'WIDE_BODY' },
  { code: '332', name: 'Airbus A330-200', category: 'WIDE_BODY' },
  { code: '789', name: 'Boeing 787-9', category: 'WIDE_BODY' },
  { code: '788', name: 'Boeing 787-8', category: 'WIDE_BODY' },
  { code: '77W', name: 'Boeing 777-300ER', category: 'WIDE_BODY' },
  { code: '772', name: 'Boeing 777-200', category: 'WIDE_BODY' },
  { code: '32N', name: 'Airbus A320neo', category: 'NARROW_BODY' },
  { code: '321', name: 'Airbus A321', category: 'NARROW_BODY' },
  { code: '320', name: 'Airbus A320', category: 'NARROW_BODY' },
  { code: '319', name: 'Airbus A319', category: 'NARROW_BODY' },
  { code: '7M9', name: 'Boeing 737 MAX 9', category: 'NARROW_BODY' },
  { code: '73H', name: 'Boeing 737-800', category: 'NARROW_BODY' },
  { code: 'E90', name: 'Embraer E190', category: 'REGIONAL' },
  { code: 'E75', name: 'Embraer E175', category: 'REGIONAL' },
  { code: 'CR9', name: 'Bombardier CRJ-900', category: 'REGIONAL' },
  { code: 'AT7', name: 'ATR 72', category: 'TURBOPROP' },
];

export const COUNTRY_FLAG_MAP: Record<string, string> = {
  ES: '🇪🇸', GB: '🇬🇧', FR: '🇫🇷', DE: '🇩🇪', IT: '🇮🇹', PT: '🇵🇹',
  US: '🇺🇸', CA: '🇨🇦', MX: '🇲🇽', BR: '🇧🇷', AR: '🇦🇷', CL: '🇨🇱',
  JP: '🇯🇵', CN: '🇨🇳', KR: '🇰🇷', IN: '🇮🇳', AU: '🇦🇺', NZ: '🇳🇿',
  AE: '🇦🇪', QA: '🇶🇦', SA: '🇸🇦', TR: '🇹🇷', EG: '🇪🇬', MA: '🇲🇦',
  NL: '🇳🇱', BE: '🇧🇪', CH: '🇨🇭', AT: '🇦🇹', PL: '🇵🇱', SE: '🇸🇪',
  NO: '🇳🇴', DK: '🇩🇰', FI: '🇫🇮', GR: '🇬🇷', RO: '🇷🇴', CZ: '🇨🇿',
  HU: '🇭🇺', TH: '🇹🇭', SG: '🇸🇬', MY: '🇲🇾', ID: '🇮🇩', PH: '🇵🇭',
  ZA: '🇿🇦', NG: '🇳🇬', KE: '🇰🇪', ET: '🇪🇹', RU: '🇷🇺', UA: '🇺🇦',
};

export const DEFAULT_FILTER_STATE = {
  priceMin: 0,
  priceMax: 10000,
  stops: [] as ('direct' | '1' | '2+')[],
  airlines: [] as string[],
  departureTimeMin: 0,
  departureTimeMax: 23 * 60 + 59,
  avoidRedEye: false,
};

export const SORT_OPTIONS = [
  { value: 'best', label: 'Best' },
  { value: 'cheapest', label: 'Cheapest' },
  { value: 'fastest', label: 'Fastest' },
  { value: 'fewest-stops', label: 'Fewest stops' },
] as const;

export type SortOption = typeof SORT_OPTIONS[number]['value'];
