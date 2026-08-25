import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { TourScheduleContext } from '../../context/tour-schedule-context-definition';
import { getTourById } from '../../data/toursData';
import { getTourPublicPath } from '../../constants/routes';
import type { EnrichedScheduleEvent } from '../../types/tourSchedule';
import TourScheduleListItem from './TourScheduleListItem';

const spring3 = getTourById('spring-3');
if (spring3 == null) {
  throw new Error('spring-3 missing');
}

const event: EnrichedScheduleEvent = {
  date: '2026-05-09',
  tourId: 'spring-3',
  durationType: 'однодневный',
  priceRub: 6000,
  seats: 8,
  status: 'completed',
  comment: null,
  season: 'spring',
  statusLabel: 'Завершился',
  tour: spring3,
};

function renderItem(publicationStatuses: Map<string, 'active' | 'hidden' | 'in_development'>) {
  return render(
    <MemoryRouter>
      <TourScheduleContext.Provider
        value={{
          status: 'success',
          events: [event],
          eventsByDate: new Map([[event.date, [event]]]),
          prices: new Map(),
          durationTypes: new Map(),
          publicationStatuses,
          error: null,
          retry: vi.fn(),
        }}
      >
        <TourScheduleListItem event={event} />
      </TourScheduleContext.Provider>
    </MemoryRouter>,
  );
}

describe('TourScheduleListItem', () => {
  it('links an on-site tour and keeps a hidden tour as a card without a page link', () => {
    const { unmount } = renderItem(new Map([['spring-3', 'active']]));
    expect(screen.getByRole('link')).toHaveAttribute('href', getTourPublicPath(spring3));
    unmount();

    renderItem(new Map([['spring-3', 'hidden']]));
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: spring3.title })).toBeInTheDocument();
  });
});
