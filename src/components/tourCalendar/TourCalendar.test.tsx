import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CASCADE_GRID_FADE_OUT_DURATION_MS, getCascadeGridTotalDurationMs } from '../../constants/cascadeGridReveal';
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
          publicationStatuses: new Map(),
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
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('selects today on mount and shows day panel instead of select hint', () => {
    renderCalendar();

    const todayButton = screen.getByRole('button', { name: /^9 мая/i });
    expect(todayButton).toHaveClass('tour-calendar__day--selected');
    expect(screen.queryByText(UI.tourCalendar.selectDateHintLine1)).not.toBeInTheDocument();
    expect(screen.getByText(spring3.title)).toBeInTheDocument();
    expect(screen.getByText(spring6.title)).toBeInTheDocument();
  });

  it('shows tour cards after clicking a day with events', () => {
    vi.setSystemTime(new Date(2026, 4, 1, 12, 0, 0));
    renderCalendar();

    act(() => {
      vi.advanceTimersByTime(getCascadeGridTotalDurationMs(1) + 50);
    });

    const dayButton = screen.getByRole('button', { name: /9 мая, 2 выезда/i });
    fireEvent.click(dayButton);

    act(() => {
      vi.advanceTimersByTime(
        CASCADE_GRID_FADE_OUT_DURATION_MS + getCascadeGridTotalDurationMs(2 + 1) + 50,
      );
    });

    expect(dayButton).toHaveClass('tour-calendar__day--selected');
    expect(screen.getByText(spring3.title)).toBeInTheDocument();
    expect(screen.getByText(spring6.title)).toBeInTheDocument();
  });

  it('shows empty day message when day has no events', () => {
    renderCalendar();

    act(() => {
      vi.advanceTimersByTime(getCascadeGridTotalDurationMs(2 + 1) + 50);
    });

    const emptyDayButton = screen.getByRole('button', { name: /^1 мая/i });
    fireEvent.click(emptyDayButton);

    act(() => {
      vi.advanceTimersByTime(
        CASCADE_GRID_FADE_OUT_DURATION_MS + getCascadeGridTotalDurationMs(1) + 50,
      );
    });

    expect(screen.getByText(UI.tourCalendar.emptyDay)).toBeInTheDocument();
  });

  it('shows select hint after deselecting the active day', () => {
    renderCalendar();

    act(() => {
      vi.advanceTimersByTime(getCascadeGridTotalDurationMs(2 + 1) + 50);
    });

    const todayButton = screen.getByRole('button', { name: /^9 мая/i });
    fireEvent.click(todayButton);

    act(() => {
      vi.advanceTimersByTime(
        CASCADE_GRID_FADE_OUT_DURATION_MS + getCascadeGridTotalDurationMs(1) + 50,
      );
    });

    expect(todayButton).not.toHaveClass('tour-calendar__day--selected');
    expect(screen.getByText(UI.tourCalendar.selectDateHintLine1)).toBeInTheDocument();
    expect(screen.queryByText(spring3.title)).not.toBeInTheDocument();
  });
});
