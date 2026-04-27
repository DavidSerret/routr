'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Airport } from '@/lib/types';

const RECENT_KEY = 'routr:recent-airports';
const MAX_RECENT = 8;
const DEBOUNCE_MS = 400;

function getRecentAirports(): Airport[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveRecentAirport(airport: Airport) {
  try {
    const existing = getRecentAirports().filter(a => a.iataCode !== airport.iataCode);
    const updated = [airport, ...existing].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function useAirportSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<Airport[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setRecent(getRecentAirports());
  }, []);

  const search = useCallback((q: string) => {
    setQuery(q);

    if (timerRef.current) clearTimeout(timerRef.current);
    if (abortRef.current) abortRef.current.abort();

    if (q.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    timerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await fetch(`/api/airports?q=${encodeURIComponent(q)}&limit=8`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error('fetch failed');
        const data = await res.json();
        setResults(data.airports ?? []);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') setResults([]);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);
  }, []);

  const selectAirport = useCallback((airport: Airport) => {
    saveRecentAirport(airport);
    setRecent(getRecentAirports());
  }, []);

  const clear = useCallback(() => {
    setQuery('');
    setResults([]);
  }, []);

  return { query, results, loading, recent, search, selectAirport, clear };
}
