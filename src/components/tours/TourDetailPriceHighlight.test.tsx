import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import TourDetailPriceHighlight from './TourDetailPriceHighlight';
import { TourScheduleContext } from '../../context/tour-schedule-context-definition';
import type { EnrichedScheduleEvent } from '../../types/tourSchedule';
import { getTourById } from '../../data/toursData';
import { UI } from '../../constants/ui';

const spring3 = getTourById('spring-3');
if (!spring3) throw new Error('spring-3 missing');

const enrichedEvents: EnrichedScheduleEvent[] = [
  {
    date: '2099-05-09',
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
    date: '2099-05-10',
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

const defaultProps = {
  tourId: 'spring-3',
  price: '6 000 ₽',
  season: 'spring' as const,
};

describe('TourDetailPriceHighlight', () => {
  it('shows future departure dates in the same card as price', () => {
    render(
      <TourScheduleContext.Provider
        value={{
          status: 'success',
          events: enrichedEvents,
          eventsByDate: new Map(),
          error: null,
          retry: vi.fn(),
        }}
      >
        <TourDetailPriceHighlight {...defaultProps} />
      </TourScheduleContext.Provider>
    );

    expect(screen.getByText(UI.tourDetail.priceHighlightLead)).toBeInTheDocument();
    expect(screen.getByText(UI.tourDetail.departuresHeading)).toBeInTheDocument();
    expect(screen.getByText('9 мая 2099')).toBeInTheDocument();
    expect(screen.getByText('10 мая 2099')).toBeInTheDocument();
  });

  it('shows empty departures message when tour has no future dates', () => {
    render(
      <TourScheduleContext.Provider
        value={{
          status: 'success',
          events: [],
          eventsByDate: new Map(),
          error: null,
          retry: vi.fn(),
        }}
      >
        <TourDetailPriceHighlight {...defaultProps} tourId="spring-1" />
      </TourScheduleContext.Provider>
    );

    expect(screen.getByText(UI.tourDetail.departuresEmpty)).toBeInTheDocument();
  });

  it('shows loading skeleton while schedule is loading', () => {
    render(
      <TourScheduleContext.Provider
        value={{
          status: 'loading',
          events: [],
          eventsByDate: new Map(),
          error: null,
          retry: vi.fn(),
        }}
      >
        <TourDetailPriceHighlight {...defaultProps} />
      </TourScheduleContext.Provider>
    );

    expect(
      screen.getByLabelText(UI.tourDetail.departuresLoadingAria)
    ).toBeInTheDocument();
  });
});
