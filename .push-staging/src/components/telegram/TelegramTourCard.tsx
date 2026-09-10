import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons/faCalendarDays';
import { faClock } from '@fortawesome/free-solid-svg-icons/faClock';
import { faMountain } from '@fortawesome/free-solid-svg-icons/faMountain';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight';
import type { Tour } from '../../types';
import { UI } from '../../constants/ui';
import { buildTelegramTourPath } from '../../constants/telegramMiniApp';
import { tourCardCoverImgProps } from '../../utils/tourCoverPresentation';
import { useTourDisplayDuration } from '../../hooks/useTourDisplayDuration';
import { useTourDisplayPrice } from '../../hooks/useTourDisplayPrice';
import { useTourSchedule } from '../../hooks/useTourSchedule';
import { resolveTourDifficultyLabel } from '../../utils/tourDifficultyLabel';
import { buildTourDepartureCalendarModel } from '../../utils/tourSchedule/buildTourDepartureCalendarModel';
import { formatTourDepartureLabel } from '../../utils/telegramMiniApp';
import PlaceholderImage from '../shared/PlaceholderImage';

interface TelegramTourCardProps {
  tour: Tour;
}

const TelegramTourCard = ({ tour }: TelegramTourCardProps) => {
  const { events } = useTourSchedule();
  const { displayDuration } = useTourDisplayDuration(tour);
  const { displayPrice } = useTourDisplayPrice(tour);
  const difficultyLabel = resolveTourDifficultyLabel(tour);
  const tourPath = buildTelegramTourPath(tour);

  const nearestDateLabel = useMemo(() => {
    const tourEvents = events.filter(event => event.tourId === tour.id);
    const model = buildTourDepartureCalendarModel(tour.id, tourEvents);
    return formatTourDepartureLabel(model.nearestFuture);
  }, [events, tour.id]);

  const cover = tourCardCoverImgProps(tour);

  return (
    <Link
      to={tourPath}
      className="card-base flex flex-col overflow-hidden cursor-pointer no-underline text-inherit focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary"
      prefetch="intent"
    >
      <div
        className={`relative overflow-hidden rounded-t-card ${cover.wrapperClassName ?? ''}`.trim()}
        style={cover.wrapperStyle}
      >
        <PlaceholderImage
          src={tour.imageUrl}
          alt={tour.title}
          className="h-44 w-full"
          imgClassName={cover.imgClassName}
          loading="lazy"
        />
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-brand-primary px-2.5 py-1 text-xs font-semibold text-text-inverse">
          {UI.seasons[tour.season].emoji}
          {UI.seasons[tour.season].label}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-card-p">
        <h2 className="font-heading text-xl leading-tight text-text-primary">{tour.title}</h2>
        <div className="grid grid-cols-3 gap-2 text-xs text-text-muted">
          {displayDuration.length > 0 && (
            <span className="inline-flex items-center gap-1">
              <FontAwesomeIcon icon={faClock} className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {displayDuration}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <FontAwesomeIcon icon={faMountain} className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {difficultyLabel}
          </span>
          <span className="text-right font-semibold text-brand-primary">{displayPrice}</span>
        </div>
        {nearestDateLabel != null && (
          <p className="inline-flex items-center gap-2 text-sm text-text-muted">
            <FontAwesomeIcon icon={faCalendarDays} className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {UI.telegramMiniApp.nearestDatePrefix} {nearestDateLabel}
          </p>
        )}
        <div className="mt-auto flex justify-end">
          <span className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm">
            {UI.telegramMiniApp.tourCardDetails}
            <FontAwesomeIcon icon={faChevronRight} className="h-3 w-3" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default TelegramTourCard;
