'use client';

import { useState, useCallback } from 'react';
import type { CalendarDay } from '@/lib/types';

interface CalendarState {
  days: CalendarDay[];
  loading: boolean;
  error: string | null;
  updatedAt: string | null;
  cached: boolean;
}

export function usePriceCalendar() {
  const [state, setState] = useState<CalendarState>({
    days: [],
    loading: false,
    error: null,
    updatedAt: null,
    cached: false,
  });

  const fetch = useCallback(async (origin: string, destination: string, month: string) => {
    if (!origin || !destination || !month) return;

    setState(s => ({ ...s, loading: true, error: null }));

    try {
      const res = await window.fetch(
        `/api/calendar?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&month=${encodeURIComponent(month)}`
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? 'Failed to load calendar');

      setState({
        days: data.days ?? [],
        loading: false,
        error: null,
        updatedAt: data.updatedAt,
        cached: data.cached ?? false,
      });
    } catch (err) {
      setState(s => ({ ...s, loading: false, error: (err as Error).message }));
    }
  }, []);

  return { ...state, fetch };
}
