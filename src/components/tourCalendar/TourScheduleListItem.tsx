import { Link } from 'react-router-dom';
import { buildTourDetailPath } from '../../constants/routes';
import { getTourCoverCardImgObjectClass } from '../../constants/tourCoverCropByCanonicalId';
import { useTourDisplayPrice } from '../../hooks/useTourDisplayPrice';
import type { Season } from '../../types';
import type { EnrichedScheduleEvent } from '../../types/tourSchedule';
import PlaceholderImage from '../shared/PlaceholderImage';

const SEASON_STRIPE_CLASS: Record<Season, string> = {
  winter: 'bg-season-winter',
  spring: 'bg-season-spring',
  summer: 'bg-season-summer',
  fall: 'bg-season-fall',
};

interface TourScheduleListItemProps {
  event: EnrichedScheduleEvent;
}

const statusBadgeClass = (status: EnrichedScheduleEvent['status']): string => {
  switch (status) {
    case 'open':
      return 'text-brand-secondary';
    case 'full':
      return 'text-text-muted';
    case 'completed':
      return 'text-text-muted line-through decoration-text-muted/60';
    default:
      return 'text-text-muted';
  }
};

const TourScheduleListItem = ({ event }: TourScheduleListItemProps) => {
  const { tour, season } = event;
  const { displayPrice } = useTourDisplayPrice(tour);

  return (
    <Link
      to={buildTourDetailPath(season, tour.id)}
      className="group flex items-center gap-3 rounded-card border border-divider bg-surface-light/95 p-3 shadow-sm transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
      prefetch="intent"
    >
      <span
        className={`w-0.5 shrink-0 self-stretch rounded-full ${SEASON_STRIPE_CLASS[season]}`}
        aria-hidden
      />
      <div className="size-12 shrink-0 overflow-hidden rounded-lg">
        <PlaceholderImage
          src={tour.imageUrl}
          alt=""
          className="size-full"
          imgClassName={getTourCoverCardImgObjectClass(tour.id)}
          loading="lazy"
        />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-heading text-base leading-tight text-text-primary group-hover:text-brand-primary">
          {tour.title}
        </h3>
        <p className="mt-0.5 text-sm text-text-muted">
          {event.durationType}
          <span aria-hidden> · </span>
          <span className={statusBadgeClass(event.status)}>{event.statusLabel}</span>
        </p>
      </div>
      <p className="shrink-0 text-right text-sm font-semibold tabular-nums text-brand-primary">
        {displayPrice}
      </p>
    </Link>
  );
};

export default TourScheduleListItem;
