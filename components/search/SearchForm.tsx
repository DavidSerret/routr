'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowLeftRight, Search } from 'lucide-react';
import { TripTypeToggle } from './TripTypeToggle';
import { AirportMultiSelect } from './AirportMultiSelect';
import { DateRangePicker } from './DateRangePicker';
import { PassengerSelector } from './PassengerSelector';
import { CabinClassSelect } from './CabinClassSelect';
import { cn } from '@/lib/utils';
import type { Airport, TripType, CabinClass } from '@/lib/types';

interface SearchFormProps {
  compact?: boolean;
  initialValues?: {
    origins?: Airport[];
    destinations?: Airport[];
    departureDate?: string;
    returnDate?: string;
    adults?: number;
    children?: number;
    infants?: number;
    cabinClass?: CabinClass;
    tripType?: TripType;
  };
}

export function SearchForm({ compact = false, initialValues }: SearchFormProps) {
  const router = useRouter();
  const [tripType, setTripType] = useState<TripType>(initialValues?.tripType ?? 'round-trip');
  const [origins, setOrigins] = useState<Airport[]>(initialValues?.origins ?? []);
  const [destinations, setDestinations] = useState<Airport[]>(initialValues?.destinations ?? []);
  const [departureDate, setDepartureDate] = useState<Date | null>(
    initialValues?.departureDate ? new Date(initialValues.departureDate) : null
  );
  const [returnDate, setReturnDate] = useState<Date | null>(
    initialValues?.returnDate ? new Date(initialValues.returnDate) : null
  );
  const [adults, setAdults] = useState(initialValues?.adults ?? 1);
  const [children, setChildren] = useState(initialValues?.children ?? 0);
  const [infants, setInfants] = useState(initialValues?.infants ?? 0);
  const [cabinClass, setCabinClass] = useState<CabinClass>(initialValues?.cabinClass ?? 'ECONOMY');
  const [error, setError] = useState<string | null>(null);

  const swapAirports = useCallback(() => {
    setOrigins(destinations);
    setDestinations(origins);
  }, [origins, destinations]);

  function validate(): string | null {
    if (origins.length === 0) return 'Please select an origin airport';
    if (destinations.length === 0) return 'Please select a destination airport';
    if (!departureDate) return 'Please select a departure date';
    if (tripType === 'round-trip' && !returnDate) return 'Please select a return date';
    return null;
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setError(null);

    const params = new URLSearchParams({
      origins: origins.map(a => a.iataCode).join(','),
      destinations: destinations.map(a => a.iataCode).join(','),
      originsData: encodeURIComponent(JSON.stringify(origins)),
      destinationsData: encodeURIComponent(JSON.stringify(destinations)),
      date: format(departureDate!, 'yyyy-MM-dd'),
      adults: String(adults),
      cabin: cabinClass,
      tripType,
    });

    if (tripType === 'round-trip' && returnDate) {
      params.set('return', format(returnDate, 'yyyy-MM-dd'));
    }
    if (children > 0) params.set('children', String(children));
    if (infants > 0) params.set('infants', String(infants));

    router.push(`/results?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSearch} noValidate>
      <div className={cn(
        'rounded-2xl border border-[#2a2a3a] bg-[#111118] p-4 shadow-2xl',
        compact ? 'space-y-3' : 'space-y-4'
      )}>
        <TripTypeToggle value={tripType} onChange={setTripType} />

        <div className="flex items-end gap-2">
          <AirportMultiSelect
            label="From"
            values={origins}
            onChange={setOrigins}
            placeholder="Origin city or airport"
            className="flex-1"
          />

          <button
            type="button"
            onClick={swapAirports}
            aria-label="Swap airports"
            className="mb-0 flex h-11 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-[#2a2a3a] bg-[#111118] text-[#55556a] transition-all hover:border-[#6366f1]/50 hover:text-[#6366f1] hover:rotate-180 duration-300"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>

          <AirportMultiSelect
            label="To"
            values={destinations}
            onChange={setDestinations}
            placeholder="Destination city or airport"
            className="flex-1"
          />
        </div>

        <DateRangePicker
          departureDate={departureDate}
          returnDate={returnDate}
          onDepartureDateChange={setDepartureDate}
          onReturnDateChange={setReturnDate}
          isRoundTrip={tripType === 'round-trip'}
        />

        <div className="grid grid-cols-2 gap-2">
          <PassengerSelector
            adults={adults}
            children={children}
            infants={infants}
            onAdultsChange={setAdults}
            onChildrenChange={setChildren}
            onInfantsChange={setInfants}
          />
          <CabinClassSelect value={cabinClass} onChange={setCabinClass} />
        </div>

        {error && (
          <p className="text-sm text-[#ef4444]" role="alert">{error}</p>
        )}

        <button
          type="submit"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#6366f1] font-medium text-white transition-colors hover:bg-[#4f52d4] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:ring-offset-2 focus:ring-offset-[#111118]"
        >
          <Search className="h-4 w-4" />
          Search flights
        </button>
      </div>
    </form>
  );
}
