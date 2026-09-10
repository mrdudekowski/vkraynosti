import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { getTourById } from '../../data/toursData';
import type { EnrichedScheduleEvent } from '../../types/tourSchedule';
import TourCalendarDayFace from './TourCalendarDayFace';

const spring3 = getTourById('spring-3');

if (!spring3) {
  throw new Error('Test tour missing from toursData');
}

const event: EnrichedScheduleEvent = {
  date: '2026-05-09',
  tourId: 'spring-3',
  durationType: 'однодневный',
  priceRub: 6000,
  seats: 8,
  status: 'open',
  comment: null,
  season: 'spring',
  statusLabel: 'Набор открыт',
  tour: spring3,
};

describe('TourCalendarDayFace', () => {
  it('keeps event dots outside the date tile', () => {
    const { container } = render(<TourCalendarDayFace dayOfMonth={9} events={[event]} />);
    const tile = container.querySelector('.tour-calendar__day-tile');
    const dots = container.querySelector('[aria-hidden="true"]');

    expect(tile).toHaveTextContent('9');
    expect(dots).not.toBeNull();
    expect(tile?.contains(dots)).toBe(false);
  });

  it('renders a tile without event dots when the day is empty', () => {
    const { container } = render(<TourCalendarDayFace dayOfMonth={1} events={[]} />);

    expect(container.querySelector('.tour-calendar__day-tile')).toHaveTextContent('1');
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
  });
});
