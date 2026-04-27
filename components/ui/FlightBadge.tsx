import { cn } from '@/lib/utils';
import type { FlightBadge } from '@/lib/types';

interface FlightBadgeProps {
  badge: FlightBadge;
  className?: string;
}

const config: Record<FlightBadge, { label: string; className: string }> = {
  cheapest: {
    label: 'Cheapest',
    className: 'bg-[#22c55e]/15 text-[#22c55e] border-[#22c55e]/30',
  },
  fastest: {
    label: 'Fastest',
    className: 'bg-[#6366f1]/15 text-[#a5b4fc] border-[#6366f1]/30',
  },
  'best-value': {
    label: 'Best value',
    className: 'bg-[#f59e0b]/15 text-[#fbbf24] border-[#f59e0b]/30',
  },
};

export function FlightBadgeChip({ badge, className }: FlightBadgeProps) {
  const { label, className: badgeClass } = config[badge];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
        badgeClass,
        className
      )}
    >
      {label}
    </span>
  );
}
