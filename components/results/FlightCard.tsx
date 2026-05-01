'use client';

import { AirlineLogo } from '@/components/ui/AirlineLogo';
import { FlightBadgeChip } from '@/components/ui/FlightBadge';
import { PriceTag } from '@/components/ui/PriceTag';
import { cn, formatTime, formatDateShort, getStopLabel, isExpired } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';
import type { FlightOffer, TripType } from '@/lib/types';

interface FlightCardProps {
  flight: FlightOffer;
  tripType: TripType;
}

export function FlightCard({ flight, tripType }: FlightCardProps) {
  const expired = isExpired(flight.expiresAt);

  return (
    <article className={cn(
      'rounded-xl border bg-[#111118] p-4 transition-colors duration-200',
      expired
        ? 'border-[#2a2a3a] opacity-75'
        : 'border-[#2a2a3a] hover:border-[#6366f1]/40'
    )}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 sm:w-28 flex-shrink-0">
          <AirlineLogo carrierCode={flight.airline} carrierName={flight.airlineName} size={28} />
          <div className="min-w-0">
            <p className="text-xs text-[#8888aa] truncate">{flight.airlineName}</p>
            <p className="text-xs text-[#55556a] font-mono">{flight.airline}{flight.flightNumber}</p>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <div className="text-center min-w-[3rem]">
              <p className="font-mono text-lg font-bold text-white leading-tight">{formatTime(flight.departureAt)}</p>
              <p className="text-xs text-[#8888aa]">{flight.origin}</p>
            </div>

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
            </div>

            <div className="text-center min-w-[3rem]">
              <p className="font-mono text-lg font-bold text-white leading-tight">
                {flight.destination}
              </p>
              <p className="text-xs text-[#8888aa]">{formatDateShort(flight.departureAt)}</p>
            </div>
          </div>

          {tripType !== 'one-way' && flight.returnAt && (
            <div className="mt-2 flex items-center gap-2 text-xs text-[#8888aa]">
              <div className="h-px flex-1 bg-[#2a2a3a] border-dashed" />
              <span>Return: {formatDateShort(flight.returnAt)} {formatTime(flight.returnAt)}</span>
              <div className="h-px flex-1 bg-[#2a2a3a]" />
            </div>
          )}
        </div>

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
        Prices are indicative. Updated from recent searches.
      </p>
    </article>
  );
}
