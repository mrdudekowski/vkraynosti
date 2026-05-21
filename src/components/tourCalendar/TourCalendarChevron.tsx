import type { ChevronProps } from 'react-day-picker';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons/faChevronLeft';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight';
import { faChevronUp } from '@fortawesome/free-solid-svg-icons/faChevronUp';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons/faChevronDown';

const TourCalendarChevron = ({ orientation = 'left', className }: ChevronProps) => {
  const icon =
    orientation === 'right'
      ? faChevronRight
      : orientation === 'up'
        ? faChevronUp
        : orientation === 'down'
          ? faChevronDown
          : faChevronLeft;

  return <FontAwesomeIcon icon={icon} className={className} aria-hidden />;
};

export default TourCalendarChevron;
