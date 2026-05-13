interface TourCardSkeletonProps {
  compact?: boolean;
  className?: string;
}

interface SkeletonLineProps {
  className: string;
  muted?: boolean;
}

const SkeletonLine = ({ className, muted = false }: SkeletonLineProps) => (
  <span
    className={`${muted ? 'tour-card-skeleton-line-muted' : 'tour-card-skeleton-line'} block ${className}`.trim()}
  />
);

const TourCardSkeleton = ({ compact = false, className = '' }: TourCardSkeletonProps) => (
  <div
    className={`h-full w-full max-h-tour-card max-w-tour-card justify-self-center overflow-hidden rounded-card bg-white shadow-md ${className}`.trim()}
    aria-hidden
  >
    <div className={`overflow-hidden rounded-t-card ${compact ? 'h-32' : 'h-48'}`}>
      <div className="tour-card-skeleton-media h-full w-full" />
    </div>
    <div className="p-card-p">
      <div className="mb-1 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-2">
          <SkeletonLine className="h-5 w-4/5" />
          <SkeletonLine className="h-4 w-3/5" muted />
        </div>
        <SkeletonLine className="h-5 w-16 shrink-0 rounded-full" />
      </div>
      <div className="mb-3 space-y-2">
        <SkeletonLine className="h-3 w-full" muted />
        <SkeletonLine className="h-3 w-2/3" muted />
      </div>
      <div className="flex flex-col gap-2 text-sm">
        <SkeletonLine className="h-3 w-24" muted />
        <div className="flex w-full justify-end">
          <SkeletonLine className="h-4 w-28" />
        </div>
      </div>
    </div>
  </div>
);

export default TourCardSkeleton;
