import { Skeleton } from '@/components/ui';

/** Skeleton grid shown while products load. */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-[10px] border border-line bg-surface">
          <Skeleton className="h-[320px] w-full rounded-none" />
          <div className="flex flex-col gap-3 p-5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="mt-2 h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
