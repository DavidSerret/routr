'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CABIN_CLASSES } from '@/lib/constants';
import type { CabinClass } from '@/lib/types';

interface CabinClassSelectProps {
  value: CabinClass;
  onChange: (cabin: CabinClass) => void;
  className?: string;
}

export function CabinClassSelect({ value, onChange, className }: CabinClassSelectProps) {
  const [open, setOpen] = useState(false);
  const current = CABIN_CLASSES.find(c => c.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          'flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-[#2a2a3a] bg-[#111118] px-3 text-sm',
          'hover:border-[#6366f1]/50 focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]',
          open && 'border-[#6366f1] ring-1 ring-[#6366f1]',
          className
        )}
      >
        <span className="text-white">{current?.label}</span>
        <ChevronDown className={cn('h-4 w-4 text-[#55556a] transition-transform', open && 'rotate-180')} />
      </PopoverTrigger>
      <PopoverContent className="w-48 border-[#2a2a3a] bg-[#111118] p-1" align="start">
        {CABIN_CLASSES.map(cabin => (
          <button
            key={cabin.value}
            type="button"
            onClick={() => { onChange(cabin.value); setOpen(false); }}
            className={cn(
              'flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors',
              cabin.value === value
                ? 'bg-[#6366f1]/15 text-[#a5b4fc]'
                : 'text-[#8888aa] hover:bg-[#1a1a24] hover:text-white'
            )}
          >
            {cabin.label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
