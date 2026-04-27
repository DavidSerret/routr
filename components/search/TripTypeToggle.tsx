'use client';

import { cn } from '@/lib/utils';
import type { TripType } from '@/lib/types';

const options: { value: TripType; label: string }[] = [
  { value: 'one-way', label: 'One-way' },
  { value: 'round-trip', label: 'Round-trip' },
  { value: 'multi-city', label: 'Multi-city' },
];

interface TripTypeToggleProps {
  value: TripType;
  onChange: (type: TripType) => void;
  className?: string;
}

export function TripTypeToggle({ value, onChange, className }: TripTypeToggleProps) {
  return (
    <div className={cn('inline-flex rounded-lg border border-[#2a2a3a] bg-[#111118] p-0.5', className)}>
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-150',
            value === opt.value
              ? 'bg-[#6366f1] text-white shadow-sm'
              : 'text-[#8888aa] hover:text-white'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
