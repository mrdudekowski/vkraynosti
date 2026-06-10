import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import TourDetailPage from './TourDetailPage';
import { ModalProvider } from '../context/ModalContext';
import { TourScheduleContext } from '../context/tour-schedule-context-definition';
import { getTourById } from '../data/toursData';
import { UI } from '../constants/ui';
import {
  getLegacyTourPath,
  getTourPublicPath,
} from '../constants/tourUrls';

const LocationDisplay = () => {
  const { pathname } = useLocation();
  return <div data-testid="location">{pathname}</div>;
};

const scheduleContextValue = {
  status: 'success' as const,
  events: [],
  eventsByDate: new Map(),
  prices: new Map(),
  durationTypes: new Map(),
  publicationStatuses: new Map([
    ['spring-1', 'active' as const],
    ['summer-10', 'active' as const],
    ['summer-13', 'in_development' as const],
  ]),
  error: null,
  retry: vi.fn(),
};

const renderTourDetailAtPath = (initialPath: string) =>
  render(
    <HelmetProvider>
      <TourScheduleContext.Provider value={scheduleContextValue}>
        <ModalProvider>
          <MemoryRouter initialEntries={[initialPath]}>
            <LocationDisplay />
            <Routes>
              <Route path="/tours/:season/:tourId" element={<TourDetailPage />} />
            </Routes>
          </MemoryRouter>
        </ModalProvider>
      </TourScheduleContext.Provider>
    </HelmetProvider>,
  );

const renderTourDetailPage = (tourId: string) => {
  const tour = getTourById(tourId);
  if (!tour) throw new Error(`tour ${tourId} missing`);
  return renderTourDetailAtPath(getTourPublicPath(tour));
};

describe('TourDetailPage slug routing', () => {
  it('opens summer-10 by slug URL', () => {
    renderTourDetailAtPath('/tours/summer/robinzonada-v-rayone-tryokhi/');
    expect(screen.getByTestId('tour-detail-main')).toBeInTheDocument();
  });

  it('redirects legacy id URL to slug URL', () => {
    const tour = getTourById('summer-10');
    if (!tour) throw new Error('summer-10 missing');

    renderTourDetailAtPath(getLegacyTourPath(tour));

    expect(screen.getByTestId('location')).toHaveTextContent(getTourPublicPath(tour));
  });
});

describe('TourDetailPage hidden', () => {
  it('shows not found for hidden tour after schedule loaded', () => {
    const tour = getTourById('spring-1');
    if (!tour) throw new Error('spring-1 missing');

    render(
      <HelmetProvider>
        <TourScheduleContext.Provider
          value={{
            ...scheduleContextValue,
            status: 'success',
            publicationStatuses: new Map([['spring-1', 'hidden']]),
          }}
        >
          <ModalProvider>
            <MemoryRouter initialEntries={[getTourPublicPath(tour)]}>
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
