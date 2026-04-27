'use client';

import { useState, useCallback, useMemo } from 'react';
import type { FlightOffer } from '@/lib/types';
import { DEFAULT_FILTER_STATE } from '@/lib/constants';
import { getMinutesFromMidnight } from '@/lib/utils';

export function useFilters(flights: FlightOffer[]) {
  const [filters, setFilters] = useState<typeof DEFAULT_FILTER_STATE>(DEFAULT_FILTER_STATE);

  const updateFilter = useCallback(<K extends keyof typeof DEFAULT_FILTER_STATE>(
    key: K,
    value: typeof DEFAULT_FILTER_STATE[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTER_STATE);
  }, []);

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
    return count;
  }, [filters]);

  return { filters, filtered, updateFilter, resetFilters, activeFilterCount };
}
