import { ADMIN_UI } from '../constants/ui';

export type AdminSkeletonVariant = 'list' | 'cards' | 'page';

type AdminSkeletonProps = {
  variant?: AdminSkeletonVariant;
  count?: number;
};

const Line = ({ className = '' }: { className?: string }) => (
  <div className={`h-4 animate-pulse rounded-admin-control bg-skeleton-line ${className}`.trim()} />
);

const AdminSkeleton = ({ variant = 'list', count = 3 }: AdminSkeletonProps) => {
  if (variant === 'cards') {
    return (
      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        role="status"
        aria-label={ADMIN_UI.loading}
      >
        {Array.from({ length: count }, (_, index) => (
          <div key={index} className="rounded-admin-surface border border-divider p-4">
            <div className="mb-3 h-24 animate-pulse rounded-admin-control bg-skeleton-media" />
            <Line className="w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'page') {
    return (
      <div className="flex flex-col gap-4" role="status" aria-label={ADMIN_UI.loading}>
        <Line className="h-8 w-48" />
        <Line className="w-full" />
        <Line className="w-5/6" />
        <Line className="w-2/3" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3" role="status" aria-label={ADMIN_UI.loading}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex flex-col gap-2 border-b border-divider py-3 last:border-b-0">
          <Line className="w-1/3" />
          <Line className="w-2/3" />
        </div>
      ))}
    </div>
  );
};

export default AdminSkeleton;
