'use client';

import { useState } from 'react';
import { ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { DEFAULT_FILTER_STATE } from '@/lib/constants';
import { formatDuration, formatPrice } from '@/lib/utils';
import type { FlightOffer } from '@/lib/types';

interface FilterPanelProps {
  filters: typeof DEFAULT_FILTER_STATE;
  updateFilter: <K extends keyof typeof DEFAULT_FILTER_STATE>(key: K, value: typeof DEFAULT_FILTER_STATE[K]) => void;
  resetFilters: () => void;
  activeFilterCount: number;
  flights: FlightOffer[];
  className?: string;
}

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#2a2a3a] last:border-0">
      <button
        type="button"
        className="flex w-full items-center justify-between py-3 text-sm font-medium text-white hover:text-[#a5b4fc] transition-colors"
        onClick={() => setOpen(!open)}
      >
        {title}
        <ChevronDown className={cn('h-4 w-4 text-[#55556a] transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="pb-4 space-y-3">{children}</div>}
    </div>
  );
}

function CheckOption({ label, checked, onChange, count }: { label: string; checked: boolean; onChange: (v: boolean) => void; count?: number }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <Checkbox
        checked={checked}
        onCheckedChange={onChange}
        className="border-[#2a2a3a] data-[state=checked]:bg-[#6366f1] data-[state=checked]:border-[#6366f1]"
      />
      <span className="text-sm text-[#8888aa] group-hover:text-white transition-colors flex-1">{label}</span>
      {count !== undefined && <span className="text-xs text-[#55556a]">{count}</span>}
    </label>
  );
}

export function FilterPanel({ filters, updateFilter, resetFilters, activeFilterCount, flights, className }: FilterPanelProps) {
  const airlineCount = new Map<string, { name: string; count: number }>();
  for (const f of flights) {
    const existing = airlineCount.get(f.airline);
    airlineCount.set(f.airline, { name: f.airlineName, count: (existing?.count ?? 0) + 1 });
  }
  const airlines = Array.from(airlineCount.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 15);

  function toggleStop(val: 'direct' | '1' | '2+') {
    const current = filters.stops;
    const next = current.includes(val) ? current.filter(x => x !== val) : [...current, val];
    updateFilter('stops', next);
  }

  function toggleAirline(code: string) {
    const current = filters.airlines;
    const next = current.includes(code) ? current.filter(x => x !== code) : [...current, code];
    updateFilter('airlines', next);
  }

  return (
    <aside className={cn('rounded-xl border border-[#2a2a3a] bg-[#111118] p-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-[#6366f1]" />
          <h3 className="font-display font-semibold text-white">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-[#6366f1] px-1.5 py-0.5 text-xs font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-[#8888aa] hover:text-white transition-colors"
          >
            <X className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      <div className="divide-y divide-[#2a2a3a]">
        <Section title="Price">
          <div className="space-y-2">
            <Slider
              min={0}
              max={DEFAULT_FILTER_STATE.priceMax}
              step={10}
              value={[filters.priceMin, filters.priceMax]}
              onValueChange={(val) => {
                const arr = Array.isArray(val) ? val : [val];
                updateFilter('priceMin', arr[0] ?? filters.priceMin);
                updateFilter('priceMax', arr[1] ?? filters.priceMax);
              }}
              className="[&_[role=slider]]:bg-[#6366f1] [&_[role=slider]]:border-[#6366f1]"
            />
            <div className="flex justify-between text-xs text-[#8888aa]">
              <span>{formatPrice(filters.priceMin, 'EUR')}</span>
              <span>{formatPrice(filters.priceMax, 'EUR')}</span>
            </div>
          </div>
        </Section>

        <Section title="Stops">
          <div className="space-y-2">
            {([
              { value: 'direct', label: 'Direct only' },
              { value: '1', label: 'Max 1 stop' },
              { value: '2+', label: '2+ stops' },
            ] as const).map(opt => (
              <CheckOption
                key={opt.value}
                label={opt.label}
                checked={filters.stops.includes(opt.value)}
                onChange={() => toggleStop(opt.value)}
              />
            ))}
          </div>
        </Section>

        <Section title="Cabin class">
          <div className="flex flex-col gap-2">
            {(['economy', 'premium_economy', 'business', 'first'] as const).map(cabin => (
              <label key={cabin} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="cabin"
                  value={cabin}
                  checked={filters.cabinClass === cabin}
                  onChange={() => updateFilter('cabinClass', cabin)}
                  className="accent-[#6366f1] h-3.5 w-3.5"
                />
                <span className="text-sm text-[#8888aa] group-hover:text-white transition-colors">
                  {cabin === 'premium_economy' ? 'Premium Economy' :
                   cabin.charAt(0).toUpperCase() + cabin.slice(1)}
                </span>
              </label>
            ))}
          </div>
        </Section>

        <Section title="Departure time" defaultOpen={false}>
          <div className="space-y-3">
            <Slider
              min={0}
              max={23 * 60 + 59}
              step={15}
              value={[filters.departureTimeMin, filters.departureTimeMax]}
              onValueChange={(val) => {
                const arr = Array.isArray(val) ? val : [val];
                updateFilter('departureTimeMin', arr[0] ?? filters.departureTimeMin);
                updateFilter('departureTimeMax', arr[1] ?? filters.departureTimeMax);
              }}
              className="[&_[role=slider]]:bg-[#6366f1] [&_[role=slider]]:border-[#6366f1]"
            />
            <div className="flex justify-between text-xs text-[#55556a]">
              <span>{formatDuration(filters.departureTimeMin)}</span>
              <span>{formatDuration(filters.departureTimeMax)}</span>
            </div>
            <CheckOption
              label="Avoid red-eye (00:00–06:00)"
              checked={filters.avoidRedEye}
              onChange={(v) => updateFilter('avoidRedEye', v)}
            />
          </div>
        </Section>

        {airlines.length > 0 && (
          <Section title="Airlines" defaultOpen={false}>
            <div className="space-y-2">
              <div className="flex gap-2 mb-1">
                <button
                  type="button"
                  className="text-xs text-[#6366f1] hover:text-[#a5b4fc]"
                  onClick={() => updateFilter('airlines', airlines.map(([code]) => code))}
                >
                  Select all
                </button>
                <span className="text-[#2a2a3a]">·</span>
                <button
                  type="button"
                  className="text-xs text-[#8888aa] hover:text-white"
                  onClick={() => updateFilter('airlines', [])}
                >
                  Clear
                </button>
              </div>
              {airlines.map(([code, { name, count }]) => (
                <CheckOption
                  key={code}
                  label={name}
                  checked={filters.airlines.includes(code)}
                  onChange={() => toggleAirline(code)}
                  count={count}
                />
              ))}
            </div>
          </Section>
        )}
      </div>
    </aside>
  );
}
