'use client';

import { useState } from 'react';
import { Plus, X, ChevronDown } from 'lucide-react';
import { AirportInput } from './AirportInput';
import { cn } from '@/lib/utils';
import type { Airport } from '@/lib/types';

interface AirportMultiSelectProps {
  values: Airport[];
  onChange: (airports: Airport[]) => void;
  label: string;
  placeholder?: string;
  maxAirports?: number;
  className?: string;
}

export function AirportMultiSelect({
  values,
  onChange,
  label,
  placeholder,
  maxAirports = 6,
  className,
}: AirportMultiSelectProps) {
  const [expanded, setExpanded] = useState(false);

  function removeAirport(iataCode: string) {
    onChange(values.filter(a => a.iataCode !== iataCode));
  }

  function addAirport(airport: Airport | null) {
    if (!airport) return;
    if (values.some(a => a.iataCode === airport.iataCode)) return;
    onChange([...values, airport]);
  }

  function addGroupAirports(airports: Airport[]) {
    const existing = new Set(values.map(a => a.iataCode));
    const toAdd = airports
      .filter(a => !existing.has(a.iataCode))
      .slice(0, maxAirports - values.length);
    if (toAdd.length > 0) {
      onChange([...values, ...toAdd]);
      setExpanded(true);
    }
  }

  function setPrimaryAndExpand(airports: Airport[]) {
    // When group selected on collapsed primary input: replace all with group airports
    const toSet = airports.slice(0, maxAirports);
    onChange(toSet);
    setExpanded(true);
  }

  const canAdd = values.length < maxAirports;
  const primaryValue = values[0] ?? null;

  if (!expanded) {
    return (
      <div className={cn('', className)}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-[#8888aa]">{label}</span>
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="text-xs text-[#6366f1] hover:text-[#a5b4fc] transition-colors flex items-center gap-0.5"
          >
            <Plus className="h-3 w-3" />
            Add airports
          </button>
        </div>
        <AirportInput
          value={primaryValue}
          onChange={(a) => {
            if (a) onChange([a, ...values.slice(1)]);
            else onChange(values.slice(1));
          }}
          onGroupSelect={setPrimaryAndExpand}
          placeholder={placeholder}
        />
        {values.length > 1 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {values.slice(1).map(airport => (
              <AirportChip key={airport.iataCode} airport={airport} onRemove={removeAirport} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('rounded-xl border border-[#2a2a3a] bg-[#111118] p-3', className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-white">{label}</span>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="text-[#55556a] hover:text-white transition-colors"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
      <p className="text-xs text-[#55556a] mb-2">Search multiple airports at once (up to {maxAirports})</p>

      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {values.map(airport => (
            <AirportChip key={airport.iataCode} airport={airport} onRemove={removeAirport} />
          ))}
        </div>
      )}

      {canAdd && (
        <AirportInput
          value={null}
          onChange={addAirport}
          onGroupSelect={addGroupAirports}
          placeholder="Add another airport..."
        />
      )}
      {!canAdd && (
        <p className="text-xs text-[#55556a] mt-1">Maximum {maxAirports} airports selected</p>
      )}
    </div>
  );
}

function AirportChip({ airport, onRemove }: { airport: Airport; onRemove: (code: string) => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#6366f1]/15 border border-[#6366f1]/30 px-2.5 py-1 text-xs font-medium text-[#a5b4fc]">
      <span>{airport.countryFlag}</span>
      <span className="font-mono-price font-bold">{airport.iataCode}</span>
      <span className="text-[#8888aa]">{airport.cityName}</span>
      <button
        type="button"
        onClick={() => onRemove(airport.iataCode)}
        className="ml-0.5 text-[#8888aa] hover:text-white transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
