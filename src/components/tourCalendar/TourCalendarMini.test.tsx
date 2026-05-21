import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import TourCalendarMini from './TourCalendarMini';
import { TourScheduleContext } from '../../context/tour-schedule-context-definition';
import type { EnrichedScheduleEvent } from '../../types/tourSchedule';
import { getTourById } from '../../data/toursData';
import { UI } from '../../constants/ui';

const spring3 = getTourById('spring-3');
if (!spring3) throw new Error('spring-3 missing');

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
    date: '2026-05-10',
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
];

const eventsByDate = new Map([
  ['2026-05-09', [enrichedEvents[0]!]],
  ['2026-05-10', [enrichedEvents[1]!]],
]);

describe('TourCalendarMini', () => {
  it('shows only current tour dates and schedule link', () => {
    render(
      <MemoryRouter>
        <TourScheduleContext.Provider
          value={{
            status: 'success',
            events: enrichedEvents,
            eventsByDate,
            error: null,
            retry: vi.fn(),
          }}
        >
          <TourCalendarMini tourId="spring-3" season="spring" />
        </TourScheduleContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText(UI.tourCalendarMini.title)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: UI.tourCalendarMini.allScheduleLink })).toHaveAttribute(
      'href',
      '/#kalendar'
    );
  });

  it('shows empty state when tour has no departures', () => {
    render(
      <MemoryRouter>
        <TourScheduleContext.Provider
          value={{
            status: 'success',
            events: [],
            eventsByDate: new Map(),
            error: null,
            retry: vi.fn(),
          }}
        >
          <TourCalendarMini tourId="spring-1" season="spring" />
        </TourScheduleContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText(UI.tourCalendarMini.empty)).toBeInTheDocument();
  });
});
