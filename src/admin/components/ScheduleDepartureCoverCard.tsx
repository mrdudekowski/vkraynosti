import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { AdminDeparture } from '../api';
import type { DepartureQuickStatus } from '../departureQuickStatus';
import DepartureStatusMenu from './DepartureStatusMenu';
import TourCoverImage from './TourCoverImage';

type ScheduleDepartureCoverCardProps = {
  departure: AdminDeparture;
  title: string;
  imageUrl: string | null | undefined;
  selected?: boolean;
  compact?: boolean;
  meta?: ReactNode;
  href?: string;
  openLabel?: string;
  onOpen?: () => void;
  onStatusChange?: (status: DepartureQuickStatus) => void;
};

const ScheduleDepartureCoverCard = ({
  departure,
  title,
  imageUrl,
  selected = false,
  compact = false,
  meta,
  href,
  openLabel,
  onOpen,
  onStatusChange,
}: ScheduleDepartureCoverCardProps) => {
  const cancelled = departure.status === 'cancelled';
  const className = compact
    ? `flex w-full min-w-0 flex-col gap-1 rounded-admin-control px-1.5 py-1.5 text-left text-tooltip text-text-primary ${
        selected ? 'bg-brand-primary/25' : 'bg-brand-primary/15'
      } ${cancelled ? 'text-text-muted line-through' : ''}`
    : `flex w-full items-center gap-3 rounded-admin-control px-2 py-2 text-left text-sm text-text-primary ${
        selected ? 'bg-brand-primary/25' : 'bg-brand-primary/15'
      } ${cancelled ? 'text-text-muted line-through' : ''}`;
  const identityClassName = compact
    ? `flex w-full min-w-0 items-center gap-2 text-left ${cancelled ? 'line-through text-text-muted' : ''}`
    : `flex min-w-0 flex-1 items-center gap-3 text-left ${cancelled ? 'line-through text-text-muted' : ''}`;
  const identity = (
    <>
      <TourCoverImage
        src={imageUrl}
        alt={title}
        className={compact ? 'h-8 w-8 shrink-0 rounded-admin-control' : 'h-12 w-16 shrink-0 rounded-admin-control'}
      />
      <span className="min-w-0 flex-1 truncate font-medium">{title}</span>
    </>
  );

  return (
    <div className={className}>
      {href != null ? (
        <Link to={href} aria-label={openLabel ?? title} className={`${identityClassName} no-underline text-inherit`}>
          {identity}
        </Link>
      ) : onOpen != null ? (
        <button type="button" className={identityClassName} onClick={onOpen}>
          {identity}
        </button>
      ) : (
        <div className={identityClassName}>{identity}</div>
      )}
      <div className={compact ? 'min-w-0' : 'min-w-0 shrink-0'}>
        <DepartureStatusMenu departure={departure} onChange={onStatusChange} />
        {meta}
      </div>
    </div>
  );
};

export default ScheduleDepartureCoverCard;
