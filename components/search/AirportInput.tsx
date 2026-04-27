'use client';

import { useState, useRef, useEffect } from 'react';
import { MapPin, Clock, X } from 'lucide-react';
import { useAirportSearch } from '@/hooks/useAirportSearch';
import { cn } from '@/lib/utils';
import type { Airport } from '@/lib/types';

interface AirportInputProps {
  value: Airport | null;
  onChange: (airport: Airport | null) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  id?: string;
}

function AirportOption({ airport, onSelect }: { airport: Airport; onSelect: (a: Airport) => void }) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-[#1a1a24] transition-colors duration-100 rounded-md"
      onClick={() => onSelect(airport)}
    >
      <span className="text-base">{airport.countryFlag}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono-price text-sm font-bold text-white">{airport.iataCode}</span>
          <span className="truncate text-sm text-[#8888aa]">{airport.cityName}</span>
        </div>
        <p className="truncate text-xs text-[#55556a]">{airport.name}</p>
      </div>
    </button>
  );
}

export function AirportInput({ value, onChange, placeholder = 'City or airport', label, className, id }: AirportInputProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { results, loading, recent, search, selectAirport, clear } = useAirportSearch();

  useEffect(() => {
    if (value) {
      setInputValue(`${value.iataCode} – ${value.cityName}`);
    } else {
      setInputValue('');
    }
  }, [value]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleFocus() {
    if (value) {
      setInputValue('');
      clear();
    }
    setOpen(true);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
    search(e.target.value);
  }

  function handleSelect(airport: Airport) {
    selectAirport(airport);
    onChange(airport);
    setOpen(false);
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange(null);
    setInputValue('');
    clear();
    inputRef.current?.focus();
  }

  const showResults = open && (results.length > 0 || recent.length > 0 || loading);
  const displayList = inputValue.trim().length >= 2 ? results : recent;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {label && (
        <label htmlFor={id} className="mb-1 block text-xs font-medium text-[#8888aa]">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <MapPin className="pointer-events-none absolute left-3 h-4 w-4 text-[#55556a]" />
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={inputValue}
          onChange={handleChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          autoComplete="off"
          className={cn(
            'h-11 w-full rounded-lg border border-[#2a2a3a] bg-[#111118] pl-9 pr-9 text-sm text-white',
            'placeholder:text-[#55556a] focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]',
            'transition-colors duration-150'
          )}
        />
        {(value || inputValue) && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 text-[#55556a] hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showResults && (
        <div className="absolute z-50 mt-1.5 w-full min-w-[280px] rounded-xl border border-[#2a2a3a] bg-[#111118] p-1.5 shadow-2xl">
          {loading && (
            <div className="px-3 py-3 text-sm text-[#8888aa]">Searching...</div>
          )}
          {!loading && inputValue.trim().length < 2 && recent.length > 0 && (
            <div className="mb-1 flex items-center gap-1.5 px-3 pt-1 text-xs text-[#55556a]">
              <Clock className="h-3 w-3" />
              Recent
            </div>
          )}
          {!loading && displayList.map(airport => (
            <AirportOption key={airport.iataCode} airport={airport} onSelect={handleSelect} />
          ))}
          {!loading && displayList.length === 0 && inputValue.trim().length >= 2 && (
            <div className="px-3 py-3 text-sm text-[#8888aa]">No airports found</div>
          )}
        </div>
      )}
    </div>
  );
}
