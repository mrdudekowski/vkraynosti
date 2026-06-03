import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import TourCard from './TourCard';
import { TourScheduleContext } from '../../context/tour-schedule-context-definition';
import { getTourById } from '../../data/toursData';
import { UI } from '../../constants/ui';

const summer13 = getTourById('summer-13');
const spring3 = getTourById('spring-3');
if (!summer13 || !spring3) throw new Error('test tours missing');

const scheduleWithPrice = {
  status: 'success' as const,
  events: [],
  eventsByDate: new Map(),
  prices: new Map([['summer-13', 7500], ['spring-3', 6500]]),
  durationTypes: new Map(),
  publicationStatuses: new Map([
    ['summer-13', 'in_development' as const],
    ['spring-3', 'active' as const],
  ]),
  error: null,
  retry: vi.fn(),
};

const renderTourCard = (tour: NonNullable<typeof summer13>) =>
  render(
    <MemoryRouter>
      <TourScheduleContext.Provider value={scheduleWithPrice}>
        <TourCard tour={tour} />
      </TourScheduleContext.Provider>
    </MemoryRouter>
  );

describe('TourCard inDevelopment', () => {
  it('shows subtitle and brand label without price or duration', () => {
    renderTourCard(summer13);

    expect(screen.getByRole('heading', { name: summer13.title })).toBeInTheDocument();
    expect(screen.getByText(summer13.subtitle)).toBeInTheDocument();
    expect(
      screen.getByText(UI.tourDetail.inDevelopmentPageAriaLabel)
    ).toHaveClass('font-brand-wordmark');
    expect(screen.queryByText('7 500 ₽')).not.toBeInTheDocument();
    expect(screen.queryByText(UI.tourDetail.durationDisplayOneDay)).not.toBeInTheDocument();
  });
});

describe('TourCard published', () => {
  it('shows schedule price for a published tour', () => {
    renderTourCard(spring3);

    expect(screen.getByText('6 500 ₽')).toBeInTheDocument();
    expect(
      screen.queryByText(UI.tourDetail.inDevelopmentPageAriaLabel)
    ).not.toBeInTheDocument();
  });
});
