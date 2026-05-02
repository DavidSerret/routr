'use client';

import { useState } from 'react';
import { AirlineLogo } from '@/components/ui/AirlineLogo';
import { FlightBadgeChip } from '@/components/ui/FlightBadge';
import { cn, formatTime, formatDateShort, formatDuration, formatPrice, getStopLabel, isExpired } from '@/lib/utils';
import { AlertTriangle, ChevronDown, ChevronUp, Luggage, BriefcaseBusiness } from 'lucide-react';
import type { FlightOffer, TripType } from '@/lib/types';

interface FlightCardProps {
  flight: FlightOffer;
  tripType: TripType;
}

function dayOffset(departureAt: string, arrivalAt: string): string {
  const dep = new Date(departureAt).toDateString();
  const arr = new Date(arrivalAt).toDateString();
  if (dep === arr) return '';
  const diffDays = Math.round(
    (new Date(arrivalAt).getTime() - new Date(departureAt).getTime()) / 86400000
  );
  return diffDays > 0 ? `+${diffDays}` : String(diffDays);
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

export function FlightCard({ flight, tripType }: FlightCardProps) {
  const [showSegments, setShowSegments] = useState(false);
  const expired = isExpired(flight.expiresAt);
  const offset = flight.arrivalAt ? dayOffset(flight.departureAt, flight.arrivalAt) : '';

  return (
    <article className={cn(
      'rounded-xl border bg-[#111118] p-4 transition-colors duration-200',
      expired ? 'border-[#2a2a3a] opacity-75' : 'border-[#2a2a3a] hover:border-[#6366f1]/40'
    )}>
      {/* Row 1: Airline + Price */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <AirlineLogo carrierCode={flight.airline} carrierName={flight.airlineName} size={32} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{flight.airlineName}</p>
            <p className="text-xs font-mono text-[#55556a]">{flight.flightNumber}</p>
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
          <p className="text-2xl font-bold font-mono text-white">{formatPrice(flight.price, flight.currency)}</p>
          {flight.badges.length > 0 && (
            <div className="mt-1">
              <FlightBadgeChip badge={flight.badges[0]} />
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Route — horizontal on sm+, stacked on mobile */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:gap-3 gap-2">
        {/* Departure */}
        <div className="flex items-baseline gap-2 sm:block sm:w-[5.5rem] sm:flex-shrink-0">
          <p className="text-2xl font-bold font-mono text-white leading-none">{formatTime(flight.departureAt)}</p>
          <p className="text-lg font-mono font-semibold text-[#6366f1] leading-none sm:mt-1">{flight.origin}</p>
          <p className="text-xs text-[#55556a] sm:mt-1">{formatDateShort(flight.departureAt)}</p>
        </div>

        {/* Center: route line */}
        <div className="flex-1 flex flex-col items-center gap-1 min-w-0 my-1 sm:my-0">
          <StopsLine stops={flight.stops} />
          <p className={cn('text-xs text-center whitespace-nowrap', flight.stops === 0 ? 'text-[#22c55e]' : 'text-[#f59e0b]')}>
            {getStopLabel(flight.stops)}
            {flight.duration ? ` · ${formatDuration(flight.duration)}` : ''}
          </p>
        </div>

        {/* Arrival */}
        <div className="flex items-baseline gap-2 sm:block sm:w-[5.5rem] sm:flex-shrink-0 sm:text-right">
          <p className="text-2xl font-bold font-mono text-white leading-none">
            {flight.arrivalAt ? formatTime(flight.arrivalAt) : '—'}
            {offset && <span className="text-sm font-normal text-[#f59e0b] ml-1">{offset}</span>}
          </p>
          <p className="text-lg font-mono font-semibold text-[#6366f1] leading-none sm:mt-1">{flight.destination}</p>
          {flight.arrivalAt && (
            <p className="text-xs text-[#55556a] sm:mt-1">{formatDateShort(flight.arrivalAt)}</p>
          )}
        </div>
      </div>

      {/* Segment expand (connecting flights only) */}
      {flight.segments && flight.segments.length > 1 && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setShowSegments(s => !s)}
            className="flex items-center gap-1 text-xs text-[#6366f1] hover:text-[#a5b4fc] transition-colors"
          >
            {showSegments ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {showSegments ? 'Hide' : 'Layover details'}
          </button>
          {showSegments && (
            <div className="mt-2 space-y-1.5 rounded-lg bg-[#0d0d14] border border-[#2a2a3a] p-2.5">
              {flight.segments.map((seg, i) => (
                <div key={i} className="flex items-center justify-between text-xs text-[#8888aa] gap-2">
                  <span className="font-mono text-white font-medium">{seg.flightNumber}</span>
                  <span>{seg.origin} → {seg.destination}</span>
                  <span>{formatTime(seg.departureAt)} – {formatTime(seg.arrivalAt)}</span>
                  {seg.aircraft && <span className="text-[#55556a] hidden sm:inline">{seg.aircraft}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Row 3: Bottom bar — baggage + return info + CTA */}
      <div className="mt-3 pt-3 border-t border-[#2a2a3a] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className={cn('flex items-center gap-1', flight.carryOnIncluded ? 'text-[#22c55e]' : 'text-[#55556a]')}>
            <BriefcaseBusiness className="h-3.5 w-3.5" />
            {flight.carryOnIncluded ? 'Carry-on' : 'No carry-on'}
          </span>
          <span className={cn('flex items-center gap-1', flight.baggageIncluded ? 'text-[#22c55e]' : 'text-[#55556a]')}>
            <Luggage className="h-3.5 w-3.5" />
            {flight.baggageIncluded ? 'Checked bag' : 'No checked bag'}
          </span>
          {tripType !== 'one-way' && flight.returnAt && (
            <span className="text-[#8888aa] flex items-center gap-1">
              <span>↩</span>
              <span>Return: {formatDateShort(flight.returnAt)} · {formatTime(flight.returnAt)}</span>
            </span>
          )}
        </div>
        <a
          href={flight.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-9 items-center rounded-lg bg-[#6366f1] px-4 text-sm font-medium text-white hover:bg-[#4f52d4] transition-colors whitespace-nowrap"
        >
          View deal →
        </a>
      </div>

      {expired && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-[#f59e0b]">
          <AlertTriangle className="h-3 w-3" />
          Price may have changed — last updated {formatDateShort(flight.expiresAt)}
        </div>
      )}

      <p className="mt-1.5 text-[10px] text-[#55556a]">
        Prices are indicative. Confirm availability before booking.
      </p>
    </article>
  );
}
