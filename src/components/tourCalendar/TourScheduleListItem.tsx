import { Link } from 'react-router-dom';
import { getTourPublicPath } from '../../constants/routes';
import { getTourCoverCardImgObjectClass } from '../../constants/tourCoverCropByCanonicalId';
import {
  TOUR_CALENDAR_DAY_EVENT_BODY_CLASS,
  TOUR_CALENDAR_DAY_EVENT_CARD_CLASS,
  TOUR_CALENDAR_DAY_EVENT_FOOTER_CLASS,
  TOUR_CALENDAR_DAY_EVENT_MEDIA_CLASS,
  TOUR_CALENDAR_DAY_EVENT_TITLE_CLASS,
} from '../../constants/tourCalendarLayout';
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

const STATUS_BADGE_CLASS: Record<EnrichedScheduleEvent['status'], string> = {
  planned: 'text-text-muted',
  open: 'text-brand-secondary',
  full: 'text-text-muted',
  cancelled: 'text-text-muted',
  completed: 'text-text-muted line-through decoration-text-muted/60',
};

interface TourScheduleListItemProps {
  event: EnrichedScheduleEvent;
}

const TourScheduleListItem = ({ event }: TourScheduleListItemProps) => {
  const { tour, season } = event;
  const { displayPrice } = useTourDisplayPrice(tour);

  return (
    <Link
      to={getTourPublicPath(tour)}
      className={TOUR_CALENDAR_DAY_EVENT_CARD_CLASS}
      prefetch="intent"
    >
      <span
        className={`block h-px shrink-0 ${SEASON_STRIPE_CLASS[season]}`}
        aria-hidden
      />
      <div className={TOUR_CALENDAR_DAY_EVENT_MEDIA_CLASS}>
        <PlaceholderImage
          src={tour.imageUrl}
          alt=""
          className="size-full"
          imgClassName={getTourCoverCardImgObjectClass(tour.id)}
          loading="lazy"
        />
      </div>
      <div className={TOUR_CALENDAR_DAY_EVENT_BODY_CLASS}>
        <h3 className={TOUR_CALENDAR_DAY_EVENT_TITLE_CLASS}>{tour.title}</h3>
        <div className={TOUR_CALENDAR_DAY_EVENT_FOOTER_CLASS}>
          <p className="min-w-0 text-xs leading-tight text-text-muted">
            {event.durationType}
            <span aria-hidden> · </span>
            <span className={STATUS_BADGE_CLASS[event.status]}>{event.statusLabel}</span>
          </p>
          <p className="shrink-0 text-xs font-semibold tabular-nums text-brand-primary">
            {displayPrice}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default TourScheduleListItem;
