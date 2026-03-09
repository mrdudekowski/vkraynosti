import { useNavigate } from 'react-router-dom';
import type { Tour } from '../../types';
import { buildTourDetailPath } from '../../constants/routes';
import PlaceholderImage from './PlaceholderImage';

interface TourCardProps {
  tour: Tour;
  onClick?: () => void;
  compact?: boolean;
}

const DIFFICULTY_STYLES: Record<Tour['difficulty'], string> = {
  Easy:   'bg-green-100 text-green-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  Hard:   'bg-orange-100 text-orange-800',
  Expert: 'bg-red-100 text-red-800',
};

const DIFFICULTY_LABELS: Record<Tour['difficulty'], string> = {
  Easy:   'Лёгкий',
  Medium: 'Средний',
  Hard:   'Сложный',
  Expert: 'Эксперт',
};

const TourCard = ({ tour, onClick, compact = false }: TourCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(buildTourDetailPath(tour.season, tour.id));
    }
  };

  return (
    <div
      className="card-base cursor-pointer"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleClick()}
    >
      <div className={compact ? 'h-32' : 'h-48'}>
        <PlaceholderImage
          src={tour.imageUrl}
          alt={tour.title}
          className="w-full h-full"
        />
      </div>
      <div className="p-card-p">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-display font-semibold text-card text-text-primary leading-tight">
            {tour.title}
          </h3>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${DIFFICULTY_STYLES[tour.difficulty]}`}>
            {DIFFICULTY_LABELS[tour.difficulty]}
          </span>
        </div>
        <p className="text-text-muted text-sm mb-3">{tour.subtitle}</p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-muted">{tour.duration}</span>
          <span className="font-semibold text-brand-primary">{tour.price}</span>
        </div>
      </div>
    </div>
  );
};

export default TourCard;
