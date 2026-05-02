'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/ui/Navbar';
import { PriceCalendar } from '@/components/calendar/PriceCalendar';
import { AirportInput } from '@/components/search/AirportInput';
import { ArrowRight } from 'lucide-react';
import type { Airport } from '@/lib/types';

export default function CalendarPage() {
  const router = useRouter();
  const [origin, setOrigin] = useState<Airport | null>(null);
  const [destination, setDestination] = useState<Airport | null>(null);

  function handleDatesSelected(date: string) {
    if (!origin || !destination) return;
    const params = new URLSearchParams({
      origins: origin.iataCode,
      destinations: destination.iataCode,
      originsData: encodeURIComponent(JSON.stringify([origin])),
      destinationsData: encodeURIComponent(JSON.stringify([destination])),
      date,
      adults: '1',
      cabin: 'ECONOMY',
      tripType: 'one-way',
    });
    router.push(`/results?${params.toString()}`);
  }

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-white mb-2">Price Calendar</h1>
        <p className="text-[#8888aa]">See the cheapest days to fly between two airports.</p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <AirportInput
          label="From"
          value={origin}
          onChange={setOrigin}
          placeholder="Origin airport"
          id="cal-origin"
        />
        <AirportInput
          label="To"
          value={destination}
          onChange={setDestination}
          placeholder="Destination airport"
          id="cal-destination"
        />
      </div>

      {(!origin || !destination) && (
        <div className="rounded-xl border border-dashed border-[#2a2a3a] bg-[#111118] py-16 text-center">
          <ArrowRight className="mx-auto h-8 w-8 text-[#2a2a3a] mb-3" />
          <p className="text-[#8888aa]">Select origin and destination to see prices</p>
        </div>
      )}

      {origin && destination && (
        <PriceCalendar
          origin={origin}
          destination={destination}
          tripType="one-way"
          onDatesSelected={handleDatesSelected}
        />
      )}
    </div>
    </>
  );
}
