import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CmsTourDocument } from '../cms/cmsTourDocument';
import { createCmsTourMeta } from '../cms/cmsTourMeta';
import type { AdminDeparture, AdminSession } from './api';
import { ADMIN_SCHEDULE_MODE_STORAGE_KEY, ADMIN_SCHEDULE_WEEK_LAYOUT_STORAGE_KEY } from '../constants/adminUiTokens';
import { ADMIN_UI } from './constants/ui';
import { formatScheduleOverflowDepartures, formatScheduleWeekdayDate } from './formatAdminCopy';
import { startOfIsoWeek, vladivostokCalendarDate } from './scheduleCalendar';
import { AdminToastProvider } from './components/AdminToast';

vi.mock('./api', () => ({
  adminListTours: vi.fn(),
  adminGetTour: vi.fn(),
  adminListDepartures: vi.fn(),
  adminCreateDeparture: vi.fn(),
  adminUpdateDeparture: vi.fn(),
  adminDeleteDeparture: vi.fn(),
  adminSubmitPublishQueue: vi.fn(),
  adminPublishDepartures: vi.fn(),
  adminPublishAllEligibleDepartures: vi.fn(),
}));

import {
  adminCreateDeparture,
  adminDeleteDeparture,
  adminGetTour,
  adminListDepartures,
  adminListTours,
  adminUpdateDeparture,
} from './api';
import { clearAdminDataCache } from './adminDataCache';
import SchedulePage from './SchedulePage';

function readyTour(overrides: Partial<CmsTourDocument> = {}): CmsTourDocument {
  return {
    id: 'summer-1',
    slug: 'izubrinaya',
    season: 'summer',
    status: 'draft',
    title: 'Изюбриная',
    subtitle: 'Зима',
    heroPhrase: 'Ели',
    description: 'лево',
    descriptionAside: 'право',
    duration: '1 день',
    durationDays: 1,
    difficulty: 'Medium',
    price: 'по запросу',
    program: [{ timeLabel: '04:30', description: 'Выезд' }],
    included: [{ text: 'Трансфер', iconKey: 'van-shuttle' }],
    coverAssetId: 'cover',
    prefaceAssetId: 'preface',
    assets: [
      { id: 'cover', stillUrl: 'https://cdn.example/cover.webp', videoUrl: null, alt: '' },
      { id: 'preface', stillUrl: 'https://cdn.example/preface.webp', videoUrl: null, alt: '' },
      { id: 'g-0', stillUrl: 'https://cdn.example/g-0.webp', videoUrl: null, alt: '' },
    ],
    bento: { blocks: [{ type: 'bento-single', slots: [{ assetId: 'g-0' }] }] },
    legacyGalleryVariant: null,
    ...overrides,
  };
}

const meta = createCmsTourMeta();
const incomplete = readyTour({
  id: 'summer-2',
  title: 'Неготовый',
  descriptionAside: '',
});

function listItem(
  id: string,
  title: string,
  published = true,
  status: 'draft' | 'active' = 'active',
  season: 'winter' | 'spring' | 'summer' | 'fall' = 'summer',
) {
  return {
    id,
    title,
    season,
    status,
    published,
    imageUrl: null,
    ready: true,
    readyCount: 5,
    readyTotal: 5,
    slug: id,
  };
}

const adminSession: AdminSession = {
  login: 'alice',
  role: 'admin',
  canPublishTours: true,
  canPublishSchedule: true,
};

function mockViewportWidth(widthPx: number) {
  window.matchMedia = (query: string) => {
    const min = /\(min-width:\s*(\d+)px\)/.exec(query);
    const matches = min != null ? widthPx >= Number(min[1]) : false;
    return {
      matches,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    };
  };
}

