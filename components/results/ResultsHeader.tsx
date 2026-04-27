'use client';

import { RefreshCw, LayoutList, CalendarDays } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { SORT_OPTIONS } from '@/lib/constants';
import type { SortOption } from '@/lib/constants';

interface ResultsHeaderProps {
  totalCount: number;
  filteredCount: number;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  updatedAt: string | null;
  onRefresh: () => void;
  view: 'list' | 'calendar';
  onViewChange: (v: 'list' | 'calendar') => void;
}

export function ResultsHeader({
  totalCount,
  filteredCount,
  sortBy,
  onSortChange,
  updatedAt,
  onRefresh,
  view,
  onViewChange,
}: ResultsHeaderProps) {
  const ago = updatedAt
    ? formatDistanceToNow(new Date(updatedAt), { addSuffix: true })
    : null;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="font-display text-lg font-semibold text-white">
          {filteredCount} <span className="text-[#8888aa] font-normal text-base">of {totalCount} flights</span>
        </h2>
        {ago && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className="text-xs text-[#55556a]">Updated {ago}</p>
            <button
              type="button"
              onClick={onRefresh}
              className="text-[#55556a] hover:text-[#6366f1] transition-colors"
              aria-label="Refresh results"
            >
              <RefreshCw className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex rounded-lg border border-[#2a2a3a] bg-[#111118] p-0.5">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSortChange(opt.value)}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium transition-all duration-150',
                sortBy === opt.value
                  ? 'bg-[#6366f1] text-white'
                  : 'text-[#8888aa] hover:text-white'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex rounded-lg border border-[#2a2a3a] bg-[#111118] p-0.5">
          <button
            type="button"
            onClick={() => onViewChange('list')}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-md transition-all',
              view === 'list' ? 'bg-[#6366f1] text-white' : 'text-[#8888aa] hover:text-white'
            )}
            aria-label="List view"
          >
            <LayoutList className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onViewChange('calendar')}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-md transition-all',
              view === 'calendar' ? 'bg-[#6366f1] text-white' : 'text-[#8888aa] hover:text-white'
            )}
            aria-label="Calendar view"
          >
            <CalendarDays className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
