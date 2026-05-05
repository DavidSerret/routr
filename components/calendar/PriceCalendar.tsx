'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isBefore,
  startOfDay,
  addMonths,
} from 'date-fns';
import { FlightCard } from '@/components/results/FlightCard';
import { cn, formatPrice } from '@/lib/utils';
import type { Airport, FlightOffer, TripType } from '@/lib/types';

interface DayPrice {
  price: number;
  currency: string;
  airline: string;
  stops: number;
}

type DayEntry = DayPrice | 'loading' | null;

interface PriceCalendarProps {
  origin: Airport | null;
  destination: Airport | null;
  allOrigins?: Airport[];
  allDestinations?: Airport[];
  tripType?: TripType;
  initialOutboundDate?: string;
  initialReturnDate?: string;
  adults?: number;
  onDatesSelected?: (outboundDate: string, returnDate: string) => void;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MAX_CONCURRENT = 5;

function toMonthStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function currentDateStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function datesForMonth(monthStr: string): string[] {
  const [year, monthNum] = monthStr.split('-').map(Number);
  const daysInMonth = new Date(year, monthNum, 0).getDate();
  const today = currentDateStr();
  const dates: string[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${monthStr}-${String(d).padStart(2, '0')}`;
    if (dateStr >= today) dates.push(dateStr);
  }
  return dates;
}

function getPriceColor(price: number, allPrices: number[]): string {
  if (allPrices.length < 2) return 'text-[#22c55e]';
  const min = Math.min(...allPrices);
  const max = Math.max(...allPrices);
  const range = max - min;
  if (range === 0) return 'text-[#22c55e]';
  const ratio = (price - min) / range;
  if (ratio <= 0.33) return 'text-[#22c55e]';
  if (ratio <= 0.66) return 'text-[#f59e0b]';
  return 'text-[#ef4444]';
}

// Processes items with at most `limit` concurrent async operations.
// Workers stop processing if signal is aborted.
async function runWithLimit(
  items: string[],
  limit: number,
  fn: (item: string) => Promise<void>,
  signal: AbortSignal,
): Promise<void> {
  const queue = [...items];
  const worker = async () => {
    while (queue.length > 0 && !signal.aborted) {
      const item = queue.shift()!;
      await fn(item).catch(() => {});
    }
  };
  await Promise.allSettled(Array.from({ length: Math.min(limit, items.length) }, worker));
}

export function PriceCalendar({
  origin,
  destination,
  allOrigins,
  allDestinations,
  tripType = 'round-trip',
  initialOutboundDate,
  initialReturnDate,
  adults = 1,
  onDatesSelected,
}: PriceCalendarProps) {
  const today = startOfDay(new Date());
  const isRoundTrip = tripType === 'round-trip';

  const [mode, setMode] = useState<'outbound' | 'return'>(
    initialOutboundDate && isRoundTrip ? 'return' : 'outbound',
  );
  const [outboundDate, setOutboundDate] = useState<string | null>(initialOutboundDate ?? null);
  const [returnDate, setReturnDate] = useState<string | null>(initialReturnDate ?? null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const [currentMonth, setCurrentMonth] = useState(() => {
    if (initialOutboundDate) {
      const parts = initialOutboundDate.split('-').map(Number);
      return new Date(parts[0], parts[1] - 1, 1);
    }
    return startOfMonth(new Date());
  });

  // Simple per-direction price maps — reset fully on each month/airport change
  const [outboundPrices, setOutboundPrices] = useState<Record<string, DayEntry>>({});
  const [returnPrices, setReturnPrices] = useState<Record<string, DayEntry>>({});
  const [currency, setCurrency] = useState('EUR');

  const [previewFlight, setPreviewFlight] = useState<FlightOffer | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  // Use primitive string deps — Airport objects re-created on every parent render
  // (JSON.parse in results page) would trigger the effect on every render otherwise
  const originCode = origin?.iataCode ?? null;
  const destCode = destination?.iataCode ?? null;
  const monthStr = toMonthStr(currentMonth);

  useEffect(() => {
    if (!originCode || !destCode) return;

    // Cancel any in-flight requests from the previous month / previous airports
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const { signal } = controller;

    const dates = datesForMonth(monthStr);

    // Immediately reset both directions to loading state
    const initial: Record<string, DayEntry> = {};
    dates.forEach(d => { initial[d] = 'loading'; });
    setOutboundPrices({ ...initial });
    setReturnPrices({ ...initial });

    if (dates.length === 0) return () => controller.abort();

    const fetchDay = async (
      orig: string,
      dest: string,
      date: string,
      setter: React.Dispatch<React.SetStateAction<Record<string, DayEntry>>>,
    ) => {
      if (signal.aborted) return;
      try {
        const params = new URLSearchParams({ origin: orig, destination: dest, date, adults: String(adults) });
        const res = await fetch(`/api/day-price?${params}`, { signal });
        if (signal.aborted) return;
        const data: { price?: number | null; currency?: string; airline?: string; stops?: number } = await res.json();
        const entry: DayEntry = data.price != null
          ? { price: data.price, currency: data.currency ?? 'EUR', airline: data.airline ?? '', stops: data.stops ?? 0 }
          : null;
        if (data.currency) setCurrency(data.currency);
        setter(prev => ({ ...prev, [date]: entry }));
      } catch (err) {
        if ((err as { name?: string })?.name === 'AbortError') return;
        setter(prev => ({ ...prev, [date]: null }));
      }
    };

    // Fire both directions concurrently, each limited to MAX_CONCURRENT at a time
    void runWithLimit(dates, MAX_CONCURRENT, d => fetchDay(originCode, destCode, d, setOutboundPrices), signal);
    void runWithLimit(dates, MAX_CONCURRENT, d => fetchDay(destCode, originCode, d, setReturnPrices), signal);

    return () => controller.abort();
  }, [originCode, destCode, monthStr, adults]);

  // Fetch preview flight when both dates confirmed
  useEffect(() => {
    if (!outboundDate || !returnDate || !originCode || !destCode || !isRoundTrip) {
      setPreviewFlight(null);
      return;
    }
    setPreviewLoading(true);
    const effectiveOrigins = allOrigins?.length ? allOrigins.map(a => a.iataCode).join(',') : originCode ?? '';
    const effectiveDestinations = allDestinations?.length ? allDestinations.map(a => a.iataCode).join(',') : destCode ?? '';
    fetch(
      `/api/flights?origins=${effectiveOrigins}&destinations=${effectiveDestinations}` +
      `&date=${outboundDate}&return_date=${returnDate}&tripType=round-trip&adults=${adults}`,
    )
      .then(r => r.json())
      .then(data => setPreviewFlight(data.flights?.[0] ?? null))
      .catch(() => setPreviewFlight(null))
      .finally(() => setPreviewLoading(false));
  }, [outboundDate, returnDate, originCode, destCode, adults, isRoundTrip]);

  const activePrices = mode === 'return' ? returnPrices : outboundPrices;
  const isLoading = Object.values(activePrices).some(v => v === 'loading');

  const resolvedPrices = useMemo(() => {
    return Object.values(activePrices)
      .filter((v): v is DayPrice => v !== null && v !== 'loading')
      .map(v => v.price);
  }, [activePrices]);

  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    const startWeekday = (getDay(start) + 6) % 7; // Monday-first
    return { days, startWeekday };
  }, [currentMonth]);

  function handleDayClick(dateStr: string) {
    if (!isRoundTrip) {
      setOutboundDate(dateStr);
      onDatesSelected?.(dateStr, '');
      return;
    }
    if (mode === 'outbound') {
      setOutboundDate(dateStr);
      setReturnDate(null);
      setPreviewFlight(null);
      setMode('return');
    } else {
      if (outboundDate && dateStr <= outboundDate) {
        setOutboundDate(dateStr);
        setReturnDate(null);
        setPreviewFlight(null);
        setMode('return');
      } else {
        setReturnDate(dateStr);
      }
    }
  }

  const canGoPrev = !isBefore(startOfMonth(currentMonth), startOfMonth(today));
  const bothSelected = !!(outboundDate && returnDate && isRoundTrip);
  const rangeEndDate = isRoundTrip && mode === 'return' ? (hoveredDate ?? returnDate) : null;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#2a2a3a] bg-[#111118] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a3a]">
          <div className="flex items-center gap-3">
            <h3 className="font-display font-semibold text-white">
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
            {isLoading && <Loader2 className="h-4 w-4 text-[#6366f1] animate-spin" />}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentMonth(m => addMonths(m, -1))}
              disabled={!canGoPrev}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
                canGoPrev
                  ? 'text-[#8888aa] hover:text-white hover:bg-[#1a1a24]'
                  : 'text-[#2a2a3a] cursor-not-allowed',
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentMonth(m => addMonths(m, 1))}
              className="flex h-7 w-7 items-center justify-center rounded-md text-[#8888aa] hover:text-white hover:bg-[#1a1a24] transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Round-trip date chips */}
        {isRoundTrip && (
          <div className="flex items-center gap-2 px-4 pt-3 pb-1 flex-wrap">
            <button
              type="button"
              onClick={() => { setMode('outbound'); setReturnDate(null); setPreviewFlight(null); }}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                mode === 'outbound'
                  ? 'bg-[#6366f1] text-white'
                  : 'bg-[#1a1a24] text-[#a5b4fc] hover:bg-[#6366f1]/20',
              )}
            >
              ↗ {outboundDate ?? 'Select departure'}
            </button>
            <span className="text-[#2a2a3a] text-sm">→</span>
            <button
              type="button"
              onClick={() => outboundDate && setMode('return')}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                mode === 'return'
                  ? 'bg-[#6366f1] text-white'
                  : returnDate
                    ? 'bg-[#1a1a24] text-[#a5b4fc] hover:bg-[#6366f1]/20'
                    : 'bg-[#1a1a24] text-[#55556a]',
              )}
            >
              ↙ {returnDate ?? 'Select return'}
            </button>
          </div>
        )}

        {/* Grid */}
        <div className="p-3">
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map(d => (
              <div key={d} className="text-center text-xs font-medium text-[#55556a] py-1">{d}</div>
            ))}
          </div>

          {/* No gap — seamless range band */}
          <div className="grid grid-cols-7">
            {Array.from({ length: calendarDays.startWeekday }).map((_, i) => (
              <div key={`empty-${i}`} className="h-14" />
            ))}

            {calendarDays.days.map((day, dayIndex) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const col = (calendarDays.startWeekday + dayIndex) % 7;
              const isPast = isBefore(day, today);
              const isBeforeOutbound =
                isRoundTrip && mode === 'return' && outboundDate != null && dateStr < outboundDate;
              const disabled = isPast || isBeforeOutbound;

              const entry = disabled ? null : (activePrices[dateStr] ?? null);
              const isEntryLoading = entry === 'loading';
              const priceData = entry !== null && entry !== 'loading' ? entry : null;

              const isOutboundSelected = dateStr === outboundDate;
              const isReturnSelected = dateStr === returnDate;
              const isSelected = isOutboundSelected || isReturnSelected;

              // Snake range highlight
              let inRange = false;
              let isRangeStart = false;
              let isRangeEnd = false;

              if (outboundDate && rangeEndDate) {
                const [rStart, rEnd] =
                  outboundDate <= rangeEndDate
                    ? [outboundDate, rangeEndDate]
                    : [rangeEndDate, outboundDate];
                if (dateStr >= rStart && dateStr <= rEnd) {
                  inRange = true;
                  isRangeStart = dateStr === rStart;
                  isRangeEnd = dateStr === rEnd;
                }
              }

              const shouldRoundLeft = isRangeStart || (inRange && col === 0);
              const shouldRoundRight = isRangeEnd || (inRange && col === 6);

              const outerClass = cn(
                'h-14 relative',
                inRange && cn(
                  'bg-[#6366f1]/15',
                  shouldRoundLeft && 'rounded-l-lg',
                  shouldRoundRight && 'rounded-r-lg',
                ),
              );

              const innerContent = (
                <div className={cn(
                  'relative mx-0.5 h-full flex flex-col items-center justify-center gap-0.5',
                  isSelected && 'rounded-lg bg-[#6366f1]',
                )}>
                  <span className={cn(
                    'text-sm font-medium leading-none',
                    disabled ? 'text-[#2a2a3a]' : 'text-white',
                  )}>
                    {format(day, 'd')}
                  </span>

                  {disabled ? (
                    <span className="text-[10px] text-[#1a1a24]">—</span>
                  ) : isEntryLoading ? (
                    <div className="h-3 w-8 rounded bg-[#1a1a24] animate-pulse" />
                  ) : priceData !== null ? (
                    <span className={cn(
                      'text-[10px] font-mono font-bold',
                      isSelected ? 'text-white/80' : getPriceColor(priceData.price, resolvedPrices),
                    )}>
                      {formatPrice(priceData.price, currency)}
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#2a2a3a]">—</span>
                  )}
                </div>
              );

              if (disabled) {
                return (
                  <div key={dateStr} className={cn(outerClass, 'opacity-30')}>
                    {innerContent}
                  </div>
                );
              }

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => handleDayClick(dateStr)}
                  onMouseEnter={() => mode === 'return' && setHoveredDate(dateStr)}
                  onMouseLeave={() => setHoveredDate(null)}
                  className={cn(outerClass, 'transition-opacity duration-100', !isSelected && 'hover:opacity-75')}
                >
                  {innerContent}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-4 py-2 border-t border-[#2a2a3a]">
          <p className="text-xs text-[#55556a]">Prices are indicative. Confirm availability before booking.</p>
        </div>
      </div>

      {/* Preview card when both dates selected */}
      {bothSelected && (
        <div className="space-y-3">
          {previewLoading ? (
            <div className="rounded-xl border border-[#2a2a3a] bg-[#111118] p-8 flex items-center justify-center">
              <Loader2 className="h-5 w-5 text-[#6366f1] animate-spin" />
            </div>
          ) : previewFlight ? (
            <FlightCard flight={previewFlight} tripType="round-trip" />
          ) : null}

          <button
            type="button"
            onClick={() => onDatesSelected?.(outboundDate!, returnDate!)}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#6366f1]/40 bg-[#6366f1]/10 px-4 py-3 text-sm font-medium text-[#a5b4fc] hover:bg-[#6366f1]/20 transition-colors"
          >
            View all flights for {outboundDate} → {returnDate} →
          </button>
        </div>
      )}
    </div>
  );
}
