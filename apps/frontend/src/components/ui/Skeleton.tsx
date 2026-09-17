import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
  /** Rounded shape for avatars/images */
  circle?: boolean;
}

export function Skeleton({ className, circle }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-shimmer bg-[#EDE0CC]/70',
        circle ? 'rounded-full' : 'rounded-[2px]',
        className,
      )}
      aria-hidden="true"
    />
  );
}

/** Product card skeleton for loading states */
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-[2px] border border-[#DDD3C5] bg-white p-2.5 shadow-2xs">
      <Skeleton className="aspect-[4/5] w-full rounded-[2px]" />
      <div className="space-y-2 p-1">
        <div className="flex justify-between items-center">
          <Skeleton className="h-3 w-1/4" />
          <Skeleton className="h-3 w-1/6" />
        </div>
        <Skeleton className="h-4.5 w-4/5" />
        <Skeleton className="h-4 w-1/3" />
        <div className="flex gap-1.5 pt-1">
          <Skeleton circle className="h-3.5 w-3.5" />
          <Skeleton circle className="h-3.5 w-3.5" />
          <Skeleton circle className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  );
}

/** Cart item skeleton */
export function CartItemSkeleton() {
  return (
    <div className="flex gap-4 p-4 border border-[#DDD3C5] bg-white rounded-[2px]">
      <Skeleton className="w-20 h-24 shrink-0 rounded-[2px]" />
      <div className="flex-1 space-y-2.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-7 w-20 rounded-[2px]" />
          <Skeleton className="h-5 w-16" />
        </div>
      </div>
    </div>
  );
}

/** Order row skeleton for account history */
export function OrderRowSkeleton() {
  return (
    <div className="p-5 rounded-[2px] border border-[#DDD3C5] bg-white space-y-3">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-5 w-20 rounded-[2px]" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="w-14 h-16 rounded-[2px]" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-3.5 w-48" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-[#DDD3C5]/60">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

/** Review card skeleton */
export function ReviewCardSkeleton() {
  return (
    <div className="rounded-[2px] border border-[#DDD3C5] bg-white p-6 shadow-2xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton circle className="h-10 w-10" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-5 w-1/2" />
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-5/6" />
      </div>
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-28 rounded-full" />
      </div>
    </div>
  );
}

/** Product detail page skeleton */
export function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-[1360px] px-4 py-8 sm:px-8 sm:py-12">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <Skeleton className="aspect-[4/5] w-full rounded-[2px]" />
          <div className="grid grid-cols-4 gap-3">
            <Skeleton className="aspect-square rounded-[2px]" />
            <Skeleton className="aspect-square rounded-[2px]" />
            <Skeleton className="aspect-square rounded-[2px]" />
            <Skeleton className="aspect-square rounded-[2px]" />
          </div>
        </div>
        {/* Info panel */}
        <div className="lg:col-span-5 space-y-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-4/5" />
          <Skeleton className="h-8 w-1/3" />
          <div className="space-y-3 pt-4 border-t border-[#DDD3C5]">
            <Skeleton className="h-4 w-20" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-12 rounded-[2px]" />
              <Skeleton className="h-10 w-12 rounded-[2px]" />
              <Skeleton className="h-10 w-12 rounded-[2px]" />
              <Skeleton className="h-10 w-12 rounded-[2px]" />
            </div>
          </div>
          <div className="flex gap-3 pt-6">
            <Skeleton className="h-12 flex-1 rounded-[2px]" />
            <Skeleton className="h-12 w-12 rounded-[2px]" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Text line skeletons */
export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-4', i === lines - 1 ? 'w-2/3' : 'w-full')}
        />
      ))}
    </div>
  );
}
