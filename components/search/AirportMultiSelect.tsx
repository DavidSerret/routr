'use client';

import { useState } from 'react';
import { Plus, X, ChevronDown, Globe } from 'lucide-react';
import { AirportInput } from './AirportInput';
import { countryCodeToFlag } from '@/lib/airportUtils';
import { getTopAirportsForGroup } from '@/lib/geographicGroups';
import { cn } from '@/lib/utils';
import type { Airport, AirportGroupResult } from '@/lib/types';

interface AirportMultiSelectProps {
  values: Airport[];
  onChange: (airports: Airport[]) => void;
  label: string;
  placeholder?: string;
  maxAirports?: number;
  className?: string;
}

interface GroupInfo {
  name: string;
  countryCode: string;
  totalCount: number;
  searchCount: number;
  groupType: 'continent' | 'subregion' | 'country';
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
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);

  function removeAirport(iataCode: string) {
    const next = values.filter(a => a.iataCode !== iataCode);
    onChange(next);
    if (next.length === 0) setGroupInfo(null);
  }

  function clearGroup() {
    setGroupInfo(null);
    onChange([]);
  }

  function addAirport(airport: Airport | null) {
    if (!airport) return;
    if (values.some(a => a.iataCode === airport.iataCode)) return;
    setGroupInfo(null);
    onChange([...values, airport]);
  }

  function handleGroupSelect(group: AirportGroupResult) {
    const topCodes = getTopAirportsForGroup(group);

    const topAirports: Airport[] = topCodes.map(code => {
      const found = group.airports.find(a => a.code === code);
      return {
        iataCode: code,
        name: code,
        cityName: found?.cityCode ?? code,
        countryCode: found?.countryCode ?? group.countryCode,
        countryFlag: countryCodeToFlag(found?.countryCode ?? group.countryCode),
      };
    });

    setGroupInfo({
      name: group.name,
      countryCode: group.countryCode,
      totalCount: group.airports.length,
      searchCount: topCodes.length,
      groupType: group.groupType,
    });
    onChange(topAirports);
    setExpanded(false);
  }

  function addGroupAirports(group: AirportGroupResult) {
    const existing = new Set(values.map(a => a.iataCode));
    const topCodes = getTopAirportsForGroup(group);
    const toAdd: Airport[] = topCodes
      .filter(c => !existing.has(c))
      .slice(0, maxAirports - values.length)
      .map(code => {
        const found = group.airports.find(a => a.code === code);
        return {
          iataCode: code,
          name: code,
          cityName: found?.cityCode ?? code,
          countryCode: found?.countryCode ?? group.countryCode,
          countryFlag: countryCodeToFlag(found?.countryCode ?? group.countryCode),
        };
      });
    if (toAdd.length > 0) onChange([...values, ...toAdd]);
  }

  // Collapsed group chip mode
  if (!expanded && groupInfo) {
    const flag = countryCodeToFlag(groupInfo.countryCode);
    const countLabel =
      groupInfo.groupType === 'continent'
        ? `${groupInfo.searchCount} hubs`
        : groupInfo.groupType === 'subregion'
        ? `${groupInfo.searchCount} airports`
        : `top ${groupInfo.searchCount} airports`;
    return (
      <div className={cn('', className)}>
        <span className="mb-1 block text-xs font-medium text-[#8888aa]">{label}</span>
        <div className="flex items-center gap-2 h-11 rounded-lg border border-[#6366f1]/40 bg-[#6366f1]/10 px-3">
          <Globe className="h-4 w-4 text-[#6366f1] flex-shrink-0" />
          <span className="flex-1 text-sm text-white truncate">
            {flag} {groupInfo.name.replace(/^[^\s]+\s/, '').split(' —')[0]}
            <span className="ml-1.5 text-xs text-[#6366f1]">({countLabel})</span>
          </span>
          <button
            type="button"
            onClick={clearGroup}
            className="text-[#55556a] hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
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
            setGroupInfo(null);
            if (a) onChange([a, ...values.slice(1)]);
            else onChange(values.slice(1));
          }}
          onGroupSelect={handleGroupSelect}
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

  // Shared group chip used in both collapsed and expanded states
  const groupChip = groupInfo ? (() => {
    const flag = countryCodeToFlag(groupInfo.countryCode);
    const countLabel =
      groupInfo.groupType === 'continent'
        ? `${groupInfo.searchCount} hubs`
        : groupInfo.groupType === 'subregion'
        ? `${groupInfo.searchCount} airports`
        : `top ${groupInfo.searchCount} airports`;
    return (
      <div className="flex items-center gap-2 h-11 rounded-lg border border-[#6366f1]/40 bg-[#6366f1]/10 px-3">
        <Globe className="h-4 w-4 text-[#6366f1] flex-shrink-0" />
        <span className="flex-1 text-sm text-white truncate">
          {flag} {groupInfo.name.replace(/^[^\s]+\s/, '').split(' —')[0]}
          <span className="ml-1.5 text-xs text-[#6366f1]">({countLabel})</span>
        </span>
        <button
          type="button"
          onClick={clearGroup}
          className="text-[#55556a] hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  })() : null;

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

      {groupInfo ? (
        <>
          {groupChip}
          <p className="mt-2 text-xs text-[#55556a]">
            {'Searching: '}
            {values.slice(0, 5).map(a => a.iataCode).join(', ')}
            {values.length > 5 && ` and ${values.length - 5} more`}
          </p>
        </>
      ) : (
        <>
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
        </>
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
