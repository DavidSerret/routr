'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Plane, Clock, MapPin } from 'lucide-react';
import { formatTime, formatDateShort } from '@/lib/utils';
import type { FlightSegment, Layover } from '@/lib/types';

interface LayoverDetailsProps {
  segments: FlightSegment[];
  layovers?: Layover[];
}

function layoverColorClass(minutes: number): string {
  if (minutes < 60) return 'text-red-400';
  if (minutes < 120) return 'text-amber-400';
  if (minutes < 300) return 'text-green-400';
  return 'text-blue-400';
}

function layoverHint(minutes: number): string {
  if (minutes < 60) return 'tight connection';
  if (minutes < 120) return 'standard';
  if (minutes < 300) return 'comfortable';
  return 'long layover';
}

export function LayoverDetails({ segments, layovers }: LayoverDetailsProps) {
  const [open, setOpen] = useState(false);

  if (!segments || segments.length <= 1) return null;

  return (
    <div className="mt-1.5">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="flex items-center gap-1 text-xs text-[#6366f1] hover:text-[#a5b4fc] transition-colors font-medium"
      >
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        {open ? 'Hide route details' : 'Show route details'}
      </button>

      {open && (
        <div className="mt-2 rounded-xl border border-[#2a2a3a] bg-[#0d0d14] overflow-hidden">
          {segments.map((seg, i) => (
            <div key={i}>
              {/* Segment row */}
              <div className="px-4 py-3">
                {/* Airline + flight number */}
                <div className="flex items-center gap-2 mb-2.5">
                  <img
                    src={`https://pics.avs.io/24/24/${seg.airlineCode}.png`}
                    alt={seg.airline}
                    width={20}
                    height={20}
                    className="rounded object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <span className="text-xs text-[#8888aa] font-medium">
                    {seg.airline} · {seg.flightNumber}
                    {seg.aircraft && (
                      <span className="text-[#55556a]"> · {seg.aircraft}</span>
                    )}
                  </span>
                </div>

                {/* Origin → Destination */}
                <div className="flex items-center justify-between gap-3">
                  {/* Origin */}
                  <div className="text-center min-w-[72px]">
                    <div className="text-xl font-bold font-mono text-white leading-none">
                      {formatTime(seg.departureAt)}
                    </div>
                    <div className="text-base font-semibold font-mono text-[#6366f1] mt-0.5">
                      {seg.origin}
                    </div>
                    <div className="text-xs text-[#8888aa] mt-0.5">{seg.originCity}</div>
                    <div className="text-xs text-[#55556a]">{formatDateShort(seg.departureAt)}</div>
                  </div>

                  {/* Center: duration + line */}
                  <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
                    <span className="text-xs text-[#8888aa]">{seg.duration}</span>
                    <div className="w-full flex items-center gap-1">
                      <div className="flex-1 h-px bg-[#2a2a3a]" />
                      <Plane className="h-3 w-3 text-[#55556a] rotate-90 flex-shrink-0" />
                      <div className="flex-1 h-px bg-[#2a2a3a]" />
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="text-center min-w-[72px]">
                    <div className="text-xl font-bold font-mono text-white leading-none">
                      {formatTime(seg.arrivalAt)}
                    </div>
                    <div className="text-base font-semibold font-mono text-[#6366f1] mt-0.5">
                      {seg.destination}
                    </div>
                    <div className="text-xs text-[#8888aa] mt-0.5">{seg.destinationCity}</div>
                    <div className="text-xs text-[#55556a]">{formatDateShort(seg.arrivalAt)}</div>
                  </div>
                </div>
              </div>

              {/* Layover bar between segments */}
              {layovers?.[i] && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-[#111118] border-y border-[#2a2a3a]">
                  <Clock className="h-3.5 w-3.5 text-[#55556a] flex-shrink-0" />
                  <span className={`text-xs font-semibold ${layoverColorClass(layovers[i].durationMinutes)}`}>
                    {layovers[i].durationLabel} layover
                  </span>
                  <span className="text-xs text-[#55556a]">
                    · {layovers[i].airportCity} ({layovers[i].airport})
                  </span>
                  <span className="text-xs text-[#55556a]/60">
                    · {layoverHint(layovers[i].durationMinutes)}
                  </span>
                  <MapPin className="h-3 w-3 text-[#55556a]/40 flex-shrink-0 ml-auto" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
