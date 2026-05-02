'use client';

import { useState, useCallback } from 'react';
import type { FlightOffer, SearchParams } from '@/lib/types';

interface SearchState {
  flights: FlightOffer[];
  loading: boolean;
  error: string | null;
  updatedAt: string | null;
  totalCount: number;
  currencyCode: string;
  hasExactDateResults: boolean | null;
  requestedDate: string | null;
}

export function useFlightSearch() {
  const [state, setState] = useState<SearchState>({
    flights: [],
    loading: false,
    error: null,
    updatedAt: null,
    totalCount: 0,
    currencyCode: 'EUR',
    hasExactDateResults: null,
    requestedDate: null,
  });

  const search = useCallback(async (params: SearchParams) => {
    setState(s => ({ ...s, loading: true, error: null }));

    const origin = params.origins[0]?.iataCode ?? '';
    const destination = params.destinations[0]?.iataCode ?? '';

    const sp = new URLSearchParams({
      origin,
      destination,
      date: params.departureDate,
      tripType: params.tripType,
      adults: String(params.adults),
      children: String(params.children),
      cabin: params.cabinClass.toLowerCase(),
    });
    if (params.tripType === 'round-trip' && params.returnDate) {
      sp.set('return_date', params.returnDate);
    }

    try {
      const res = await fetch(`/api/flights?${sp.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? 'Search failed');
      }

      setState({
        flights: data.flights ?? [],
        loading: false,
        error: null,
        updatedAt: data.updatedAt,
        totalCount: data.totalCount ?? 0,
        currencyCode: data.currencyCode ?? 'EUR',
        hasExactDateResults: data.hasExactDateResults ?? null,
        requestedDate: params.departureDate,
      });
    } catch (err) {
      setState(s => ({
        ...s,
        loading: false,
        error: (err as Error).message,
      }));
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      flights: [],
      loading: false,
      error: null,
      updatedAt: null,
      totalCount: 0,
      currencyCode: 'EUR',
      hasExactDateResults: null,
      requestedDate: null,
    });
  }, []);

  return { ...state, search, reset };
}
