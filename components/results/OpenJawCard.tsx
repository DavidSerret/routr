'use client';

import { AirlineLogo } from '@/components/ui/AirlineLogo';
import { PriceTag } from '@/components/ui/PriceTag';
import { formatTime, formatDateShort, formatDuration, getStopLabel, cn } from '@/lib/utils';
import { Info } from 'lucide-react';
import type { OpenJawCombination } from '@/lib/types';

interface OpenJawCardProps {
  combination: OpenJawCombination;
}

function LegRow({ flight, label }: { flight: OpenJawCombination['outbound']; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] text-[#55556a] w-12 flex-shrink-0 uppercase tracking-wide">{label}</span>
      <AirlineLogo carrierCode={flight.airline} carrierName={flight.airlineName} size={22} />
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <span className="font-mono text-sm font-bold text-white">{formatTime(flight.departureAt)}</span>
        <span className="text-xs text-[#55556a]">{flight.origin}</span>
        <div className="flex-1 flex flex-col items-center gap-px">
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
          <span className={cn('text-[10px]', flight.stops === 0 ? 'text-[#22c55e]' : 'text-[#f59e0b]')}>
            {getStopLabel(flight.stops)}
            {flight.duration ? ` · ${formatDuration(flight.duration)}` : ''}
          </span>
        </div>
        <span className="text-xs text-[#55556a]">{flight.destination}</span>
        <span className="font-mono text-sm font-bold text-white">{formatTime(flight.arrivalAt)}</span>
      </div>
      <span className="text-xs text-[#8888aa] flex-shrink-0 hidden sm:block truncate max-w-[6rem]">
        {flight.airlineName}
      </span>
    </div>
  );
}

export function OpenJawCard({ combination }: OpenJawCardProps) {
  const { outbound, return: ret, totalPrice, isOpenJaw } = combination;
  const currency = outbound.currency;

  return (
    <article className="rounded-xl border border-[#2a2a3a] bg-[#111118] p-4 hover:border-[#6366f1]/40 transition-colors duration-200">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <LegRow flight={outbound} label="Out" />
          <div className="ml-12 h-px bg-[#2a2a3a] border-dashed" />
          <LegRow flight={ret} label="Return" />
        </div>

        {isOpenJaw && (
          <div className="ml-12 flex items-start gap-1.5 text-xs text-[#8888aa] mt-1">
            <Info className="h-3.5 w-3.5 text-[#6366f1] flex-shrink-0 mt-px" />
            <span>
              Open-jaw route — you arrive at <span className="text-white">{outbound.destination}</span> and
              depart from <span className="text-white">{ret.origin}</span>. These are separate tickets.
            </span>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 mt-1 pt-2 border-t border-[#2a2a3a]">
          <div>
            <p className="text-[10px] text-[#55556a]">
              {formatDateShort(outbound.departureAt)} · {formatDateShort(ret.departureAt)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] text-[#55556a]">Total</p>
              <PriceTag amount={totalPrice} currency={currency} size="lg" />
            </div>
            <div className="flex flex-col gap-1.5">
              <a
                href={outbound.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 items-center rounded-lg bg-[#6366f1] px-3 text-xs font-medium text-white hover:bg-[#4f52d4] transition-colors whitespace-nowrap"
              >
                Book outbound
              </a>
              <a
                href={ret.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 items-center rounded-lg border border-[#6366f1]/50 px-3 text-xs font-medium text-[#a5b4fc] hover:bg-[#6366f1]/10 transition-colors whitespace-nowrap"
              >
                Book return
              </a>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-2 text-[10px] text-[#55556a]">
        Prices are indicative. Confirm availability before booking.
      </p>
    </article>
  );
}
