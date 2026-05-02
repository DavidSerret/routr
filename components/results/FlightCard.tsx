'use client';

import { useState } from 'react';
import { AirlineLogo } from '@/components/ui/AirlineLogo';
import { FlightBadgeChip } from '@/components/ui/FlightBadge';
import { PriceTag } from '@/components/ui/PriceTag';
import { cn, formatTime, formatDateShort, formatDuration, getStopLabel, isExpired } from '@/lib/utils';
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

export function FlightCard({ flight, tripType }: FlightCardProps) {
  const [showSegments, setShowSegments] = useState(false);
  const expired = isExpired(flight.expiresAt);
  const offset = flight.arrivalAt ? dayOffset(flight.departureAt, flight.arrivalAt) : '';

  return (
    <article className={cn(
      'rounded-xl border bg-[#111118] p-4 transition-colors duration-200',
      expired
        ? 'border-[#2a2a3a] opacity-75'
        : 'border-[#2a2a3a] hover:border-[#6366f1]/40'
    )}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Airline */}
        <div className="flex items-center gap-2 sm:w-28 flex-shrink-0">
          <AirlineLogo carrierCode={flight.airline} carrierName={flight.airlineName} size={28} />
          <div className="min-w-0">
            <p className="text-xs text-[#8888aa] truncate">{flight.airlineName}</p>
            <p className="text-xs text-[#55556a] font-mono">{flight.flightNumber}</p>
          </div>
        </div>

        {/* Route */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            {/* Departure */}
            <div className="text-left min-w-[3.5rem]">
              <p className="font-mono text-lg font-bold text-white leading-tight">{formatTime(flight.departureAt)}</p>
              <p className="text-xs text-[#8888aa]">{flight.origin}</p>
              <p className="text-[10px] text-[#55556a]">{formatDateShort(flight.departureAt)}</p>
            </div>

            {/* Route line */}
            <div className="flex-1 flex flex-col items-center gap-0.5">
              <div className="relative w-full flex items-center">
                <div className="h-px flex-1 bg-[#2a2a3a]" />
                {flight.stops === 0 ? (
                  <div className="mx-1 h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                ) : (
                  Array.from({ length: flight.stops }).map((_, i) => (
                    <div key={i} className="mx-1 h-1.5 w-1.5 rounded-full bg-[#f59e0b]" />
                  ))
                )}
                <div className="h-px flex-1 bg-[#2a2a3a]" />
              </div>
              <p className={cn('text-xs', flight.stops === 0 ? 'text-[#22c55e]' : 'text-[#f59e0b]')}>
                {getStopLabel(flight.stops)}
              </p>
              {flight.duration && (
                <p className="text-[10px] text-[#55556a]">{formatDuration(flight.duration)}</p>
              )}
            </div>

            {/* Arrival */}
            <div className="text-right min-w-[3.5rem]">
              <p className="font-mono text-lg font-bold text-white leading-tight">
                {flight.arrivalAt ? formatTime(flight.arrivalAt) : flight.destination}
              </p>
              <p className="text-xs text-[#8888aa]">{flight.destination}</p>
              {flight.arrivalAt && (
                <p className="text-[10px] text-[#55556a]">
                  {formatDateShort(flight.arrivalAt)}
                  {offset && <span className="text-[#f59e0b] ml-0.5">{offset}</span>}
                </p>
              )}
            </div>
          </div>

          {/* Baggage */}
          <div className="mt-2 flex items-center gap-4 text-xs">
            <span className={cn('flex items-center gap-1', flight.carryOnIncluded ? 'text-[#22c55e]' : 'text-[#55556a]')}>
              <BriefcaseBusiness className="h-3 w-3" />
              {flight.carryOnIncluded ? 'Carry-on' : 'No carry-on'}
            </span>
            <span className={cn('flex items-center gap-1', flight.baggageIncluded ? 'text-[#22c55e]' : 'text-[#55556a]')}>
              <Luggage className="h-3 w-3" />
              {flight.baggageIncluded ? 'Checked bag' : 'No checked bag'}
            </span>
          </div>

          {/* Return leg */}
          {tripType !== 'one-way' && flight.returnAt && (
            <div className="mt-2 flex items-center gap-2 text-xs text-[#8888aa]">
              <div className="h-px flex-1 bg-[#2a2a3a]" style={{ borderStyle: 'dashed' }} />
              <span>Return: {formatDateShort(flight.returnAt)} {formatTime(flight.returnAt)}</span>
              <div className="h-px flex-1 bg-[#2a2a3a]" />
            </div>
          )}

          {/* Segment expand (only for connecting flights) */}
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
        </div>

        {/* Price + action */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-1 sm:min-w-[7rem]">
          <PriceTag amount={flight.price} currency={flight.currency} size="lg" />
          {flight.badges.length > 0 && <FlightBadgeChip badge={flight.badges[0]} />}
          <a
            href={flight.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 items-center rounded-lg bg-[#6366f1] px-4 text-sm font-medium text-white hover:bg-[#4f52d4] transition-colors whitespace-nowrap"
          >
            View deal
          </a>
        </div>
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
