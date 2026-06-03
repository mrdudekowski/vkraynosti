import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import TourDetailPriceHighlight from './TourDetailPriceHighlight';
import { TourScheduleContext } from '../../context/tour-schedule-context-definition';
import type {
  EnrichedScheduleEvent,
  TourScheduleDurationType,
} from '../../types/tourSchedule';
import { getTourById } from '../../data/toursData';
import { UI } from '../../constants/ui';
import { TOUR_DEPARTURE_DAY_DEPARTURE_CLASS } from '../../constants/tourDepartureCalendar';

const spring3 = getTourById('spring-3');
const spring1 = getTourById('spring-1');
if (!spring3 || !spring1) throw new Error('test tours missing');

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

const scheduleContextValue = (
  overrides: Partial<{
    status: 'success' | 'loading';
    events: EnrichedScheduleEvent[];
    prices: ReadonlyMap<string, number>;
  }> = {}
) => ({
  status: 'success' as const,
  events: enrichedEvents,
  eventsByDate: new Map(),
  prices: new Map([['spring-3', 6500]]),
  durationTypes: new Map<string, TourScheduleDurationType>([
    ['spring-3', 'однодневный'],
  ]),
  publicationStatuses: new Map(),
  error: null,
  retry: vi.fn(),
  ...overrides,
});

describe('TourDetailPriceHighlight', () => {
  it('shows schedule price and future departure dates in one card', () => {
    render(
      <TourScheduleContext.Provider value={scheduleContextValue()}>
        <TourDetailPriceHighlight tour={spring3} />
      </TourScheduleContext.Provider>
    );

    expect(screen.getByText(UI.tourDetail.priceHighlightLead)).toBeInTheDocument();
    expect(screen.getByText('6 500 ₽')).toBeInTheDocument();
    expect(screen.getByText(UI.tourDetail.departuresHeading)).toBeInTheDocument();
    expect(
      screen.getByRole('group', { name: UI.tourDepartureCalendar.calendarAriaLabel })
    ).toBeInTheDocument();
    const calendar = screen.getByRole('group', {
      name: UI.tourDepartureCalendar.calendarAriaLabel,
    });
    expect(calendar.querySelectorAll(`.${TOUR_DEPARTURE_DAY_DEPARTURE_CLASS}`).length).toBeGreaterThan(
      0
    );
    expect(screen.queryByRole('button', { name: /Выезд:/i })).not.toBeInTheDocument();
  });

  it('shows empty departures message when tour has no future dates', () => {
    render(
      <TourScheduleContext.Provider
        value={scheduleContextValue({ events: [], prices: new Map() })}
      >
        <TourDetailPriceHighlight tour={spring1} />
      </TourScheduleContext.Provider>
    );

    expect(screen.getByText(UI.tourDetail.departuresEmpty)).toBeInTheDocument();
  });

  it('shows loading skeleton while schedule is loading', () => {
    render(
      <TourScheduleContext.Provider
        value={scheduleContextValue({ status: 'loading', events: [], prices: new Map() })}
      >
        <TourDetailPriceHighlight tour={spring3} />
      </TourScheduleContext.Provider>
    );

    expect(
      screen.getByLabelText(UI.tourDetail.departuresLoadingAria)
    ).toBeInTheDocument();
  });

  it('shows empty departures immediately when forceDeparturesEmpty is set', () => {
    const summer13 = getTourById('summer-13');
    if (!summer13) throw new Error('summer-13 missing');

    render(
      <TourScheduleContext.Provider
        value={scheduleContextValue({ status: 'loading', events: enrichedEvents })}
      >
        <TourDetailPriceHighlight
          tour={summer13}
          forceDeparturesEmpty
          preferCatalogPrice={false}
        />
      </TourScheduleContext.Provider>
    );

    expect(screen.getByText(summer13.price)).toBeInTheDocument();
    expect(screen.getByText(UI.tourDetail.departuresEmpty)).toBeInTheDocument();
    expect(
      screen.queryByLabelText(UI.tourDetail.departuresLoadingAria)
    ).not.toBeInTheDocument();
  });
});
