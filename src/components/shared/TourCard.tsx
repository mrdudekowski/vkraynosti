import { memo } from 'react';
import { Link } from 'react-router-dom';
import type { KeyboardEvent } from 'react';
import type { Tour } from '../../types';
import { buildTourDetailPath } from '../../constants/routes';
import { UI } from '../../constants/ui';
import PlaceholderImage from './PlaceholderImage';

interface TourCardProps {
  tour: Tour;
  onClick?: () => void;
  compact?: boolean;
  /** Первый ряд сетки на главной — приоритет LCP. */
  priorityImage?: boolean;
}

/** Зачёркнутая «ранее указанная» сумма на карточке зимнего тура (см. `UI.tourCard.winterPriceLead`). */
const winterCardStruckPrice = (tour: Tour): string | null => {
  if (tour.season !== 'winter') return null;
  const prev = tour.pricePrevious?.trim();
  if (prev != null && prev.length > 0) return prev;
  const p = tour.price.trim();
  const lead = UI.tourCard.winterPriceLead;
  if (p === lead || p === UI.tourCard.winterPricePlaceholderNoListing) return null;
  return p;
};

const cardInner = (tour: Tour, compact: boolean, priorityImage: boolean) => {
  const winterStruck = winterCardStruckPrice(tour);
  return (
    <>
      <div
        className={`overflow-hidden rounded-t-card ${compact ? 'h-32' : 'h-48'}`}
      >
        <PlaceholderImage
          src={tour.imageUrl}
          alt={tour.title}
          className="h-full w-full"
          loading={priorityImage ? 'eager' : 'lazy'}
          fetchPriority={priorityImage ? 'high' : undefined}
        />
      </div>
      <div className="p-card-p">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="min-w-0 flex-1 font-heading font-normal text-card leading-tight text-text-primary">
            {tour.title}
          </h3>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
              tour.metaAudienceLabel != null && tour.metaAudienceLabel.length > 0
                ? UI.tourCard.audienceChipClasses
                : UI.difficulty.styles[tour.difficulty]
            }`}
          >
            {tour.metaAudienceLabel != null && tour.metaAudienceLabel.length > 0
              ? tour.metaAudienceLabel
              : UI.difficulty.labels[tour.difficulty]}
          </span>
        </div>
        <p className="mb-3 text-sm text-text-muted">{tour.subtitle}</p>
        <div className="flex flex-col gap-2 text-sm">
          <span className="text-text-muted">{tour.duration}</span>
          <div className="w-full text-right">
            {tour.season === 'winter' ? (
              <>
                <span className="font-semibold text-brand-primary block">
                  {UI.tourCard.winterPriceLead}
                </span>
                {winterStruck != null && (
                  <span className="text-tooltip text-text-muted line-through tabular-nums block">
                    {winterStruck}
                  </span>
                )}
              </>
            ) : (
              <>
                <span className="font-semibold text-brand-primary block">{tour.price}</span>
                {tour.pricePrevious != null && tour.pricePrevious.length > 0 && (
                  <span className="text-tooltip text-text-muted line-through tabular-nums block">
                    {tour.pricePrevious}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const TourCardComponent = ({ tour, onClick, compact = false, priorityImage = false }: TourCardProps) => {
  if (!onClick) {
    return (
      <Link
        to={buildTourDetailPath(tour.season, tour.id)}
        className="card-base block cursor-pointer no-underline text-inherit"
        prefetch="intent"
      >
        {cardInner(tour, compact, priorityImage)}
      </Link>
    );
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className="card-base cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {cardInner(tour, compact, priorityImage)}
    </div>
  );
};

const TourCard = memo(TourCardComponent);

export default TourCard;
