'use client';

import { useState, useCallback, useRef } from 'react';
import type { FlightOffer, OpenJawCombination, SearchParams } from '@/lib/types';

interface SearchState {
  flights: FlightOffer[];
  openJawCombinations: OpenJawCombination[];
  searchMode: 'standard' | 'open-jaw';
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  updatedAt: string | null;
  totalCount: number;
  page: number;
  hasMore: boolean;
  currencyCode: string;
  hasExactDateResults: boolean | null;
  requestedDate: string | null;
}

const INITIAL_STATE: SearchState = {
  flights: [],
  openJawCombinations: [],
  searchMode: 'standard',
  loading: false,
  loadingMore: false,
  error: null,
  updatedAt: null,
  totalCount: 0,
  page: 1,
  hasMore: false,
  currencyCode: 'EUR',
  hasExactDateResults: null,
  requestedDate: null,
};

export function useFlightSearch() {
  const [state, setState] = useState<SearchState>(INITIAL_STATE);
  const lastParamsRef = useRef<URLSearchParams | null>(null);
  const paginationRef = useRef({ page: 1, hasMore: false });

  const search = useCallback(async (params: SearchParams) => {
    setState(s => ({ ...s, loading: true, error: null, flights: [], openJawCombinations: [] }));
    paginationRef.current = { page: 1, hasMore: false };

    const sp = new URLSearchParams({
      origins: params.origins.map(o => o.iataCode).join(','),
      destinations: params.destinations.map(d => d.iataCode).join(','),
      date: params.departureDate,
      tripType: params.tripType,
      adults: String(params.adults),
      children: String(params.children),
      cabin: params.cabinClass.toLowerCase(),
      page: '1',
    });

    if (params.tripType !== 'one-way' && params.returnDate) {
      sp.set('return_date', params.returnDate);
    }

    lastParamsRef.current = sp;

    try {
      const res = await fetch(`/api/flights?${sp.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? 'Search failed');
      }

      const hasMore = data.hasMore ?? false;
      paginationRef.current = { page: 1, hasMore };

      if (data.mode === 'open-jaw') {
        setState({
          ...INITIAL_STATE,
          openJawCombinations: data.flights ?? [],
          searchMode: 'open-jaw',
          updatedAt: data.updatedAt,
          totalCount: data.totalCount ?? 0,
          page: 1,
          hasMore,
          requestedDate: params.departureDate,
        });
      } else {
        setState({
          ...INITIAL_STATE,
          flights: data.flights ?? [],
          searchMode: 'standard',
          updatedAt: data.updatedAt,
          totalCount: data.totalCount ?? 0,
          page: 1,
          hasMore,
          currencyCode: data.currencyCode ?? 'EUR',
          hasExactDateResults: data.hasExactDateResults ?? null,
          requestedDate: params.departureDate,
        });
      }
    } catch (err) {
      setState(s => ({
        ...s,
        loading: false,
        error: (err as Error).message,
      }));
    }
  }, []);

  const loadMore = useCallback(async () => {
    const sp = lastParamsRef.current;
    if (!sp || !paginationRef.current.hasMore) return;

    setState(s => ({ ...s, loadingMore: true }));

    const nextPage = paginationRef.current.page + 1;
    const nextSp = new URLSearchParams(sp.toString());
    nextSp.set('page', String(nextPage));

    try {
      const res = await fetch(`/api/flights?${nextSp.toString()}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? 'Load more failed');

      const hasMore = data.hasMore ?? false;
      paginationRef.current = { page: nextPage, hasMore };

      if (data.mode === 'open-jaw') {
        setState(s => ({
          ...s,
          openJawCombinations: [...s.openJawCombinations, ...(data.flights ?? [])],
          page: nextPage,
          hasMore,
          loadingMore: false,
          totalCount: data.totalCount ?? s.totalCount,
        }));
      } else {
        setState(s => ({
          ...s,
          flights: [...s.flights, ...(data.flights ?? [])],
          page: nextPage,
          hasMore,
          loadingMore: false,
          totalCount: data.totalCount ?? s.totalCount,
        }));
      }
    } catch {
      setState(s => ({ ...s, loadingMore: false }));
    }
  }, []);

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
    lastParamsRef.current = null;
    paginationRef.current = { page: 1, hasMore: false };
  }, []);

  return { ...state, search, loadMore, reset };
}
