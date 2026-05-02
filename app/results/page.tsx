'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SearchForm } from '@/components/search/SearchForm';
import { ResultsHeader } from '@/components/results/ResultsHeader';
import { ResultsList } from '@/components/results/ResultsList';
import { FilterPanel } from '@/components/filters/FilterPanel';
import { PriceCalendar } from '@/components/calendar/PriceCalendar';
import { useFlightSearch } from '@/hooks/useFlightSearch';
import { useFilters } from '@/hooks/useFilters';
import type { Airport, CabinClass, TripType } from '@/lib/types';
import type { SortOption } from '@/lib/constants';
import { SlidersHorizontal, X } from 'lucide-react';
import { Navbar } from '@/components/ui/Navbar';

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    flights,
    openJawCombinations,
    searchMode,
    loading,
    error,
    updatedAt,
    totalCount,
    hasExactDateResults,
    requestedDate,
    search,
  } = useFlightSearch();

  const cabinFromUrl = (searchParams.get('cabin')?.toLowerCase() ?? 'economy') as
    'economy' | 'premium_economy' | 'business' | 'first';

  const { filters, filtered, updateFilter, resetFilters, activeFilterCount } = useFilters(
    flights,
    cabinFromUrl
  );

  const [sortBy, setSortBy] = useState<SortOption>('best');
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const originsData = searchParams.get('originsData');
  const destinationsData = searchParams.get('destinationsData');

  const origins: Airport[] = originsData
    ? JSON.parse(decodeURIComponent(originsData))
    : searchParams.get('origins')?.split(',').map(code => ({
        iataCode: code, name: code, cityName: code, countryCode: '', countryFlag: ''
      })) ?? [];

  const destinations: Airport[] = destinationsData
    ? JSON.parse(decodeURIComponent(destinationsData))
    : searchParams.get('destinations')?.split(',').map(code => ({
        iataCode: code, name: code, cityName: code, countryCode: '', countryFlag: ''
      })) ?? [];

  const departureDate = searchParams.get('date') ?? '';
  const returnDate = searchParams.get('return') ?? undefined;
  const adults = parseInt(searchParams.get('adults') ?? '1', 10);
  const children = parseInt(searchParams.get('children') ?? '0', 10);
  const infants = parseInt(searchParams.get('infants') ?? '0', 10);
  const tripType = (searchParams.get('tripType') ?? 'round-trip') as TripType;

  const handleDatesSelected = useCallback((outDate: string, retDate: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (outDate) params.set('date', outDate);
    if (retDate) { params.set('return', retDate); params.set('tripType', 'round-trip'); }
    else params.delete('return');
    router.push(`/results?${params.toString()}`);
    setView('list');
  }, [searchParams, router]);

  const doSearch = useCallback(() => {
    if (!origins.length || !destinations.length || !departureDate) return;
    setHasSearched(true);
    search({
      tripType,
      origins,
      destinations,
      departureDate,
      returnDate,
      adults,
      children,
      infants,
      infantSeatType: 'lap',
      cabinClass: filters.cabinClass.toUpperCase() as CabinClass,
      flexibleDates: false,
      flexibleDaysRange: 1,
    });
  }, [searchParams, filters.cabinClass]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    doSearch();
  }, [doSearch]);

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <SearchForm
          compact
          initialValues={{ origins, destinations, departureDate, returnDate, adults, children, infants, tripType }}
        />
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#ef4444]">
          {error}
          <button
            type="button"
            onClick={doSearch}
            className="ml-3 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      <div className="flex gap-6">
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <FilterPanel
            filters={filters}
            updateFilter={updateFilter}
            resetFilters={resetFilters}
            activeFilterCount={activeFilterCount}
            flights={flights}
          />
        </aside>

        <div className="flex-1 min-w-0">
          {hasSearched && (
            <div className="mb-4">
              <ResultsHeader
                totalCount={totalCount}
                filteredCount={searchMode === 'open-jaw' ? openJawCombinations.length : filtered.length}
                sortBy={sortBy}
                onSortChange={setSortBy}
                updatedAt={updatedAt}
                onRefresh={doSearch}
                view={view}
                onViewChange={setView}
              />
            </div>
          )}

          {view === 'calendar' ? (
            <PriceCalendar
              origin={origins[0] ?? null}
              destination={destinations[0] ?? null}
              tripType={tripType}
              initialOutboundDate={departureDate || undefined}
              initialReturnDate={returnDate}
              adults={adults}
              onDatesSelected={handleDatesSelected}
            />
          ) : (
            <ResultsList
              flights={filtered}
              loading={loading}
              sortBy={sortBy}
              tripType={tripType}
              hasExactDateResults={hasExactDateResults}
              requestedDate={requestedDate}
              openJawCombinations={openJawCombinations}
              searchMode={searchMode}
            />
          )}
        </div>
      </div>

      <div className="fixed bottom-6 right-6 lg:hidden z-40">
        <button
          type="button"
          onClick={() => setShowFilters(true)}
          className="flex items-center gap-2 rounded-full bg-[#6366f1] px-4 py-2.5 text-sm font-medium text-white shadow-lg hover:bg-[#4f52d4] transition-colors"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-white/20 px-1.5 text-xs">{activeFilterCount}</span>
          )}
        </button>
      </div>

      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-[#111118] border-t border-[#2a2a3a]">
            <div className="sticky top-0 flex items-center justify-between border-b border-[#2a2a3a] bg-[#111118] px-4 py-3">
              <h3 className="font-display font-semibold text-white">Filters</h3>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="text-[#8888aa] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <FilterPanel
                filters={filters}
                updateFilter={updateFilter}
                resetFilters={resetFilters}
                activeFilterCount={activeFilterCount}
                flights={flights}
              />
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-[#8888aa] text-sm">Loading results...</div>
        </div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
