'use client';

import { useMemo } from 'react';
import { Plane } from 'lucide-react';
import { FlightCard } from './FlightCard';
import { FlightCardSkeleton } from './FlightCardSkeleton';
import type { FlightOffer } from '@/lib/types';
import type { SortOption } from '@/lib/constants';

interface ResultsListProps {
  flights: FlightOffer[];
  loading: boolean;
  sortBy: SortOption;
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

export function ResultsList({ flights, loading, sortBy }: ResultsListProps) {
  const sorted = useMemo(() => sortFlights(flights, sortBy), [flights, sortBy]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <FlightCardSkeleton key={i} />
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
      {sorted.map(flight => (
        <FlightCard key={flight.id} flight={flight} />
      ))}
    </div>
  );
}
