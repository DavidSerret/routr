'use client';

import { useState } from 'react';
import { Users, Minus, Plus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface PassengerSelectorProps {
  adults: number;
  children: number;
  infants: number;
  onAdultsChange: (n: number) => void;
  onChildrenChange: (n: number) => void;
  onInfantsChange: (n: number) => void;
  className?: string;
}

function CountRow({
  label,
  sublabel,
  value,
  onDecrease,
  onIncrease,
  min = 0,
  max = 9,
}: {
  label: string;
  sublabel: string;
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-[#55556a]">{sublabel}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onDecrease}
          disabled={value <= min}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-full border transition-colors',
            value <= min
              ? 'border-[#2a2a3a] text-[#55556a] cursor-not-allowed'
              : 'border-[#6366f1] text-[#6366f1] hover:bg-[#6366f1]/10'
          )}
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-4 text-center text-sm font-medium text-white">{value}</span>
        <button
          type="button"
          onClick={onIncrease}
          disabled={value >= max}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-full border transition-colors',
            value >= max
              ? 'border-[#2a2a3a] text-[#55556a] cursor-not-allowed'
              : 'border-[#6366f1] text-[#6366f1] hover:bg-[#6366f1]/10'
          )}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export function PassengerSelector({
  adults,
  children,
  infants,
  onAdultsChange,
  onChildrenChange,
  onInfantsChange,
  className,
}: PassengerSelectorProps) {
  const [open, setOpen] = useState(false);
  const total = adults + children + infants;

  const passengerLabel = total === 1 ? '1 passenger' : `${total} passengers`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          'flex h-11 w-full items-center gap-2 rounded-lg border border-[#2a2a3a] bg-[#111118] px-3 text-sm transition-colors duration-150',
          'hover:border-[#6366f1]/50 focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]',
          open && 'border-[#6366f1] ring-1 ring-[#6366f1]',
          className
        )}
      >
        <Users className="h-4 w-4 text-[#55556a] flex-shrink-0" />
        <span className="text-white">{passengerLabel}</span>
      </PopoverTrigger>
      <PopoverContent className="w-72 border-[#2a2a3a] bg-[#111118] p-4" align="start">
        <div className="divide-y divide-[#2a2a3a]">
          <CountRow
            label="Adults"
            sublabel="Age 12+"
            value={adults}
            onDecrease={() => onAdultsChange(Math.max(1, adults - 1))}
            onIncrease={() => onAdultsChange(Math.min(9 - children - infants, adults + 1))}
            min={1}
            max={9 - children - infants}
          />
          <CountRow
            label="Children"
            sublabel="Age 2–11"
            value={children}
            onDecrease={() => onChildrenChange(Math.max(0, children - 1))}
            onIncrease={() => onChildrenChange(Math.min(9 - adults - infants, children + 1))}
            max={9 - adults - infants}
          />
          <CountRow
            label="Infants"
            sublabel="Under 2"
            value={infants}
            onDecrease={() => onInfantsChange(Math.max(0, infants - 1))}
            onIncrease={() => onInfantsChange(Math.min(adults, infants + 1))}
            max={adults}
          />
        </div>
        <p className="mt-3 text-xs text-[#55556a]">Maximum 9 passengers total</p>
      </PopoverContent>
    </Popover>
  );
}
