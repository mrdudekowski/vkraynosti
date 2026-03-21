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
}

const cardInner = (tour: Tour, compact: boolean) => (
  <>
    <div className={compact ? 'h-32' : 'h-48'}>
      <PlaceholderImage
        src={tour.imageUrl}
        alt={tour.title}
        className="w-full h-full"
      />
    </div>
    <div className="p-card-p">
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="font-heading font-semibold text-card text-text-primary leading-tight">
          {tour.title}
        </h3>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${UI.difficulty.styles[tour.difficulty]}`}>
          {UI.difficulty.labels[tour.difficulty]}
        </span>
      </div>
      <p className="text-text-muted text-sm mb-3">{tour.subtitle}</p>
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-muted">{tour.duration}</span>
        <span className="font-semibold text-brand-primary">{tour.price}</span>
      </div>
    </div>
  </>
);

const TourCard = ({ tour, onClick, compact = false }: TourCardProps) => {
  if (!onClick) {
    return (
      <Link
        to={buildTourDetailPath(tour.season, tour.id)}
        className="card-base block cursor-pointer no-underline text-inherit"
      >
        {cardInner(tour, compact)}
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
      {cardInner(tour, compact)}
    </div>
  );
};

export default TourCard;
