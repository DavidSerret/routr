'use client';

import { useState, useCallback, useMemo } from 'react';
import type { FlightOffer } from '@/lib/types';
import { DEFAULT_FILTER_STATE } from '@/lib/constants';
import { getMinutesFromMidnight } from '@/lib/utils';

type FilterState = typeof DEFAULT_FILTER_STATE;

export function useFilters(
  flights: FlightOffer[],
  initialCabinClass: 'economy' | 'premium_economy' | 'business' | 'first' = 'economy'
) {
  const [filters, setFilters] = useState<FilterState>(() => ({
    ...DEFAULT_FILTER_STATE,
    cabinClass: initialCabinClass,
  }));

  const updateFilter = useCallback(<K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTER_STATE, cabinClass: initialCabinClass });
  }, [initialCabinClass]);

  const filtered = useMemo((): FlightOffer[] => {
    return flights.filter(flight => {
      if (flight.price < filters.priceMin || flight.price > filters.priceMax) return false;

      if (filters.stops.length > 0) {
        const passes = filters.stops.some(s => {
          if (s === 'direct') return flight.stops === 0;
          if (s === '1') return flight.stops <= 1;
          if (s === '2+') return flight.stops >= 2;
          return true;
        });
        if (!passes) return false;
      }

      if (filters.airlines.length > 0 && !filters.airlines.includes(flight.airline)) return false;

      const depTime = getMinutesFromMidnight(flight.departureAt);
      if (depTime < filters.departureTimeMin || depTime > filters.departureTimeMax) return false;

      if (filters.avoidRedEye && depTime >= 0 && depTime <= 360) return false;

      return true;
    });
  }, [flights, filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.priceMin > DEFAULT_FILTER_STATE.priceMin || filters.priceMax < DEFAULT_FILTER_STATE.priceMax) count++;
    if (filters.stops.length > 0) count++;
    if (filters.airlines.length > 0) count++;
    if (filters.avoidRedEye) count++;
    if (filters.cabinClass !== 'economy') count++;
    return count;
  }, [filters]);

  return { filters, filtered, updateFilter, resetFilters, activeFilterCount };
}
