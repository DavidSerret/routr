'use client';

import { useMemo } from 'react';
import { Info, Plane } from 'lucide-react';
import { FlightCard } from './FlightCard';
import { FlightCardSkeleton } from './FlightCardSkeleton';
import { OpenJawCard } from './OpenJawCard';
import { formatDate } from '@/lib/utils';
import type { FlightOffer, OpenJawCombination, TripType } from '@/lib/types';
import type { SortOption } from '@/lib/constants';

interface ResultsListProps {
  flights: FlightOffer[];
  loading: boolean;
  sortBy: SortOption;
  tripType: TripType;
  hasExactDateResults?: boolean | null;
  requestedDate?: string | null;
  openJawCombinations?: OpenJawCombination[];
  searchMode?: 'standard' | 'open-jaw';
}

function sortFlights(flights: FlightOffer[], sortBy: SortOption): FlightOffer[] {
  return [...flights].sort((a, b) => {
    switch (sortBy) {
      case 'cheapest':
        return a.price - b.price;
      case 'fastest':
      case 'fewest-stops':
        return a.stops - b.stops;
      case 'best': {
        const score = (f: FlightOffer) => {
          const maxPrice = Math.max(...flights.map(x => x.price));
          const maxStops = Math.max(...flights.map(x => x.stops));
          return (f.price / (maxPrice || 1)) * 0.7 + (f.stops / (maxStops || 1)) * 0.3;
        };
        return score(a) - score(b);
      }
      default:
        return 0;
    }
  });
}

export function ResultsList({
  flights,
  loading,
  sortBy,
  tripType,
  hasExactDateResults,
  requestedDate,
  openJawCombinations = [],
  searchMode = 'standard',
}: ResultsListProps) {
  const sorted = useMemo(() => sortFlights(flights, sortBy), [flights, sortBy]);
  const sortedOpenJaw = useMemo(
    () => [...openJawCombinations].sort((a, b) => a.totalPrice - b.totalPrice),
    [openJawCombinations]
  );

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <FlightCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (searchMode === 'open-jaw') {
    if (sortedOpenJaw.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-[#1a1a24] p-4 mb-4">
            <Plane className="h-8 w-8 text-[#55556a]" />
          </div>
          <h3 className="font-display text-lg font-semibold text-white mb-2">No open-jaw routes found</h3>
          <p className="text-sm text-[#8888aa] max-w-sm">
            Try different airports or dates. Not all airport combinations have direct connections.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-[#6366f1]/30 bg-[#6366f1]/10 px-4 py-3 flex items-start gap-2 text-sm text-[#a5b4fc]">
          <Info className="h-4 w-4 flex-shrink-0 mt-px" />
          <span>
            These are <strong>separate tickets</strong>. Missed connections are your responsibility.
            Prices shown are the sum of two independent bookings.
          </span>
        </div>
        {sortedOpenJaw.map((combo, i) => (
          <OpenJawCard key={`${combo.outbound.id}-${combo.return.id}-${i}`} combination={combo} />
        ))}
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-[#1a1a24] p-4 mb-4">
          <Plane className="h-8 w-8 text-[#55556a]" />
        </div>
        <h3 className="font-display text-lg font-semibold text-white mb-2">No flights found</h3>
        <p className="text-sm text-[#8888aa] max-w-sm">
          Try different dates or nearby airports. Prices come from recent searches.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requestedDate && hasExactDateResults === false && (
        <div className="rounded-lg border border-[#f59e0b]/30 bg-[#f59e0b]/10 px-4 py-3 text-sm text-[#f59e0b]">
          ⚠️ No cached prices found near {formatDate(requestedDate)}. Showing nearest available prices — click &quot;View deal&quot; to check current availability.
        </div>
      )}
      {requestedDate && hasExactDateResults === true && (
        <p className="text-xs text-[#55556a]">
          Showing flights near {formatDate(requestedDate)}. Prices are indicative.
        </p>
      )}
      {sorted.map(flight => (
        <FlightCard key={flight.id} flight={flight} tripType={tripType} />
      ))}
    </div>
  );
}
