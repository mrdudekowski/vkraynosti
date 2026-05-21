import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import TourCalendar from './TourCalendar';
import { TourScheduleContext } from '../../context/tour-schedule-context-definition';
import type { EnrichedScheduleEvent } from '../../types/tourSchedule';
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
          error: null,
          retry: vi.fn(),
        }}
      >
        <TourCalendar />
      </TourScheduleContext.Provider>
    </MemoryRouter>
  );

describe('TourCalendar', () => {
  it('shows tour cards after clicking a day with events', async () => {
    const user = userEvent.setup();
    renderCalendar();

    const dayButton = screen.getByRole('button', { name: /9 мая, 2 выезда/i });
    await user.click(dayButton);

    expect(screen.getByText(spring3.title)).toBeInTheDocument();
    expect(screen.getByText(spring6.title)).toBeInTheDocument();
  });

  it('shows empty day message when day has no events', async () => {
    const user = userEvent.setup();
    renderCalendar();

    const emptyDayButton = screen.getByRole('button', { name: /^1 мая/i });
    await user.click(emptyDayButton);

    expect(screen.getByText(UI.tourCalendar.emptyDay)).toBeInTheDocument();
  });
});
