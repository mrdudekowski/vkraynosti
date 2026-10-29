import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ADMIN_INBOX_SORT_STORAGE_KEY, ADMIN_INBOX_TAB_STORAGE_KEY } from '../constants/adminUiTokens';
import { ADMIN_UI } from './constants/ui';
import type { AdminSession } from './api';

vi.mock('./api', () => ({
  adminListPublishQueue: vi.fn(),
  adminListSiteContentChanges: vi.fn(),
  adminListTours: vi.fn(),
  adminSubmitPublishQueue: vi.fn(),
  adminPublishQueue: vi.fn(),
  adminPublishSiteContent: vi.fn(),
  adminPublishTourSeo: vi.fn(),
  adminReturnPublishQueue: vi.fn(),
}));

import { adminListPublishQueue, adminListSiteContentChanges, adminListTours, adminPublishQueue, adminPublishSiteContent, adminPublishTourSeo, adminReturnPublishQueue } from './api';
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
    vi.mocked(adminListSiteContentChanges).mockResolvedValue([]);
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
    vi.mocked(adminPublishQueue).mockResolvedValue({});
    vi.mocked(adminPublishTourSeo).mockResolvedValue({});
    vi.mocked(adminPublishSiteContent).mockResolvedValue({
      document: { kind: 'seo', schemaVersion: 1, pages: [] },
      meta: { rev: 9, editor: 'alice', updatedAt: '2026-10-29T00:00:00.000Z', submittedForPublishAt: null },
    } as never);
    vi.mocked(adminReturnPublishQueue).mockResolvedValue(undefined);
  });

  it('lists live queue items without a bulk submit for editors', async () => {
    renderInbox(editorSession);

    expect(await screen.findAllByText('Изюбриная')).not.toHaveLength(0);
    expect(screen.queryByRole('button', { name: ADMIN_UI.inboxSubmitAll })).not.toBeInTheDocument();
  });

  it('uses the same desktop grid for headers and queue rows', async () => {
    renderInbox(adminSession);

    expect(await screen.findByText(ADMIN_UI.inboxColumnType)).toBeInTheDocument();
    expect(screen.getByText(ADMIN_UI.inboxColumnType).parentElement).toHaveClass('admin-inbox-grid');
    expect(screen.getAllByRole('button', { name: ADMIN_UI.inboxView })[0]?.closest('li')).toHaveClass(
      'admin-inbox-grid',
    );
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
    const publish = screen.getByRole('button', { name: ADMIN_UI.inboxPublishOne });
    expect(publish).toHaveClass('admin-btn-publish');
    await user.click(publish);
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
    const publish = screen.getByRole('button', { name: ADMIN_UI.inboxPublishTours });
    expect(publish).toHaveClass('admin-btn-publish');
    await user.click(publish);
    expect(adminPublishQueue).toHaveBeenCalledWith({
      tourIds: ['winter-2'],
      departureIds: [],
      tourRevs: { 'winter-2': 2 },
    });
  });

  it('publishes only the selected queue items', async () => {
    const user = userEvent.setup();
    renderInbox(adminSession);
    expect(await screen.findAllByText('Изюбриная')).not.toHaveLength(0);
    await user.click(screen.getByRole('checkbox', { name: 'Выбрать Тур: Изюбриная' }));
    const publish = screen.getByRole('button', { name: ADMIN_UI.inboxPublishSelected });
    expect(publish).toHaveClass('admin-btn-publish');
    await user.click(publish);
    expect(adminPublishQueue).toHaveBeenCalledWith({
      tourIds: ['winter-2'],
      departureIds: [],
      tourRevs: { 'winter-2': 2 },
    });
  });

  it('returns the selected queue items with one reason', async () => {
    const user = userEvent.setup();
    renderInbox(adminSession);
    expect(await screen.findAllByText('Изюбриная')).not.toHaveLength(0);
    await user.click(screen.getByRole('checkbox', { name: 'Выбрать Тур: Изюбриная' }));
    await user.click(screen.getByRole('button', { name: ADMIN_UI.inboxReturnSelected }));
    const sheet = screen.getByRole('dialog', { name: ADMIN_UI.inboxReturn });
    await user.type(within(sheet).getByLabelText(ADMIN_UI.inboxReturnReason), 'Проверить цены');
    await user.click(within(sheet).getByRole('button', { name: ADMIN_UI.inboxReturn }));
    expect(adminReturnPublishQueue).toHaveBeenCalledWith({
      reason: 'Проверить цены',
      tourIds: ['winter-2'],
      departureIds: [],
    });
  });

  it('выбирает все видимые элементы очереди через select-all', async () => {
    const user = userEvent.setup();
    renderInbox(adminSession);
    expect(await screen.findAllByText('Изюбриная')).not.toHaveLength(0);
    const selectAll = screen.getByRole('checkbox', { name: 'Выбрать все видимые' });
    expect(screen.getByText('Выбрать всё')).toBeInTheDocument();
    await user.click(selectAll);
    expect(screen.getAllByRole('checkbox', { name: /Выбрать (Тур|Выезд): Изюбриная/ })).toHaveLength(2);
    expect(screen.getByText(`2 ${ADMIN_UI.inboxSelectedCount}`)).toBeInTheDocument();
    expect(selectAll).toBeChecked();

    await user.click(selectAll);
    await user.click(screen.getByRole('checkbox', { name: 'Выбрать Тур: Изюбриная' }));
    expect(selectAll).toHaveProperty('indeterminate', true);
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

  it('публикует только SEO, когда выбран этот фильтр', async () => {
    vi.mocked(adminListSiteContentChanges).mockResolvedValue([
      {
        kind: 'seo',
        title: 'SEO страниц сайта',
        author: 'alice',
        timestamp: '2026-10-29T00:00:00.000Z',
        rev: 4,
        changes: [{ label: '/ · description', from: 'коротко', to: 'длиннее' }],
      },
    ]);
    const user = userEvent.setup();
    renderInbox(adminSession);

    expect(await screen.findByText('SEO страниц сайта')).toBeInTheDocument();
    vi.mocked(adminPublishQueue).mockClear();
    vi.mocked(adminPublishSiteContent).mockClear();
    await user.click(screen.getByRole('button', { name: 'SEO' }));
    await user.click(screen.getByRole('button', { name: ADMIN_UI.inboxPublishSeo }));

    expect(adminPublishSiteContent).toHaveBeenCalledWith('seo', 4);
    expect(adminPublishQueue).not.toHaveBeenCalled();
    expect(adminPublishTourSeo).not.toHaveBeenCalled();
  });

  it('оставляет серую кнопку публикации, когда публиковать нечего', async () => {
    vi.mocked(adminListPublishQueue).mockResolvedValue([]);
    vi.mocked(adminListSiteContentChanges).mockResolvedValue([]);
    const user = userEvent.setup();
    renderInbox(adminSession);

    const publishAll = await screen.findByRole('button', { name: ADMIN_UI.inboxPublishAll });
    expect(publishAll).toBeDisabled();
    expect(publishAll).toHaveAttribute('data-idle', 'true');
    await user.hover(publishAll.parentElement as HTMLElement);
    expect(screen.getByRole('tooltip')).toHaveTextContent(ADMIN_UI.inboxPublishedAll);
    expect(screen.getByRole('tooltip').className).not.toContain('sr-only');

    await user.click(screen.getByRole('button', { name: 'SEO' }));
    const publishSeo = screen.getByRole('button', { name: ADMIN_UI.inboxPublishSeo });
    expect(publishSeo).toBeDisabled();
    await user.hover(publishSeo.parentElement as HTMLElement);
    expect(screen.getByRole('tooltip')).toHaveTextContent(ADMIN_UI.inboxPublishedSeo);
  });

  it('публикует SEO страниц и SEO уже опубликованных туров одной кнопкой', async () => {
    vi.mocked(adminListPublishQueue).mockResolvedValue([
      {
        kind: 'tour',
        id: 'winter-1',
        tourId: 'winter-1',
        title: 'Изюбриная',
        ready: true,
        rev: 2,
        summary: 'tour_draft',
      },
      {
        kind: 'tour_seo',
        id: 'winter-1',
        tourId: 'winter-1',
        title: 'Изюбриная',
        ready: true,
        rev: 2,
        summary: 'tour_seo',
      },
    ]);
    vi.mocked(adminListSiteContentChanges).mockResolvedValue([
      {
        kind: 'seo',
        title: 'SEO страниц сайта',
        author: 'alice',
        timestamp: '2026-10-29T00:00:00.000Z',
        rev: 4,
        changes: [{ label: '/ · description', from: 'коротко', to: 'длиннее' }],
      },
    ]);
    const user = userEvent.setup();
    renderInbox(adminSession);

    expect(await screen.findByText('SEO страниц сайта')).toBeInTheDocument();
    vi.mocked(adminPublishQueue).mockClear();
    vi.mocked(adminPublishSiteContent).mockClear();
    vi.mocked(adminPublishTourSeo).mockClear();
    await user.click(screen.getByRole('button', { name: 'SEO' }));
    expect(screen.getAllByText(ADMIN_UI.inboxSeoItem).length).toBeGreaterThan(0);
    expect(screen.queryByText(ADMIN_UI.inboxTourItem)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: ADMIN_UI.inboxPublishSeo }));

    expect(adminPublishTourSeo).toHaveBeenCalledWith({
      tourIds: ['winter-1'],
      tourRevs: { 'winter-1': 2 },
    });
    expect(adminPublishSiteContent).toHaveBeenCalledWith('seo', 4);
    expect(adminPublishQueue).not.toHaveBeenCalled();
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
