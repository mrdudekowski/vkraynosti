import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TourCalendar from './TourCalendar';
import { TourScheduleContext } from '../../context/tour-schedule-context-definition';
import type {
  EnrichedScheduleEvent,
  TourScheduleDurationType,
} from '../../types/tourSchedule';
import { getTourById } from '../../data/toursData';
import { UI } from '../../constants/ui';

const spring3 = getTourById('spring-3');
const spring6 = getTourById('spring-6');

if (!spring3 || !spring6) {
  throw new Error('Test tours missing from toursData');
}

const enrichedEvents: EnrichedScheduleEvent[] = [
  {
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
  },
  {
    date: '2026-05-09',
    tourId: 'spring-6',
    durationType: 'однодневный',
    priceRub: 5500,
    seats: 12,
    status: 'open',
    comment: null,
    season: 'spring',
    statusLabel: 'Набор открыт',
    tour: spring6,
  },
];

const eventsByDate = new Map<string, EnrichedScheduleEvent[]>([
  ['2026-05-09', enrichedEvents],
]);

const renderCalendar = () =>
  render(
    <MemoryRouter>
      <TourScheduleContext.Provider
        value={{
          status: 'success',
          events: enrichedEvents,
          eventsByDate,
          prices: new Map([
            ['spring-3', 6000],
            ['spring-6', 5500],
          ]),
          durationTypes: new Map<string, TourScheduleDurationType>([
            ['spring-3', 'однодневный'],
            ['spring-6', 'однодневный'],
          ]),
          error: null,
          retry: vi.fn(),
        }}
      >
        <TourCalendar season="spring" />
      </TourScheduleContext.Provider>
    </MemoryRouter>
  );

describe('TourCalendar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 9, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('selects today on mount and shows day panel instead of select hint', () => {
    renderCalendar();

    const todayButton = screen.getByRole('button', { name: /^9 мая/i });
    expect(todayButton).toHaveClass('tour-calendar__day--selected');
    expect(screen.queryByText(UI.tourCalendar.selectDateHint)).not.toBeInTheDocument();
    expect(screen.getByText(spring3.title)).toBeInTheDocument();
    expect(screen.getByText(spring6.title)).toBeInTheDocument();
  });

  it('shows tour cards after clicking a day with events', async () => {
    vi.setSystemTime(new Date(2026, 4, 1, 12, 0, 0));
    renderCalendar();

    const dayButton = screen.getByRole('button', { name: /9 мая, 2 выезда/i });
    fireEvent.click(dayButton);

    expect(dayButton).toHaveClass('tour-calendar__day--selected');
    expect(screen.getByText(spring3.title)).toBeInTheDocument();
    expect(screen.getByText(spring6.title)).toBeInTheDocument();
  });

  it('shows empty day message when day has no events', () => {
    renderCalendar();

    const emptyDayButton = screen.getByRole('button', { name: /^1 мая/i });
    fireEvent.click(emptyDayButton);

    expect(screen.getByText(UI.tourCalendar.emptyDay)).toBeInTheDocument();
  });
});
