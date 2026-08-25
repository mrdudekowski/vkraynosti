import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ADMIN_INBOX_SORT_STORAGE_KEY, ADMIN_INBOX_TAB_STORAGE_KEY } from '../constants/adminUiTokens';
import { ADMIN_UI } from './constants/ui';
import type { AdminSession } from './api';

vi.mock('./api', () => ({
  adminListPublishQueue: vi.fn(),
  adminListTours: vi.fn(),
  adminSubmitPublishQueue: vi.fn(),
  adminPublishQueue: vi.fn(),
  adminReturnPublishQueue: vi.fn(),
}));

import { adminListPublishQueue, adminListTours, adminPublishQueue, adminReturnPublishQueue } from './api';
import { clearAdminDataCache } from './adminDataCache';
import { AdminToastProvider } from './components/AdminToast';
import InboxPage from './InboxPage';

const editorSession: AdminSession = {
  login: 'bob',
  role: 'editor',
  canPublishTours: false,
  canPublishSchedule: false,
};

const adminSession: AdminSession = {
  login: 'alice',
  role: 'admin',
  canPublishTours: true,
  canPublishSchedule: true,
};

function renderInbox(session: AdminSession) {
  return render(
    <AdminToastProvider>
      <MemoryRouter initialEntries={['/inbox']}>
        <Routes>
          <Route element={<Outlet context={{ session }} />}>
            <Route path="/inbox" element={<InboxPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AdminToastProvider>,
  );
}

describe('InboxPage', () => {
  beforeEach(() => {
    window.localStorage.removeItem(ADMIN_INBOX_TAB_STORAGE_KEY);
    window.localStorage.removeItem(ADMIN_INBOX_SORT_STORAGE_KEY);
    clearAdminDataCache();
    vi.mocked(adminListPublishQueue).mockResolvedValue([
      {
        kind: 'tour',
        id: 'winter-2',
        tourId: 'winter-2',
        title: 'Изюбриная',
        author: 'петр',
        timestamp: '2026-08-19T10:00:00.000Z',
        ready: true,
        rev: 2,
        summary: 'new_tour',
      },
      {
        kind: 'departure',
        id: 'dep-1',
        tourId: 'winter-2',
        title: 'Изюбриная',
        startsOn: '2026-08-20',
        author: 'анна',
        timestamp: '2026-08-19T12:00:00.000Z',
        ready: true,
        summary: 'new_departure',
      },
    ]);
    vi.mocked(adminListTours).mockResolvedValue([]);
    vi.mocked(adminPublishQueue).mockResolvedValue(undefined);
    vi.mocked(adminReturnPublishQueue).mockResolvedValue(undefined);
  });

  it('lists live queue items without a bulk submit for editors', async () => {
    renderInbox(editorSession);

    expect(await screen.findAllByText('Изюбриная')).not.toHaveLength(0);
    expect(screen.queryByRole('button', { name: ADMIN_UI.inboxSubmitAll })).not.toBeInTheDocument();
  });

  it('карточка выездов не записывает фильтр так, что вкладка Все прячет туры', async () => {
    const user = userEvent.setup();
    renderInbox(editorSession);

    expect(await screen.findByText(ADMIN_UI.inboxTourItem)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: new RegExp(ADMIN_UI.inboxStatDepartures) }));
    expect(screen.queryByText(ADMIN_UI.inboxTourItem)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: ADMIN_UI.tourVisibility.all }));
    expect(screen.getByText(ADMIN_UI.inboxTourItem)).toBeInTheDocument();
  });

  it('publishes a single row for a publisher', async () => {
    const user = userEvent.setup();
    renderInbox(adminSession);
    expect(await screen.findAllByText('Изюбриная')).not.toHaveLength(0);
    await user.click(screen.getByRole('button', { name: ADMIN_UI.inboxTabTours }));
    await user.click(screen.getByRole('button', { name: ADMIN_UI.inboxPublishOne }));
    expect(adminPublishQueue).toHaveBeenCalledWith({
      tourIds: ['winter-2'],
      departureIds: [],
      tourRevs: { 'winter-2': 2 },
    });
  });

  it('publishes the filtered tours for a publisher', async () => {
    const user = userEvent.setup();
    renderInbox(adminSession);
    expect(await screen.findAllByText('Изюбриная')).not.toHaveLength(0);
    await user.click(screen.getByRole('button', { name: ADMIN_UI.inboxTabTours }));
    await user.click(screen.getByRole('button', { name: ADMIN_UI.inboxPublishAll }));
    expect(adminPublishQueue).toHaveBeenCalledWith({
      tourIds: ['winter-2'],
      departureIds: [],
      tourRevs: { 'winter-2': 2 },
    });
  });

  it('hides publish and return from an editor without publish rights', async () => {
    renderInbox(editorSession);
    expect(await screen.findByText(ADMIN_UI.inboxTourItem)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: ADMIN_UI.inboxPublishOne })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: ADMIN_UI.inboxReturnShort })).not.toBeInTheDocument();
  });

  it('lets a publisher return a tour for revision', async () => {
    const user = userEvent.setup();
    renderInbox(adminSession);
    expect(await screen.findAllByText('Изюбриная')).not.toHaveLength(0);
    await user.click(screen.getByRole('button', { name: ADMIN_UI.inboxTabTours }));
    await user.click(screen.getByRole('button', { name: ADMIN_UI.inboxReturnShort }));
    const sheet = screen.getByRole('dialog', { name: ADMIN_UI.inboxReturn });
    await user.type(within(sheet).getByLabelText(ADMIN_UI.inboxReturnReason), 'Дополнить программу');
    await user.click(within(sheet).getByRole('button', { name: ADMIN_UI.inboxReturn }));
    expect(adminReturnPublishQueue).toHaveBeenCalledWith({
      reason: 'Дополнить программу',
      tourIds: ['winter-2'],
      departureIds: [],
    });
  });

  it('filters the queue by tours, departures and author', async () => {
    const user = userEvent.setup();
    renderInbox(editorSession);

    expect(await screen.findByText(ADMIN_UI.inboxTourItem)).toBeInTheDocument();
    expect(screen.getByText(ADMIN_UI.inboxDepartureItem)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: ADMIN_UI.inboxTabTours }));
    expect(screen.getByText(ADMIN_UI.inboxTourItem)).toBeInTheDocument();
    expect(screen.queryByText(ADMIN_UI.inboxDepartureItem)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: ADMIN_UI.inboxTabDepartures }));
    expect(screen.queryByText(ADMIN_UI.inboxTourItem)).not.toBeInTheDocument();
    expect(screen.getByText(ADMIN_UI.inboxDepartureItem)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: ADMIN_UI.tourVisibility.all }));
    await user.selectOptions(screen.getByLabelText(ADMIN_UI.inboxAuthorFilter), 'петр');
    expect(screen.getByText(ADMIN_UI.inboxTourItem)).toBeInTheDocument();
    expect(screen.queryByText(ADMIN_UI.inboxDepartureItem)).not.toBeInTheDocument();
  });
});
