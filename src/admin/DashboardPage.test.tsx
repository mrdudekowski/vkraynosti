import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ADMIN_UI } from './constants/ui';
import type { AdminSession } from './api';
import { formatAdminOnSiteCount } from './formatAdminCopy';

vi.mock('./api', () => ({
  adminListTours: vi.fn(),
  adminListDepartures: vi.fn(),
  adminListPublishQueue: vi.fn(),
  adminUpdateDeparture: vi.fn(),
}));

import { adminListDepartures, adminListPublishQueue, adminListTours, adminUpdateDeparture } from './api';
import { clearAdminDataCache } from './adminDataCache';
import DashboardPage from './DashboardPage';
import { addIsoDays, vladivostokCalendarDate } from './scheduleCalendar';

const session: AdminSession = {
  login: 'alice',
  role: 'admin',
  canPublishTours: true,
  canPublishSchedule: true,
};

const editorSession: AdminSession = {
  login: 'editor',
  role: 'editor',
  canPublishTours: false,
  canPublishSchedule: false,
};

const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid="location">{`${location.pathname}${location.search}`}</div>;
};

describe('DashboardPage', () => {
  beforeEach(() => {
    clearAdminDataCache();
    vi.mocked(adminListTours).mockResolvedValue([
      {
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
      },
      {
        id: 'winter-draft',
        title: 'Недописанный',
        season: 'winter',
        status: 'draft',
        published: false,
        slug: 'nedopisannyy',
        imageUrl: null,
        ready: false,
        readyCount: 2,
        readyTotal: 5,
      },
    ]);
    vi.mocked(adminListDepartures).mockResolvedValue([]);
    vi.mocked(adminListPublishQueue).mockResolvedValue([]);
    vi.mocked(adminUpdateDeparture).mockImplementation(async (id, patch) => ({
      id,
      tourId: 'winter-1',
      startsOn: '2026-08-20',
      endsOn: '2026-08-20',
      seats: 8,
      status: patch.status ?? 'open',
      version: patch.version + 1,
      createdAt: '2026-08-18T00:00:00.000Z',
      updatedAt: '2026-08-18T00:00:00.000Z',
    }));
  });

  it('ведёт в очередь публикации', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<Outlet context={{ session }} />}>
            <Route path="/" element={<DashboardPage />} />
          </Route>
          <Route path="/inbox" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: ADMIN_UI.dashboardTitle })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: ADMIN_UI.dashboardOpenInbox }));
    expect(screen.getByTestId('location')).toHaveTextContent('/inbox');
  });

  it('ведёт пункт очереди выезда в календарь', async () => {
    const user = userEvent.setup();
    vi.mocked(adminListPublishQueue).mockResolvedValue([
      {
        kind: 'departure',
        id: 'd1',
        tourId: 'winter-1',
        title: 'Изюбриная',
        startsOn: '2026-08-20',
        ready: true,
      },
    ]);
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<Outlet context={{ session }} />}>
            <Route path="/" element={<DashboardPage />} />
          </Route>
          <Route path="/schedule" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(
      await screen.findByRole('link', {
        name: `Изюбриная. ${ADMIN_UI.dashboardSeverity.later}. ${ADMIN_UI.dashboardQueueAttention}`,
      }),
    );
    expect(screen.getByTestId('location')).toHaveTextContent('/schedule');
  });

  it('не держит создание и заглушку истории на главной', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<Outlet context={{ session }} />}>
            <Route path="/" element={<DashboardPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    await screen.findByRole('heading', { name: ADMIN_UI.dashboardTitle });
    expect(screen.queryByRole('button', { name: ADMIN_UI.quickAdd })).not.toBeInTheDocument();
    expect(screen.queryByText(ADMIN_UI.dashboardActivityPlaceholderTitle)).not.toBeInTheDocument();
  });

  it('не сваливает в внимание все неготовые черновики и показывает счётчик на сайте', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<Outlet context={{ session }} />}>
            <Route path="/" element={<DashboardPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: ADMIN_UI.dashboardTitle })).toBeInTheDocument();
    expect(screen.getByText(ADMIN_UI.dashboardAttentionEmpty)).toBeInTheDocument();
    expect(screen.queryByText(/Недописанный/)).not.toBeInTheDocument();
    expect(screen.getByText(formatAdminOnSiteCount(1, 2))).toBeInTheDocument();
    expect(screen.getByText(ADMIN_UI.dashboardMetricOnSite)).toBeInTheDocument();
    expect(screen.getByText(ADMIN_UI.dashboardMetricAttention)).toBeInTheDocument();
    expect(screen.getByText(ADMIN_UI.dashboardMetricPublicationQueue)).toBeInTheDocument();
  });

  it('показывает автору задачу публикации в блоке внимания', async () => {
    vi.mocked(adminListPublishQueue).mockResolvedValue([
      { kind: 'tour', id: 'winter-1', tourId: 'winter-1', title: 'Изюбриная', author: 'editor', summary: 'tour_draft' },
    ]);

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<Outlet context={{ session: editorSession }} />}>
            <Route path="/" element={<DashboardPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole('link', {
        name: `Изюбриная. ${ADMIN_UI.dashboardSeverity.later}. ${ADMIN_UI.dashboardQueueAttention}`,
      }),
    ).toHaveAttribute('href', '/tours/winter-1');
  });

  it('ограничивает attention rail восемью задачами и ведёт остальные в публикации', async () => {
    vi.mocked(adminListTours).mockResolvedValue(
      ['Один', 'Два', 'Три', 'Четыре', 'Пять', 'Шесть', 'Семь', 'Восемь', 'Девять'].map((title, index) => ({
        id: `winter-${index + 1}`,
        title,
        season: 'winter' as const,
        status: 'active' as const,
        published: true,
        slug: `winter-${index + 1}`,
        imageUrl: null,
        ready: false,
        readyCount: 3,
        readyTotal: 5,
      })),
    );

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<Outlet context={{ session }} />}>
            <Route path="/" element={<DashboardPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText('Один')).toBeVisible();
    expect(screen.getByText('Восемь')).toBeVisible();
    expect(screen.queryByText('Девять')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: ADMIN_UI.dashboardMoreAttention })).toHaveAttribute(
      'href',
      '/inbox',
    );
  });

  it('shows nearest departures, strikes cancelled, and opens the departure on the calendar', async () => {
    const user = userEvent.setup();
    const today = vladivostokCalendarDate();
    const first = addIsoDays(today, 1);
    const second = addIsoDays(today, 2);
    vi.mocked(adminListDepartures).mockResolvedValue([
      {
        id: 'dep-cancelled',
        tourId: 'winter-1',
        startsOn: first,
        endsOn: first,
        seats: 8,
        status: 'cancelled',
        version: 1,
        createdAt: '2026-08-18T00:00:00.000Z',
        updatedAt: '2026-08-18T00:00:00.000Z',
      },
      {
        id: 'dep-open',
        tourId: 'winter-1',
        startsOn: second,
        endsOn: second,
        seats: 8,
        status: 'open',
        version: 1,
        createdAt: '2026-08-18T00:00:00.000Z',
        updatedAt: '2026-08-18T00:00:00.000Z',
      },
    ]);

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<Outlet context={{ session }} />}>
            <Route path="/" element={<DashboardPage />} />
          </Route>
          <Route path="/schedule" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: ADMIN_UI.homeNearest })).toBeInTheDocument();
    expect(screen.getByText(ADMIN_UI.dashboardCurrentQuiet)).toBeInTheDocument();
    const cancelled = await screen.findByRole('link', { name: `Изюбриная ${first}` });
    expect(cancelled).toHaveClass('line-through');

    await user.click(screen.getByRole('link', { name: `Изюбриная ${second}` }));
    expect(screen.getByTestId('location')).toHaveTextContent(
      `/schedule?date=${second}&departure=dep-open`,
    );
  });
});
