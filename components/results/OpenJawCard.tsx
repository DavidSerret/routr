'use client';

import { AirlineLogo } from '@/components/ui/AirlineLogo';
import { cn, formatTime, formatDateShort, formatDuration, formatPrice, getStopLabel } from '@/lib/utils';
import { distanceLabel } from '@/lib/airportDistance';
import { BriefcaseBusiness, Luggage } from 'lucide-react';
import type { FlightOffer, OpenJawCombination } from '@/lib/types';

interface OpenJawCardProps {
  combination: OpenJawCombination;
}

function StopsLine({ stops }: { stops: number }) {
  return (
    <div className="relative w-full flex items-center">
      <div className="h-px flex-1 bg-[#2a2a3a]" />
      {stops === 0 ? (
        <div className="mx-2 h-2 w-2 rounded-full bg-[#22c55e] flex-shrink-0" />
      ) : (
        Array.from({ length: Math.min(stops, 3) }).map((_, i) => (
          <div key={i} className="mx-1 h-2 w-2 rounded-full bg-[#f59e0b] flex-shrink-0" />
        ))
      )}
      <div className="h-px flex-1 bg-[#2a2a3a]" />
    </div>
  );
}

function LegBlock({ flight, label, labelColor }: { flight: FlightOffer; label: string; labelColor: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <span className={cn('text-xs font-mono font-bold uppercase tracking-wider flex-shrink-0', labelColor)}>
          {label}
        </span>
        <AirlineLogo carrierCode={flight.airline} carrierName={flight.airlineName} size={20} />
        <span className="text-xs text-[#8888aa] truncate">{flight.airlineName}</span>
        <span className="text-xs font-mono text-[#55556a] flex-shrink-0">{flight.flightNumber}</span>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 gap-2">
        {/* Departure */}
        <div className="flex items-baseline gap-2 sm:block sm:w-[5rem] sm:flex-shrink-0">
          <p className="text-xl font-bold font-mono text-white leading-none">{formatTime(flight.departureAt)}</p>
          <p className="text-base font-mono font-semibold text-[#6366f1] leading-none sm:mt-1">{flight.origin}</p>
          <p className="text-xs text-[#55556a] sm:mt-1">{formatDateShort(flight.departureAt)}</p>
        </div>
        {/* Route line */}
        <div className="flex-1 flex flex-col items-center gap-1 min-w-0 my-1 sm:my-0">
          <StopsLine stops={flight.stops} />
          <p className={cn('text-xs text-center whitespace-nowrap', flight.stops === 0 ? 'text-[#22c55e]' : 'text-[#f59e0b]')}>
            {getStopLabel(flight.stops)}
            {flight.duration ? ` · ${formatDuration(flight.duration)}` : ''}
          </p>
        </div>
        {/* Arrival */}
        <div className="flex items-baseline gap-2 sm:block sm:w-[5rem] sm:flex-shrink-0 sm:text-right">
          <p className="text-xl font-bold font-mono text-white leading-none">{formatTime(flight.arrivalAt)}</p>
          <p className="text-base font-mono font-semibold text-[#6366f1] leading-none sm:mt-1">{flight.destination}</p>
          <p className="text-xs text-[#55556a] sm:mt-1">{formatDateShort(flight.arrivalAt)}</p>
        </div>
      </div>
    </div>
  );
}

export function OpenJawCard({ combination }: OpenJawCardProps) {
  const { outbound, return: ret, totalPrice, isOpenJaw, distanceKm } = combination;
  const currency = outbound.currency;
  const showDistanceWarning = isOpenJaw && distanceKm !== undefined && distanceKm >= 50;
  const gapDescription = showDistanceWarning ? distanceLabel(distanceKm!).split('—')[1]?.trim() ?? '' : '';

  return (
    <article className="rounded-xl border border-[#2a2a3a] bg-[#111118] p-4 hover:border-[#6366f1]/40 transition-colors duration-200">
      {/* Header: route type badge + total price */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <span className={cn(
          'text-xs font-mono font-bold tracking-widest uppercase px-2 py-1 rounded border',
          isOpenJaw
            ? 'text-[#6366f1] bg-[#6366f1]/10 border-[#6366f1]/30'
            : 'text-[#8888aa] bg-[#1a1a24] border-[#2a2a3a]'
        )}>
          {isOpenJaw ? 'Open-jaw route' : 'Round-trip'}
        </span>
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-[#55556a]">Total</p>
          <p className="text-2xl font-bold font-mono text-white">{formatPrice(totalPrice, currency)}</p>
        </div>
      </div>

      {/* Outbound leg */}
      <LegBlock flight={outbound} label="↗ OUT" labelColor="text-[#6366f1]" />

      {/* Divider */}
      <div className="my-4 border-t border-dashed border-[#2a2a3a]" />

      {/* Return leg */}
      <LegBlock flight={ret} label="↙ RET" labelColor="text-[#a5b4fc]" />

      {/* Open-jaw distance warning */}
      {showDistanceWarning && (
        <div className="mt-3 flex items-start gap-1.5 rounded-md border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs text-amber-400">
          <span className="flex-shrink-0">⚠</span>
          <span>
            Open-jaw route · <strong>{outbound.destination}</strong> and <strong>{ret.origin}</strong> are{' '}
            <strong>{distanceKm} km</strong> apart{gapDescription ? ` — ${gapDescription}` : ''}
          </span>
        </div>
      )}

      {/* Bottom bar: baggage + CTA buttons */}
      <div className="mt-4 pt-3 border-t border-[#2a2a3a] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className={cn('flex items-center gap-1', outbound.carryOnIncluded ? 'text-[#22c55e]' : 'text-[#55556a]')}>
            <BriefcaseBusiness className="h-3.5 w-3.5" />
            {outbound.carryOnIncluded ? 'Carry-on' : 'No carry-on'}
          </span>
          <span className={cn('flex items-center gap-1', outbound.baggageIncluded ? 'text-[#22c55e]' : 'text-[#55556a]')}>
            <Luggage className="h-3.5 w-3.5" />
            {outbound.baggageIncluded ? 'Checked bag' : 'No checked bag'}
          </span>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <a
            href={outbound.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 items-center rounded-lg bg-[#6366f1] px-4 text-sm font-medium text-white hover:bg-[#4f52d4] transition-colors whitespace-nowrap"
          >
            Book outbound →
          </a>
          <a
            href={ret.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 items-center rounded-lg border border-[#6366f1]/50 px-4 text-sm font-medium text-[#a5b4fc] hover:bg-[#6366f1]/10 transition-colors whitespace-nowrap"
          >
            Book return →
          </a>
        </div>
      </div>

      <p className="mt-2 text-[10px] text-[#55556a]">
        Prices are indicative. Confirm availability before booking.
      </p>
    </article>
  );
}
