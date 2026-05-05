'use client';

import { AirlineLogo } from '@/components/ui/AirlineLogo';
import { FlightBadgeChip } from '@/components/ui/FlightBadge';
import { cn, formatTime, formatDateShort, formatDuration, formatPrice, getStopLabel, isExpired } from '@/lib/utils';
import { AlertTriangle, Luggage, BriefcaseBusiness } from 'lucide-react';
import { LayoverDetails } from './LayoverDetails';
import type { FlightOffer, TripType } from '@/lib/types';

interface FlightCardProps {
  flight: FlightOffer;
  tripType: TripType;
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

interface LegBlockProps {
  label?: string;
  labelColor?: string;
  airline: string;
  airlineName: string;
  flightNumber: string;
  departureAt: string;
  arrivalAt: string;
  origin: string;
  destination: string;
  stops: number;
  duration: number | null;
}

function LegBlock({ label, labelColor, airline, airlineName, flightNumber, departureAt, arrivalAt, origin, destination, stops, duration }: LegBlockProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        {label && (
          <span className={cn('text-xs font-mono font-bold uppercase tracking-wider flex-shrink-0', labelColor)}>
            {label}
          </span>
        )}
        <AirlineLogo carrierCode={airline} carrierName={airlineName} size={20} />
        <span className="text-xs text-[#8888aa] truncate">{airlineName}</span>
        <span className="text-xs font-mono text-[#55556a] flex-shrink-0">{flightNumber}</span>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 gap-2">
        <div className="flex items-baseline gap-2 sm:block sm:w-[5.5rem] sm:flex-shrink-0">
          <p className="text-2xl font-bold font-mono text-white leading-none">{formatTime(departureAt)}</p>
          <p className="text-lg font-mono font-semibold text-[#6366f1] leading-none sm:mt-1">{origin}</p>
          <p className="text-xs text-[#55556a] sm:mt-1">{formatDateShort(departureAt)}</p>
        </div>
        <div className="flex-1 flex flex-col items-center gap-1 min-w-0 my-1 sm:my-0">
          <StopsLine stops={stops} />
          <p className={cn('text-xs text-center whitespace-nowrap', stops === 0 ? 'text-[#22c55e]' : 'text-[#f59e0b]')}>
            {getStopLabel(stops)}
            {duration ? ` · ${formatDuration(duration)}` : ''}
          </p>
        </div>
        <div className="flex items-baseline gap-2 sm:block sm:w-[5.5rem] sm:flex-shrink-0 sm:text-right">
          <p className="text-2xl font-bold font-mono text-white leading-none">{formatTime(arrivalAt)}</p>
          <p className="text-lg font-mono font-semibold text-[#6366f1] leading-none sm:mt-1">{destination}</p>
          <p className="text-xs text-[#55556a] sm:mt-1">{formatDateShort(arrivalAt)}</p>
        </div>
      </div>
    </div>
  );
}

export function FlightCard({ flight, tripType }: FlightCardProps) {
  const expired = isExpired(flight.expiresAt);

  const hasReturn = tripType !== 'one-way' && flight.returnAt && flight.returnArrivalAt;
  const outboundLabel = hasReturn ? '↗ OUT' : undefined;
  const outboundLabelColor = 'text-[#6366f1]';

  return (
    <article className={cn(
      'rounded-xl border bg-[#111118] p-4 transition-colors duration-200',
      expired ? 'border-[#2a2a3a] opacity-75' : 'border-[#2a2a3a] hover:border-[#6366f1]/40'
    )}>
      {/* Top: badge (left) + price (right) */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="pt-0.5">
          {flight.badges.length > 0 && <FlightBadgeChip badge={flight.badges[0]} />}
        </div>
        <p className="text-2xl font-bold font-mono text-white flex-shrink-0">
          {formatPrice(flight.price, flight.currency)}
        </p>
      </div>

      {/* Outbound leg */}
      <LegBlock
        label={outboundLabel}
        labelColor={outboundLabelColor}
        airline={flight.airline}
        airlineName={flight.airlineName}
        flightNumber={flight.flightNumber}
        departureAt={flight.departureAt}
        arrivalAt={flight.arrivalAt}
        origin={flight.origin}
        destination={flight.destination}
        stops={flight.stops}
        duration={flight.duration}
      />

      {/* Layover details (connecting outbound flights) */}
      {flight.stops > 0 && flight.segments && flight.segments.length > 1 && (
        <LayoverDetails segments={flight.segments} layovers={flight.layovers} />
      )}

      {/* Return leg (round-trip) */}
      {hasReturn && (
        <>
          <div className="my-4 border-t border-dashed border-[#2a2a3a]" />
          <LegBlock
            label="↙ RET"
            labelColor="text-[#a5b4fc]"
            airline={flight.returnAirline ?? flight.airline}
            airlineName={flight.returnAirlineName ?? flight.airlineName}
            flightNumber={flight.returnFlightNumber ?? ''}
            departureAt={flight.returnAt!}
            arrivalAt={flight.returnArrivalAt!}
            origin={flight.destination}
            destination={flight.origin}
            stops={flight.returnStops ?? 0}
            duration={flight.returnDuration}
          />
        </>
      )}

      {/* Bottom bar */}
      <div className="mt-4 pt-3 border-t border-[#2a2a3a] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className={cn('flex items-center gap-1', flight.carryOnIncluded ? 'text-[#22c55e]' : 'text-[#55556a]')}>
            <BriefcaseBusiness className="h-3.5 w-3.5" />
            {flight.carryOnIncluded ? 'Carry-on' : 'No carry-on'}
          </span>
          <span className={cn('flex items-center gap-1', flight.baggageIncluded ? 'text-[#22c55e]' : 'text-[#55556a]')}>
            <Luggage className="h-3.5 w-3.5" />
            {flight.baggageIncluded ? 'Checked bag' : 'No checked bag'}
          </span>
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
