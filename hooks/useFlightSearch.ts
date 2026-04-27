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
}

export function useFlightSearch() {
  const [state, setState] = useState<SearchState>({
    flights: [],
    loading: false,
    error: null,
    updatedAt: null,
    totalCount: 0,
    currencyCode: 'EUR',
  });

  const search = useCallback(async (params: SearchParams) => {
    setState(s => ({ ...s, loading: true, error: null }));

    const body = {
      originLocationCode: params.origins.map(a => a.iataCode),
      destinationLocationCode: params.destinations.map(a => a.iataCode),
      departureDate: params.departureDate,
      returnDate: params.returnDate,
      currencyCode: 'EUR',
    };

    try {
      const res = await fetch('/api/flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

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
    });
  }, []);

  return { ...state, search, reset };
}
