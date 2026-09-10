import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Outlet, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CmsTourDocument } from '../cms/cmsTourDocument';
import type { AdminSession, AdminTourListItem } from './api';
import { isAdminSeasonParam } from './constants/routes';
import { ADMIN_UI } from './constants/ui';
import { formatAdminOnSiteCount } from './formatAdminCopy';
import { AdminToastProvider } from './components/AdminToast';

vi.mock('./api', () => ({
  adminListTours: vi.fn(),
  adminListDepartures: vi.fn(),
  adminCreateTour: vi.fn(),
}));

vi.mock('./applyAdminTourGuestVisibility', () => ({
  applyAdminTourGuestVisibility: vi.fn(),
}));

import { adminCreateTour, adminListDepartures, adminListTours } from './api';
import { applyAdminTourGuestVisibility } from './applyAdminTourGuestVisibility';
import { clearAdminDataCache } from './adminDataCache';
import SeasonToursPage from './SeasonToursPage';

const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
};

const TourOrSeason = () => {
  const { tourId } = useParams<{ tourId: string }>();
  if (isAdminSeasonParam(tourId)) {
    return <SeasonToursPage />;
  }
  return <LocationProbe />;
};

const createdDocument = {
  id: 'winter-2',
  slug: 'novyy-tur',
  season: 'winter',
  status: 'draft',
  title: 'Новый тур',
} as CmsTourDocument;

const onSiteTour: AdminTourListItem = {
  id: 'winter-1',
  title: 'Изюбриная',
  season: 'winter',
  status: 'active',
  published: true,
  slug: 'izubrinaya',
  imageUrl: null,
  ready: true,
  readyCount: 5,
  readyTotal: 5,
};

const adminSession: AdminSession = {
  login: 'alice',
  role: 'admin',
  canPublishTours: true,
  canPublishSchedule: true,
};

function renderSeason(session: AdminSession = adminSession) {
  return render(
    <AdminToastProvider>
      <MemoryRouter initialEntries={['/tours/winter']}>
        <Routes>
          <Route element={<Outlet context={{ session }} />}>
            <Route path="/tours/:tourId" element={<TourOrSeason />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AdminToastProvider>,
  );
}

describe('SeasonToursPage', () => {
  beforeEach(() => {
    clearAdminDataCache();
    vi.mocked(adminListTours).mockReset();
    vi.mocked(adminListDepartures).mockReset();
    vi.mocked(adminCreateTour).mockReset();
    vi.mocked(applyAdminTourGuestVisibility).mockReset();
    vi.mocked(adminListTours).mockResolvedValue([onSiteTour]);
    vi.mocked(adminListDepartures).mockResolvedValue([]);
    vi.mocked(adminCreateTour).mockResolvedValue({
      document: createdDocument,
      meta: { rev: 1, updatedAt: '2026-08-16T00:00:00.000Z', editor: 'editor' },
    });
    vi.mocked(applyAdminTourGuestVisibility).mockResolvedValue('queued');
  });

  it('создаёт тур в текущем сезоне', async () => {
    const user = userEvent.setup();
    renderSeason();

    expect(await screen.findByRole('link', { name: /Изюбриная/ })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: ADMIN_UI.individualTours })).not.toBeInTheDocument();
    expect(screen.getByText(formatAdminOnSiteCount(1, 1))).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: ADMIN_UI.addTour }));
    const dialog = screen.getByRole('dialog', { name: ADMIN_UI.createTourTitle });
    expect(within(dialog).queryByLabelText(ADMIN_UI.createTourSeason)).not.toBeInTheDocument();
    await user.type(screen.getByLabelText(ADMIN_UI.tourNameLabel), 'Новый тур');
    await user.click(screen.getByRole('button', { name: ADMIN_UI.createTourSubmit }));

    expect(adminCreateTour).toHaveBeenCalledWith({
      title: 'Новый тур',
      season: 'winter',
      slug: 'novyy-tur',
    });
    expect(await screen.findByTestId('location')).toHaveTextContent('/tours/winter-2');
  });

  it('переключает сезон иконками как на сайте', async () => {
    const user = userEvent.setup();
    renderSeason();

    expect(await screen.findByRole('tab', { name: ADMIN_UI.seasons.winter })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await user.click(screen.getByRole('tab', { name: ADMIN_UI.seasons.summer }));
    expect(screen.getByRole('tab', { name: ADMIN_UI.seasons.summer })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('скрывает опубликованный тур в очередь, гость ещё видит живую копию', async () => {
    const user = userEvent.setup();
    vi.mocked(adminListTours)
      .mockResolvedValueOnce([onSiteTour])
      .mockResolvedValueOnce([{ ...onSiteTour, status: 'hidden', publishedStatus: 'active' }]);

    renderSeason();

    expect(await screen.findByRole('link', { name: /Изюбриная/ })).toBeInTheDocument();
    expect(screen.getAllByText(ADMIN_UI.tourLiveVisibility.on_site).length).toBeGreaterThan(0);
    await user.click(screen.getByRole('button', { name: ADMIN_UI.tourMenu }));
    await user.click(screen.getByRole('menuitem', { name: ADMIN_UI.tourHideQueuedAction }));

    expect(applyAdminTourGuestVisibility).toHaveBeenCalledWith('winter-1', 'hidden');
    expect(await screen.findByText(ADMIN_UI.tourHiddenQueued)).toBeInTheDocument();
    expect(await screen.findByText(ADMIN_UI.tourLiveVisibility.will_hide)).toBeInTheDocument();
    expect(screen.getByText(formatAdminOnSiteCount(1, 1))).toBeInTheDocument();
  });

  it('редактору показывает скрытие как постановку в публикации', async () => {
    const user = userEvent.setup();
    vi.mocked(applyAdminTourGuestVisibility).mockResolvedValue('queued');
    renderSeason({
      login: 'bob',
      role: 'editor',
      canPublishTours: false,
      canPublishSchedule: false,
    });

    expect(await screen.findByRole('link', { name: /Изюбриная/ })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: ADMIN_UI.tourMenu }));
    expect(screen.getByRole('menuitem', { name: ADMIN_UI.tourHideQueuedAction })).toBeInTheDocument();
    await user.click(screen.getByRole('menuitem', { name: ADMIN_UI.tourHideQueuedAction }));
    expect(applyAdminTourGuestVisibility).toHaveBeenCalledWith('winter-1', 'hidden');
    expect(await screen.findByText(ADMIN_UI.tourHiddenQueued)).toBeInTheDocument();
  });
});
