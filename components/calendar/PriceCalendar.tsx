'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isBefore, startOfDay, parseISO } from 'date-fns';
import { usePriceCalendar } from '@/hooks/usePriceCalendar';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Airport } from '@/lib/types';

interface PriceCalendarProps {
  origin: Airport | null;
  destination: Airport | null;
  onDateSelect?: (date: string) => void;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getPriceColor(price: number, min: number, max: number): string {
  if (max === min) return 'text-[#22c55e]';
  const ratio = (price - min) / (max - min);
  if (ratio < 0.33) return 'text-[#22c55e]';
  if (ratio < 0.66) return 'text-[#f59e0b]';
  return 'text-[#ef4444]';
}

function getPriceBg(price: number, min: number, max: number): string {
  if (max === min) return 'bg-[#22c55e]/10';
  const ratio = (price - min) / (max - min);
  if (ratio < 0.33) return 'bg-[#22c55e]/10';
  if (ratio < 0.66) return 'bg-[#f59e0b]/10';
  return 'bg-[#ef4444]/10';
}

export function PriceCalendar({ origin, destination, onDateSelect }: PriceCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { days, loading, updatedAt, fetch } = usePriceCalendar();
  const today = startOfDay(new Date());

  useEffect(() => {
    if (!origin || !destination) return;
    fetch(origin.iataCode, destination.iataCode, format(currentMonth, 'yyyy-MM'));
  }, [origin, destination, currentMonth, fetch]);

  const priceMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of days) {
      if (d.price !== null) map.set(d.date, d.price);
    }
    return map;
  }, [days]);

  const { minPrice, maxPrice, currency } = useMemo(() => {
    const prices = days.filter(d => d.price !== null).map(d => d.price as number);
    return {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      currency: days[0]?.currency ?? 'EUR',
    };
  }, [days]);

  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    const startWeekday = (getDay(start) + 6) % 7; // Monday-first
    return { days, startWeekday };
  }, [currentMonth]);

  function prevMonth() {
    setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  function nextMonth() {
    setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  const canGoPrev = !isBefore(startOfMonth(currentMonth), startOfMonth(today));

  return (
    <div className="rounded-xl border border-[#2a2a3a] bg-[#111118] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a3a]">
        <h3 className="font-display font-semibold text-white">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            disabled={!canGoPrev}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
              canGoPrev ? 'text-[#8888aa] hover:text-white hover:bg-[#1a1a24]' : 'text-[#2a2a3a] cursor-not-allowed'
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="flex h-7 w-7 items-center justify-center rounded-md text-[#8888aa] hover:text-white hover:bg-[#1a1a24] transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-3">
        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAYS.map(d => (
            <div key={d} className="text-center text-xs font-medium text-[#55556a] py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: calendarDays.startWeekday }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {calendarDays.days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const price = priceMap.get(dateStr) ?? null;
            const isPast = isBefore(day, today);
            const isCurrentMonth = isSameMonth(day, currentMonth);

            if (!isCurrentMonth) return <div key={dateStr} />;

            if (isPast) {
              return (
                <div
                  key={dateStr}
                  className="flex flex-col items-center justify-center rounded-lg py-2 opacity-30"
                >
                  <span className="text-sm text-[#55556a]">{format(day, 'd')}</span>
                </div>
              );
            }

            if (loading) {
              return (
                <div key={dateStr} className="flex flex-col items-center justify-center rounded-lg py-2 bg-[#1a1a24] animate-pulse h-14" />
              );
            }

            if (price === null) {
              return (
                <div
                  key={dateStr}
                  className="flex flex-col items-center justify-center rounded-lg py-2 h-14"
                >
                  <span className="text-sm text-[#55556a]">{format(day, 'd')}</span>
                  <span className="text-xs text-[#2a2a3a] mt-0.5">—</span>
                </div>
              );
            }

            const colorClass = getPriceColor(price, minPrice, maxPrice);
            const bgClass = getPriceBg(price, minPrice, maxPrice);

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => onDateSelect?.(dateStr)}
                className={cn(
                  'flex flex-col items-center justify-center rounded-lg py-2 h-14 transition-all duration-150',
                  bgClass,
                  'hover:ring-1 hover:ring-[#6366f1] hover:scale-105'
                )}
              >
                <span className="text-sm font-medium text-white">{format(day, 'd')}</span>
                <span className={cn('text-xs font-mono-price font-bold mt-0.5', colorClass)}>
                  {formatPrice(price, currency)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 py-2 border-t border-[#2a2a3a]">
        <Info className="h-3 w-3 text-[#55556a] flex-shrink-0" />
        <p className="text-xs text-[#55556a]">
          Prices are indicative and may vary at time of booking.
          {updatedAt && ` Updated ${format(parseISO(updatedAt), 'HH:mm')}.`}
        </p>
      </div>
    </div>
  );
}