function renderSchedule(session: AdminSession = adminSession, initialEntries: string[] = ['/']) {
  return render(
    <AdminToastProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route element={<Outlet context={{ session }} />}>
            <Route path="/" element={<SchedulePage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AdminToastProvider>,
  );
}

describe('SchedulePage', () => {
  beforeEach(() => {
    clearAdminDataCache();
    vi.clearAllMocks();
    delete document.body.dataset.adminScheduleSections;
    window.localStorage.removeItem(ADMIN_SCHEDULE_MODE_STORAGE_KEY);
    window.localStorage.removeItem(ADMIN_SCHEDULE_WEEK_LAYOUT_STORAGE_KEY);
    mockViewportWidth(1280);
    vi.mocked(adminListTours).mockResolvedValue([
      listItem('summer-1', 'Изюбриная'),
      { ...listItem('summer-2', 'Неготовый', false, 'draft'), ready: false },
      listItem('summer-3', 'Вторая'),
    ]);
    vi.mocked(adminGetTour).mockImplementation(async (id: string) => ({
      document: id === 'summer-2' ? incomplete : readyTour(),
      meta,
      published: false,
    }));
    vi.mocked(adminListDepartures).mockResolvedValue([]);
    vi.mocked(adminCreateDeparture).mockImplementation(async (input) => ({
      id: 'new-departure',
      tourId: input.tourId,
      startsOn: input.startsOn,
      endsOn: input.startsOn,
      seats: input.seats ?? 8,
      status: 'open',
      version: 1,
      createdAt: '2026-08-18T00:00:00.000Z',
      updatedAt: '2026-08-18T00:00:00.000Z',
    }));
    vi.mocked(adminDeleteDeparture).mockResolvedValue(undefined);
  });

  it('shows day, week and month modes, opens the wizard on an empty cell, and lists only on-site tours', async () => {
    const user = userEvent.setup();
    renderSchedule();
    const today = vladivostokCalendarDate();

    expect(screen.getByRole('button', { name: ADMIN_UI.scheduleModeDay })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: ADMIN_UI.scheduleModeWeek })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: ADMIN_UI.scheduleModeMonth })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: ADMIN_UI.scheduleAdd })).toHaveClass('admin-btn-primary');
    expect(screen.getByRole('button', { name: ADMIN_UI.publishSchedule })).toHaveClass(
      'admin-btn-secondary',
    );
    expect(screen.getByRole('button', { name: ADMIN_UI.scheduleModeMonth })).not.toHaveClass(
      'admin-btn-primary',
    );

    await waitFor(() => expect(adminListTours).toHaveBeenCalled());
    await user.click(
      await screen.findByRole('button', { name: `${ADMIN_UI.scheduleEmptyCell} ${today}` }),
    );

    expect(await screen.findByRole('dialog', { name: ADMIN_UI.scheduleWizardTitle })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Изюбриная' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Неготовый' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: ADMIN_UI.scheduleWizardNext }));
    await user.click(screen.getByRole('button', { name: ADMIN_UI.scheduleWizardNext }));
    expect(screen.getByLabelText(ADMIN_UI.scheduleSeats)).toHaveValue(8);
    const wizard = screen.getByRole('dialog', { name: ADMIN_UI.scheduleWizardTitle });
    await user.click(within(wizard).getByRole('button', { name: ADMIN_UI.scheduleWizardSubmit }));
    await waitFor(() =>
      expect(adminCreateDeparture).toHaveBeenCalledWith({
        tourId: 'summer-1',
        startsOn: today,
        seats: 8,
      }),
    );
  });

  it('opens the existing departure instead of creating a second start', async () => {
    const user = userEvent.setup();
    const today = vladivostokCalendarDate();
    const existing: AdminDeparture = {
      id: 'dep-1',
      tourId: 'summer-1',
      startsOn: today,
      endsOn: today,
      seats: 8,
      status: 'open',
      version: 1,
      createdAt: '2026-08-18T00:00:00.000Z',
      updatedAt: '2026-08-18T00:00:00.000Z',
    };
    vi.mocked(adminListDepartures).mockResolvedValue([existing]);

    renderSchedule();
    await waitFor(() => expect(adminListTours).toHaveBeenCalled());
    await user.click(await screen.findByRole('button', { name: /Изюбриная/ }));

    expect(await screen.findByRole('dialog', { name: ADMIN_UI.scheduleEditorTitle })).toBeInTheDocument();
    expect(adminCreateDeparture).not.toHaveBeenCalled();
  });

  it('в day detail показывает только рабочий статус, без «Скрыт» для гостя', async () => {
    const user = userEvent.setup();
    const today = vladivostokCalendarDate();
    vi.mocked(adminListTours).mockResolvedValue([
      listItem('summer-1', 'Изюбриная', true, 'active'),
      listItem('summer-2', 'Неготовый', false, 'draft'),
    ]);
    vi.mocked(adminListDepartures).mockResolvedValue([
      {
        id: 'dep-open',
        tourId: 'summer-1',
        startsOn: today,
        endsOn: today,
        seats: 8,
        status: 'open',
        version: 1,
        createdAt: '2026-08-18T00:00:00.000Z',
        updatedAt: '2026-08-18T00:00:00.000Z',
      },
      {
        id: 'dep-planned',
        tourId: 'summer-2',
        startsOn: today,
        endsOn: today,
        seats: 8,
        status: 'planned',
        version: 1,
        createdAt: '2026-08-18T00:00:00.000Z',
        updatedAt: '2026-08-18T00:00:00.000Z',
      },
    ]);

    renderSchedule();
    await user.click(
      await screen.findByRole('button', {
        name: `${ADMIN_UI.scheduleChipListTitle}. ${formatScheduleOverflowDepartures(1)}`,
      }),
    );
    const dayDialog = await screen.findByRole('dialog');
    expect(within(dayDialog).queryByText(ADMIN_UI.scheduleHiddenFromGuest)).not.toBeInTheDocument();
    expect(within(dayDialog).getByText(ADMIN_UI.departureStatus.open)).toBeInTheDocument();
    expect(within(dayDialog).getByText(ADMIN_UI.departureStatus.planned)).toBeInTheDocument();
  });

  it('shows submit for an editor without schedule publish and publish for admin', async () => {
    renderSchedule({
      login: 'bob',
      role: 'editor',
      canPublishTours: false,
      canPublishSchedule: false,
    });
    await waitFor(() => expect(adminListTours).toHaveBeenCalled());
    expect(screen.getByRole('button', { name: ADMIN_UI.inboxSubmit })).toBeDisabled();
    expect(screen.queryByRole('button', { name: ADMIN_UI.publishSchedule })).not.toBeInTheDocument();
  });

  it('explains why schedule publication is unavailable', async () => {
    vi.mocked(adminListTours).mockResolvedValue([
      { ...listItem('summer-2', 'Неготовый', false, 'draft'), ready: false },
    ]);
    renderSchedule();

    expect(await screen.findByText(ADMIN_UI.scheduleNoPublishableDepartures)).toBeVisible();
    expect(screen.getByRole('button', { name: ADMIN_UI.publishSchedule })).toHaveAttribute(
      'aria-describedby',
      'schedule-publish-hint',
    );
  });

  it('allows publishing the whole schedule even if the current month is empty', async () => {
    renderSchedule();

    expect(await screen.findByRole('button', { name: ADMIN_UI.publishSchedule })).toBeEnabled();
    expect(screen.queryByText(ADMIN_UI.scheduleNoPublishableDepartures)).not.toBeInTheDocument();
  });

  it('opens the departure editor from a home widget query', async () => {
    const today = vladivostokCalendarDate();
    const existing: AdminDeparture = {
      id: 'dep-1',
      tourId: 'summer-1',
      startsOn: today,
      endsOn: today,
      seats: 8,
      status: 'open',
      version: 1,
      createdAt: '2026-08-18T00:00:00.000Z',
      updatedAt: '2026-08-18T00:00:00.000Z',
    };
    vi.mocked(adminListDepartures).mockResolvedValue([existing]);

    renderSchedule(adminSession, [`/?date=${today}&departure=dep-1`]);

    expect(await screen.findByRole('dialog', { name: ADMIN_UI.scheduleEditorTitle })).toBeInTheDocument();
  });

  it('does not draw a seven-column month table on a narrow viewport', async () => {
    mockViewportWidth(360);
    const user = userEvent.setup();
    renderSchedule();
    await waitFor(() => expect(adminListTours).toHaveBeenCalled());
    await user.click(screen.getByRole('button', { name: ADMIN_UI.scheduleModeMonth }));
    expect(screen.queryByText(ADMIN_UI.scheduleWeekdays[0])).not.toBeInTheDocument();
  });

  it('collapses extra month chips behind overflow', async () => {
    const user = userEvent.setup();
    const today = vladivostokCalendarDate();
    vi.mocked(adminListTours).mockResolvedValue([
      { ...listItem('summer-1', 'Изюбриная'), imageUrl: 'https://cdn.example/one.webp' },
      { ...listItem('summer-2', 'Неготовый'), ready: false, imageUrl: 'https://cdn.example/two.webp' },
      { ...listItem('summer-3', 'Вторая'), imageUrl: 'https://cdn.example/three.webp' },
    ]);
    vi.mocked(adminListDepartures).mockResolvedValue(
      [
        ['dep-1', 'summer-1'],
        ['dep-2', 'summer-2'],
        ['dep-3', 'summer-3'],
      ].map(([id, tourId]) => ({
        id,
        tourId,
        startsOn: today,
        endsOn: today,
        seats: 8,
        status: 'open' as const,
        version: 1,
        createdAt: '2026-08-18T00:00:00.000Z',
        updatedAt: '2026-08-18T00:00:00.000Z',
      })),
    );

    renderSchedule();
    await user.click(
      await screen.findByRole('button', {
        name: `${ADMIN_UI.scheduleChipListTitle}. ${formatScheduleOverflowDepartures(2)}`,
      }),
    );
    const dayDialog = await screen.findByRole('dialog');
    expect(dayDialog).toBeInTheDocument();
    expect(within(dayDialog).getByRole('button', { name: 'Изюбриная' })).toBeInTheDocument();
    expect(within(dayDialog).getByRole('button', { name: 'Неготовый' })).toBeInTheDocument();
    expect(within(dayDialog).getByRole('button', { name: 'Вторая' })).toBeInTheDocument();
  });

  it('opens the add wizard from plus on an occupied date and deletes from the editor', async () => {
    const user = userEvent.setup();
    const today = vladivostokCalendarDate();
    const existing: AdminDeparture = {
      id: 'dep-1',
      tourId: 'summer-1',
      startsOn: today,
      endsOn: today,
      seats: 8,
      status: 'open',
      version: 1,
      createdAt: '2026-08-18T00:00:00.000Z',
      updatedAt: '2026-08-18T00:00:00.000Z',
    };
    vi.mocked(adminListDepartures).mockResolvedValue([existing]);

    renderSchedule();
    await user.click(
      await screen.findByRole('button', { name: `${ADMIN_UI.scheduleAddOnDate} ${today}` }),
    );
    const wizard = await screen.findByRole('dialog', { name: ADMIN_UI.scheduleWizardTitle });
    expect(within(wizard).queryByRole('button', { name: 'Изюбриная' })).not.toBeInTheDocument();
    expect(within(wizard).getByRole('button', { name: 'Вторая' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: ADMIN_UI.cancel }));
    await user.click(await screen.findByRole('button', { name: /Изюбриная/ }));
    expect(await screen.findByRole('dialog', { name: ADMIN_UI.scheduleEditorTitle })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: ADMIN_UI.scheduleDelete }));
    expect(screen.queryByRole('dialog', { name: ADMIN_UI.scheduleEditorTitle })).not.toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: ADMIN_UI.scheduleDeleteTitle })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: ADMIN_UI.scheduleDeleteConfirm }));
    await waitFor(() => expect(adminDeleteDeparture).toHaveBeenCalledWith('dep-1'));
    expect(screen.queryByRole('dialog', { name: ADMIN_UI.scheduleDeleteTitle })).not.toBeInTheDocument();
  });

  it('restores the editor when delete is cancelled', async () => {
    const user = userEvent.setup();
    const today = vladivostokCalendarDate();
    vi.mocked(adminListDepartures).mockResolvedValue([
      {
        id: 'dep-1',
        tourId: 'summer-1',
        startsOn: today,
        endsOn: today,
        seats: 8,
        status: 'open',
        version: 1,
        createdAt: '2026-08-18T00:00:00.000Z',
        updatedAt: '2026-08-18T00:00:00.000Z',
      },
    ]);

    renderSchedule();
    await user.click(await screen.findByRole('button', { name: /Изюбриная/ }));
    await user.click(await screen.findByRole('button', { name: ADMIN_UI.scheduleDelete }));
    const confirm = screen.getByRole('dialog', { name: ADMIN_UI.scheduleDeleteTitle });
    await user.click(within(confirm).getByRole('button', { name: ADMIN_UI.cancel }));

    expect(await screen.findByRole('dialog', { name: ADMIN_UI.scheduleEditorTitle })).toBeInTheDocument();
    expect(adminDeleteDeparture).not.toHaveBeenCalled();
  });

  it('closes the confirm and shows an error when delete fails', async () => {
    const user = userEvent.setup();
    const today = vladivostokCalendarDate();
    vi.mocked(adminListDepartures).mockResolvedValue([
      {
        id: 'dep-1',
        tourId: 'summer-1',
        startsOn: today,
        endsOn: today,
        seats: 8,
        status: 'open',
        version: 1,
        createdAt: '2026-08-18T00:00:00.000Z',
        updatedAt: '2026-08-18T00:00:00.000Z',
      },
    ]);
    vi.mocked(adminDeleteDeparture).mockRejectedValue(new Error('departure_completed'));

    renderSchedule();
    await user.click(await screen.findByRole('button', { name: /Изюбриная/ }));
    await user.click(await screen.findByRole('button', { name: ADMIN_UI.scheduleDelete }));
    await user.click(screen.getByRole('button', { name: ADMIN_UI.scheduleDeleteConfirm }));

    expect(await screen.findByRole('status')).toHaveTextContent(ADMIN_UI.scheduleDeleteError);
    expect(screen.queryByRole('dialog', { name: ADMIN_UI.scheduleDeleteTitle })).not.toBeInTheDocument();
  });

  it('does not offer delete for a date that is already on the site', async () => {
    const user = userEvent.setup();
    const today = vladivostokCalendarDate();
    vi.mocked(adminListDepartures).mockResolvedValue([
      {
        id: 'dep-1',
        tourId: 'summer-1',
        startsOn: today,
        endsOn: today,
        seats: 8,
        status: 'open',
        version: 1,
        createdAt: '2026-08-18T00:00:00.000Z',
        updatedAt: '2026-08-18T00:00:00.000Z',
        publishedAt: '2026-08-18T00:00:00.000Z',
      },
    ]);

    renderSchedule();
    await user.click(await screen.findByRole('button', { name: /Изюбриная/ }));
    expect(await screen.findByRole('dialog', { name: ADMIN_UI.scheduleEditorTitle })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: ADMIN_UI.scheduleDelete })).not.toBeInTheDocument();
  });

  it('on tablet month still uses weekday headers, not a seven-column-free agenda', async () => {
    mockViewportWidth(768);
    const user = userEvent.setup();
    renderSchedule();
    await waitFor(() => expect(adminListTours).toHaveBeenCalled());
    await user.click(screen.getByRole('button', { name: ADMIN_UI.scheduleModeMonth }));
    expect(screen.getByText(ADMIN_UI.scheduleWeekdays[0])).toBeInTheDocument();
  });

  it('shows the reference shell and month departure covers without sidebar rail', async () => {
    const today = vladivostokCalendarDate();
    vi.mocked(adminListTours).mockResolvedValue([
      { ...listItem('summer-1', 'Изюбриная'), imageUrl: 'https://cdn.example/cover.webp' },
    ]);
    vi.mocked(adminListDepartures).mockResolvedValue([
      {
        id: 'dep-rail',
        tourId: 'summer-1',
        startsOn: today,
        endsOn: today,
        seats: 8,
        status: 'open',
        version: 1,
        createdAt: '2026-08-18T00:00:00.000Z',
        updatedAt: '2026-08-18T00:00:00.000Z',
      },
    ]);

    renderSchedule();

    expect(
      await screen.findByRole('searchbox', { name: ADMIN_UI.scheduleSearchLabel }),
    ).toBeDisabled();
    expect(screen.queryByRole('heading', { name: ADMIN_UI.scheduleNearestDepartures })).not.toBeInTheDocument();
    const departureButton = await screen.findByRole('button', { name: /Изюбриная/ });
    const cover = departureButton.querySelector('img');
    expect(cover).toHaveAttribute('src', 'https://cdn.example/cover.webp');
    expect(cover?.parentElement).toHaveClass('admin-schedule-departure-thumb');
  });

  it('меняет статус запланированного выезда из подписи статуса в недельном виде', async () => {
    const user = userEvent.setup();
    const today = vladivostokCalendarDate();
    const existing: AdminDeparture = {
      id: 'dep-1',
      tourId: 'summer-1',
      startsOn: today,
      endsOn: today,
      seats: 8,
      status: 'planned',
      version: 1,
      createdAt: '2026-08-18T00:00:00.000Z',
      updatedAt: '2026-08-18T00:00:00.000Z',
    };
    vi.mocked(adminListDepartures).mockResolvedValue([existing]);
    vi.mocked(adminUpdateDeparture).mockResolvedValue({ ...existing, status: 'open', version: 2 });

    renderSchedule();
    await waitFor(() => expect(adminListTours).toHaveBeenCalled());
    await user.click(screen.getByRole('button', { name: ADMIN_UI.scheduleModeWeek }));

    const triggers = await screen.findAllByRole('button', {
      name: `${ADMIN_UI.departureStatusMenu}: ${ADMIN_UI.departureStatus.planned}`,
    });
    await user.click(triggers[0]);
    await user.click(screen.getByRole('menuitemradio', { name: ADMIN_UI.departureStatus.open }));

    await waitFor(() =>
      expect(adminUpdateDeparture).toHaveBeenCalledWith('dep-1', {
        version: 1,
        status: 'open',
      }),
    );
  });

  it('в неделе переключает список и панель, не смешивая их с режимом календаря', async () => {
    const user = userEvent.setup();
    renderSchedule();
    await waitFor(() => expect(adminListTours).toHaveBeenCalled());

    expect(screen.queryByRole('group', { name: ADMIN_UI.scheduleWeekLayout })).not.toBeInTheDocument();
    expect(document.body.dataset.adminScheduleSections).toBeUndefined();
    await user.click(screen.getByRole('button', { name: ADMIN_UI.scheduleModeWeek }));

    const layout = await screen.findByRole('group', { name: ADMIN_UI.scheduleWeekLayout });
    expect(layout).toBeInTheDocument();
    expect(document.body.dataset.adminScheduleSections).toBe('true');
    expect(document.querySelector('.admin-schedule-week-list')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: ADMIN_UI.scheduleWeekList })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getAllByRole('button', { name: ADMIN_UI.scheduleModeWeek })).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: ADMIN_UI.scheduleWeekSplit }));
    expect(screen.getByRole('heading', { name: formatScheduleWeekdayDate(vladivostokCalendarDate()) })).toBeInTheDocument();
    expect(window.localStorage.getItem(ADMIN_SCHEDULE_WEEK_LAYOUT_STORAGE_KEY)).toBe('split');
    expect(document.querySelector('.admin-schedule-week-split-days')).toBeInTheDocument();
    expect(document.body.dataset.adminScheduleSections).toBe('true');
    expect(screen.getByRole('heading', { name: formatScheduleWeekdayDate(vladivostokCalendarDate()) }).closest('section')).toHaveClass(
      'overflow-y-auto',
    );

    await user.click(screen.getByRole('button', { name: ADMIN_UI.scheduleModeDay }));
    expect(document.querySelector('.admin-schedule-day-agenda')).toBeInTheDocument();
    expect(document.body.dataset.adminScheduleSections).toBe('true');

    await user.click(screen.getByRole('button', { name: ADMIN_UI.scheduleModeMonth }));
    expect(document.body.dataset.adminScheduleSections).toBeUndefined();
    expect(document.querySelector('.admin-schedule-week-list')).not.toBeInTheDocument();
  });

  it('в списке недели показывает все выезды дня и не открывает мастер по клику на пустой день', async () => {
    const user = userEvent.setup();
    const today = vladivostokCalendarDate();
    vi.mocked(adminListDepartures).mockResolvedValue([
      {
        id: 'dep-1',
        tourId: 'summer-1',
        startsOn: today,
        endsOn: today,
        seats: 8,
        status: 'open',
        version: 1,
        createdAt: '2026-08-18T00:00:00.000Z',
        updatedAt: '2026-08-18T00:00:00.000Z',
      },
      {
        id: 'dep-2',
        tourId: 'summer-3',
        startsOn: today,
        endsOn: today,
        seats: 8,
        status: 'planned',
        version: 1,
        createdAt: '2026-08-18T00:00:00.000Z',
        updatedAt: '2026-08-18T00:00:00.000Z',
      },
    ]);

    renderSchedule();
    await user.click(await screen.findByRole('button', { name: ADMIN_UI.scheduleModeWeek }));

    expect(await screen.findByRole('button', { name: 'Изюбриная' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Вторая/ })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: `${ADMIN_UI.scheduleChipListTitle}. ${formatScheduleOverflowDepartures(1)}`,
      }),
    ).not.toBeInTheDocument();

    const emptyIso = startOfIsoWeek(today);
    if (emptyIso !== today) {
      await user.click(screen.getByRole('button', { name: `${ADMIN_UI.scheduleSelectDay} ${emptyIso}` }));
      expect(screen.queryByRole('dialog', { name: ADMIN_UI.scheduleWizardTitle })).not.toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: `${ADMIN_UI.scheduleAddOnDate} ${emptyIso}` }));
      expect(await screen.findByRole('dialog', { name: ADMIN_UI.scheduleWizardTitle })).toBeInTheDocument();
    }
  });

  it('в дне показывает все выезды без свёртки «ещё»', async () => {
    const user = userEvent.setup();
    const today = vladivostokCalendarDate();
    vi.mocked(adminListDepartures).mockResolvedValue(
      [
        ['dep-1', 'summer-1'],
        ['dep-2', 'summer-3'],
        ['dep-3', 'summer-1'],
      ].map(([id, tourId], index) => ({
        id,
        tourId,
        startsOn: today,
        endsOn: today,
        seats: 8,
        status: index === 1 ? 'planned' : 'open',
        version: 1,
        createdAt: '2026-08-18T00:00:00.000Z',
        updatedAt: '2026-08-18T00:00:00.000Z',
      })),
    );

    renderSchedule();
    await user.click(await screen.findByRole('button', { name: ADMIN_UI.scheduleModeDay }));

    expect(await screen.findAllByRole('button', { name: 'Изюбриная' })).toHaveLength(2);
    expect(screen.getByRole('button', { name: /Вторая/ })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: `${ADMIN_UI.scheduleChipListTitle}. ${formatScheduleOverflowDepartures(2)}`,
      }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(new RegExp(`\\+\\d+\\s+${ADMIN_UI.scheduleOverflow}`))).not.toBeInTheDocument();
  });
});
