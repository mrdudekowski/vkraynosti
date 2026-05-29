import { memo } from 'react';
import { Link } from 'react-router-dom';
import type { KeyboardEvent } from 'react';
import type { Tour } from '../../types';
import { buildTourDetailPath } from '../../constants/routes';
import { getTourCoverCardImgObjectClass } from '../../constants/tourCoverCropByCanonicalId';
import { UI } from '../../constants/ui';
import { resolveTourDifficultyLabel } from '../../utils/tourDifficultyLabel';
import { useTourDisplayDuration } from '../../hooks/useTourDisplayDuration';
import { useTourDisplayPrice } from '../../hooks/useTourDisplayPrice';
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

interface TourCardPriceProps {
  tour: Tour;
}

const TourCardDuration = ({ tour }: TourCardPriceProps) => {
  const { displayDuration } = useTourDisplayDuration(tour);
  if (displayDuration.length === 0) return null;
  return <span className="text-text-muted">{displayDuration}</span>;
};

const TourCardPrice = ({ tour }: TourCardPriceProps) => {
  const { priceRub, displayPrice, displayPricePrevious } = useTourDisplayPrice(tour);
  const winterStruck = winterCardStruckPrice(tour);
  const showWinterInquiry = tour.season === 'winter' && priceRub == null;

  if (showWinterInquiry) {
    return (
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
    );
  }

  return (
    <>
      <span className="font-semibold text-brand-primary block">{displayPrice}</span>
      {displayPricePrevious != null && displayPricePrevious.length > 0 && (
        <span className="text-tooltip text-text-muted line-through tabular-nums block">
          {displayPricePrevious}
        </span>
      )}
    </>
  );
};

const cardInner = (tour: Tour, compact: boolean, priorityImage: boolean) => {
  const showAudienceLine =
    tour.metaAudienceLabel != null && tour.metaAudienceLabel.length > 0;
  const difficultyLabel = resolveTourDifficultyLabel(tour);

  return (
    <>
      <div
        className={`overflow-hidden rounded-t-card ${compact ? 'h-32' : 'h-48'}`}
      >
        <PlaceholderImage
          src={tour.imageUrl}
          alt={tour.title}
          className="h-full w-full"
          imgClassName={getTourCoverCardImgObjectClass(tour.id)}
          loading={priorityImage ? 'eager' : 'lazy'}
          fetchPriority={priorityImage ? 'high' : 'auto'}
        />
      </div>
      <div className="p-card-p">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="min-w-0 flex-1 font-heading font-normal text-card leading-tight text-text-primary">
            {tour.title}
          </h3>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
              showAudienceLine ? UI.tourCard.audienceChipClasses : UI.difficulty.styles[tour.difficulty]
            }`}
          >
            {showAudienceLine
              ? tour.metaAudienceLabel
              : difficultyLabel}
          </span>
        </div>
        <p className="mb-3 text-sm text-text-muted">{tour.subtitle}</p>
        <div className="flex flex-col gap-2 text-sm">
          <TourCardDuration tour={tour} />
          <div className="w-full text-right">
            <TourCardPrice tour={tour} />
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
        className="card-base block h-full w-full max-h-tour-card max-w-tour-card justify-self-center cursor-pointer no-underline text-inherit"
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
      className="card-base h-full w-full max-h-tour-card max-w-tour-card justify-self-center cursor-pointer"
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
