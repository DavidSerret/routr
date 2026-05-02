import { Skeleton } from '@/components/ui/skeleton';

export function FlightCardSkeleton() {
  return (
    <div className="rounded-xl border border-[#2a2a3a] bg-[#111118] p-4 space-y-4">
      {/* Row 1: airline + price */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-8 w-8 rounded bg-[#1a1a24]" />
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-28 rounded bg-[#1a1a24]" />
            <Skeleton className="h-3 w-16 rounded bg-[#1a1a24]" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Skeleton className="h-8 w-20 rounded bg-[#1a1a24]" />
          <Skeleton className="h-4 w-16 rounded-full bg-[#1a1a24]" />
        </div>
      </div>

      {/* Row 2: route */}
      <div className="flex items-center gap-3">
        <div className="space-y-1.5 w-[5.5rem]">
          <Skeleton className="h-7 w-16 rounded bg-[#1a1a24]" />
          <Skeleton className="h-5 w-10 rounded bg-[#1a1a24]" />
          <Skeleton className="h-3 w-20 rounded bg-[#1a1a24]" />
        </div>
        <div className="flex-1 flex flex-col items-center gap-1.5">
          <Skeleton className="h-px w-full bg-[#1a1a24]" />
          <Skeleton className="h-3 w-28 rounded bg-[#1a1a24]" />
        </div>
        <div className="space-y-1.5 w-[5.5rem] flex flex-col items-end">
          <Skeleton className="h-7 w-16 rounded bg-[#1a1a24]" />
          <Skeleton className="h-5 w-10 rounded bg-[#1a1a24]" />
          <Skeleton className="h-3 w-20 rounded bg-[#1a1a24]" />
        </div>
      </div>

      {/* Row 3: bottom bar */}
      <div className="flex items-center justify-between pt-1 border-t border-[#1a1a24]">
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-20 rounded bg-[#1a1a24]" />
          <Skeleton className="h-4 w-20 rounded bg-[#1a1a24]" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg bg-[#1a1a24]" />
      </div>
    </div>
  );
}
