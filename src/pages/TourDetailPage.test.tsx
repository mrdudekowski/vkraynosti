import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import TourDetailPage from './TourDetailPage';
import { ModalProvider } from '../context/ModalContext';
import { TourScheduleContext } from '../context/tour-schedule-context-definition';
import { getTourById } from '../data/toursData';
import { UI } from '../constants/ui';
import { buildTourDetailPath } from '../constants/routes';

const scheduleContextValue = {
  status: 'success' as const,
  events: [],
  eventsByDate: new Map(),
  prices: new Map(),
  durationTypes: new Map(),
  publicationStatuses: new Map([['summer-13', 'in_development' as const]]),
  error: null,
  retry: vi.fn(),
};

const renderTourDetailPage = (tourId: string) => {
  const tour = getTourById(tourId);
  if (!tour) throw new Error(`tour ${tourId} missing`);

  return render(
    <HelmetProvider>
      <TourScheduleContext.Provider value={scheduleContextValue}>
        <ModalProvider>
          <MemoryRouter initialEntries={[buildTourDetailPath(tour.season, tour.id)]}>
            <Routes>
              <Route path="/tours/:season/:tourId" element={<TourDetailPage />} />
            </Routes>
          </MemoryRouter>
        </ModalProvider>
      </TourScheduleContext.Provider>
    </HelmetProvider>
  );
};

describe('TourDetailPage hidden', () => {
  it('shows not found for hidden tour', () => {
    const tour = getTourById('spring-1');
    if (!tour) throw new Error('spring-1 missing');

    render(
      <HelmetProvider>
        <TourScheduleContext.Provider
          value={{
            ...scheduleContextValue,
            publicationStatuses: new Map([['spring-1', 'hidden']]),
          }}
        >
          <ModalProvider>
            <MemoryRouter initialEntries={[buildTourDetailPath(tour.season, tour.id)]}>
              <Routes>
                <Route path="/tours/:season/:tourId" element={<TourDetailPage />} />
              </Routes>
            </MemoryRouter>
          </ModalProvider>
        </TourScheduleContext.Provider>
      </HelmetProvider>,
    );

    expect(screen.getByText(UI.tourDetail.notFound)).toBeInTheDocument();
    expect(screen.queryByTestId('tour-detail-main')).not.toBeInTheDocument();
  });
});

describe('TourDetailPage inDevelopment', () => {
  it('renders in-development layout for summer-13', () => {
    renderTourDetailPage('summer-13');

    expect(screen.getByTestId('tour-detail-main')).toBeInTheDocument();
    expect(screen.getByTestId('tour-detail-in-development')).toBeInTheDocument();
    expect(screen.getByText(UI.tourDetail.inDevelopmentHeading)).toBeInTheDocument();
    expect(screen.getByText(UI.tourDetail.programInDevelopment)).toBeInTheDocument();
    const departuresEmptyMessages = screen.getAllByText(UI.tourDetail.departuresEmpty);
    expect(departuresEmptyMessages.length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText(UI.tourDetail.gallery)).not.toBeInTheDocument();
    expect(screen.queryByText(UI.tourDetail.includedHeading)).not.toBeInTheDocument();
  });
});

describe('TourDetailPage full layout', () => {
  it('renders full layout for a published tour', () => {
    renderTourDetailPage('spring-1');

    expect(screen.getByTestId('tour-detail-main')).toBeInTheDocument();
    expect(screen.queryByTestId('tour-detail-in-development')).not.toBeInTheDocument();
    expect(screen.getByText(UI.tourDetail.includedHeading)).toBeInTheDocument();
  });
});
