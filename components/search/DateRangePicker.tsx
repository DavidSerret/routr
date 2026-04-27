'use client';

import { useState } from 'react';
import { CalendarIcon, X } from 'lucide-react';
import { format, isAfter, isBefore, startOfDay } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  departureDate: Date | null;
  returnDate: Date | null;
  onDepartureDateChange: (date: Date | null) => void;
  onReturnDateChange: (date: Date | null) => void;
  isRoundTrip: boolean;
  className?: string;
}

export function DateRangePicker({
  departureDate,
  returnDate,
  onDepartureDateChange,
  onReturnDateChange,
  isRoundTrip,
  className,
}: DateRangePickerProps) {
  const [openDep, setOpenDep] = useState(false);
  const [openRet, setOpenRet] = useState(false);
  const today = startOfDay(new Date());

  function handleDepartureDateSelect(date: Date | undefined) {
    if (!date) return;
    onDepartureDateChange(date);
    if (returnDate && isBefore(returnDate, date)) {
      onReturnDateChange(null);
    }
    setOpenDep(false);
    if (isRoundTrip) setTimeout(() => setOpenRet(true), 100);
  }

  function handleReturnDateSelect(date: Date | undefined) {
    if (!date) return;
    onReturnDateChange(date);
    setOpenRet(false);
  }

  return (
    <div className={cn('flex gap-2', className)}>
      <Popover open={openDep} onOpenChange={setOpenDep}>
        <PopoverTrigger
          className={cn(
            'flex h-11 flex-1 items-center gap-2 rounded-lg border border-[#2a2a3a] bg-[#111118] px-3 text-sm transition-colors duration-150',
            'hover:border-[#6366f1]/50 focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]',
            openDep && 'border-[#6366f1] ring-1 ring-[#6366f1]'
          )}
        >
          <CalendarIcon className="h-4 w-4 text-[#55556a] flex-shrink-0" />
          <span className={departureDate ? 'text-white' : 'text-[#55556a]'}>
            {departureDate ? format(departureDate, 'EEE, MMM d') : 'Departure'}
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-[#2a2a3a] bg-[#111118]" align="start">
          <Calendar
            mode="single"
            selected={departureDate ?? undefined}
            onSelect={handleDepartureDateSelect}
            disabled={(date) => isBefore(date, today)}
            initialFocus
            className="text-white"
          />
        </PopoverContent>
      </Popover>

      {isRoundTrip && (
        <Popover open={openRet} onOpenChange={setOpenRet}>
          <PopoverTrigger
            className={cn(
              'flex h-11 flex-1 items-center gap-2 rounded-lg border border-[#2a2a3a] bg-[#111118] px-3 text-sm transition-colors duration-150',
              'hover:border-[#6366f1]/50 focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]',
              openRet && 'border-[#6366f1] ring-1 ring-[#6366f1]'
            )}
          >
            <CalendarIcon className="h-4 w-4 text-[#55556a] flex-shrink-0" />
            <span className={returnDate ? 'text-white' : 'text-[#55556a]'}>
              {returnDate ? format(returnDate, 'EEE, MMM d') : 'Return'}
            </span>
            {returnDate && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onReturnDateChange(null); }}
                className="ml-auto text-[#55556a] hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 border-[#2a2a3a] bg-[#111118]" align="start">
            <Calendar
              mode="single"
              selected={returnDate ?? undefined}
              onSelect={handleReturnDateSelect}
              disabled={(date) => {
                if (departureDate && isBefore(date, departureDate)) return true;
                return isBefore(date, today);
              }}
              initialFocus
              className="text-white"
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
