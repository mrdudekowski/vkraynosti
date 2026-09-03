import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CmsTourDocument } from '../cms/cmsTourDocument';
import { createCmsTourMeta } from '../cms/cmsTourMeta';
import type { AdminSession } from './api';
import { adminTourPublicHref } from './adminTourPublicHref';
import { ADMIN_UI } from './constants/ui';
import { AdminToastProvider } from './components/AdminToast';

class FakeIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);

vi.mock('./api', () => ({
  adminGetTour: vi.fn(),
  adminSaveTour: vi.fn(),
  adminPublishTour: vi.fn(),
  adminSubmitPublishQueue: vi.fn(),
  adminCreateDeparture: vi.fn(),
  adminListDepartures: vi.fn(),
  adminListTours: vi.fn(),
  adminListPublishQueue: vi.fn(),
  adminUploadTourAsset: vi.fn(),
  adminDeleteTourAsset: vi.fn(),
}));

import {
  adminGetTour,
  adminListTours,
  adminPublishTour,
  adminSaveTour,
} from './api';
import TourEditorPage from './TourEditorPage';

function readyTour(): CmsTourDocument {
  return {
    id: 'winter-1',
    slug: 'izubrinaya',
    season: 'winter',
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
    program: [{ day: 1, timeLabel: '04:30', description: 'Выезд' }],
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
  };
}

function renderEditor(session: AdminSession, path = '/tours/winter-1') {
  return render(
    <AdminToastProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<Outlet context={{ session }} />}>
            <Route path="/tours/:tourId" element={<TourEditorPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AdminToastProvider>,
  );
}

describe('TourEditorPage publish actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminGetTour).mockResolvedValue({
      document: readyTour(),
      meta: createCmsTourMeta(),
      published: false,
    });
    vi.mocked(adminSaveTour).mockImplementation(async (_id, _rev, patch) => ({
      document: {
        ...readyTour(),
        title: patch.title ?? readyTour().title,
        description: patch.description,
        descriptionLeadBold: patch.descriptionLeadBold,
        descriptionAside: patch.descriptionAside,
      },
      meta: createCmsTourMeta({ rev: 2 }),
    }));
    vi.mocked(adminPublishTour).mockResolvedValue({
      document: { ...readyTour(), status: 'active' },
      meta: createCmsTourMeta({ rev: 3 }),
    });
    vi.mocked(adminListTours).mockResolvedValue([]);
  });

  it('shows publish for a session that can publish tours', async () => {
    renderEditor({
      login: 'alice',
      role: 'admin',
      canPublishTours: true,
      canPublishSchedule: true,
    });
    await waitFor(() => expect(adminGetTour).toHaveBeenCalled());
    const publish = await screen.findByRole('button', { name: ADMIN_UI.publish });
    expect(publish).toHaveClass('admin-btn-primary');
    expect(screen.queryByRole('button', { name: ADMIN_UI.save })).not.toBeInTheDocument();
    expect(screen.getByRole('tablist', { name: ADMIN_UI.editorSections })).toBeInTheDocument();
    expect(screen.getByTestId('admin-catalog-grid')).toHaveClass('xl:grid-cols-2');
    expect(screen.getByRole('heading', { name: ADMIN_UI.identityHeading })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: ADMIN_UI.catalogHeading })).toBeInTheDocument();
    expect(screen.getByLabelText(ADMIN_UI.tourGuestStatusLabel)).toHaveValue('active');
    expect(screen.queryByRole('link', { name: ADMIN_UI.tourOpenOnSite })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: ADMIN_UI.inboxSubmit })).not.toBeInTheDocument();
  });

  it('не показывает отправку и ручное сохранение, если нет права публикации', async () => {
    renderEditor({
      login: 'bob',
      role: 'editor',
      canPublishTours: false,
      canPublishSchedule: false,
    });
    await waitFor(() => expect(adminGetTour).toHaveBeenCalled());
    expect(screen.queryByRole('button', { name: ADMIN_UI.inboxSubmit })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: ADMIN_UI.save })).not.toBeInTheDocument();
    expect(await screen.findByRole('link', { name: ADMIN_UI.dashboardOpenInbox })).toBeInTheDocument();
  });

  it('даёт добавить выезд до готовности карточки', async () => {
    vi.mocked(adminGetTour).mockResolvedValue({
      document: { ...readyTour(), descriptionAside: '' },
      meta: createCmsTourMeta(),
      published: false,
    });
    renderEditor({
      login: 'alice',
      role: 'admin',
      canPublishTours: true,
      canPublishSchedule: true,
    });
    expect(await screen.findByRole('button', { name: ADMIN_UI.scheduleAddFromTour })).toBeEnabled();
  });

  it('публикует черновик сразу: не блокирует кнопку из‑за dirty и сначала сохраняет', async () => {
    const user = userEvent.setup();
    renderEditor({
      login: 'alice',
      role: 'admin',
      canPublishTours: true,
      canPublishSchedule: true,
    });
    const title = await screen.findByLabelText(ADMIN_UI.tourNameLabel);
    await user.type(title, '!');
    const publish = screen.getByRole('button', { name: ADMIN_UI.publish });
    expect(publish).toBeEnabled();
    await user.click(publish);
    await waitFor(() => {
      expect(adminSaveTour).toHaveBeenCalled();
      expect(adminPublishTour).toHaveBeenCalledWith('winter-1', 2, {
        confirmDeleteFutureDepartures: false,
      });
    });
  });

  it('autosaves the draft into the sticky bar without a toast', async () => {
    const user = userEvent.setup();
    renderEditor({
      login: 'alice',
      role: 'admin',
      canPublishTours: true,
      canPublishSchedule: true,
    });
    const title = await screen.findByLabelText(ADMIN_UI.tourNameLabel);
    await user.type(title, '!');
    expect(adminSaveTour).not.toHaveBeenCalled();
    await waitFor(() => expect(adminSaveTour).toHaveBeenCalled(), { timeout: 2000 });
    expect(screen.getByText(ADMIN_UI.autosaved)).toBeInTheDocument();
    expect(screen.queryByText(ADMIN_UI.saved)).not.toBeInTheDocument();
  });

  it('marks a published tour as having unpublished changes after autosave', async () => {
    vi.mocked(adminGetTour).mockResolvedValue({
      document: readyTour(),
      meta: createCmsTourMeta(),
      published: true,
    });
    const user = userEvent.setup();
    renderEditor({
      login: 'alice',
      role: 'admin',
      canPublishTours: true,
      canPublishSchedule: true,
    });
    const title = await screen.findByLabelText(ADMIN_UI.tourNameLabel);
    await user.type(title, '!');
    await waitFor(() => expect(screen.getByText(ADMIN_UI.unpublishedChanges)).toBeInTheDocument(), {
      timeout: 2000,
    });
  });

  it('даёт открыть опубликованный тур на сайте по slug', async () => {
    vi.mocked(adminGetTour).mockResolvedValue({
      document: { ...readyTour(), status: 'active' },
      meta: createCmsTourMeta(),
      published: true,
    });
    renderEditor({
      login: 'alice',
      role: 'admin',
      canPublishTours: true,
      canPublishSchedule: true,
    });
    const siteLink = await screen.findByRole('link', { name: ADMIN_UI.tourOpenOnSite });
    expect(siteLink).toHaveAttribute(
      'href',
      adminTourPublicHref({ id: 'winter-1', season: 'winter', slug: 'izubrinaya' }),
    );
  });

  it('держит блоки по вкладкам и не сбрасывает поля при переключении', async () => {
    const user = userEvent.setup();
    renderEditor({
      login: 'alice',
      role: 'admin',
      canPublishTours: true,
      canPublishSchedule: true,
    });
    const title = await screen.findByLabelText(ADMIN_UI.tourNameLabel);
    await user.type(title, '!');
    await user.click(screen.getByRole('tab', { name: ADMIN_UI.sectionNav.about }));
    await waitFor(() =>
      expect(screen.getByRole('tab', { name: ADMIN_UI.sectionNav.about })).toHaveAttribute(
        'aria-selected',
        'true',
      ),
    );
    expect(screen.getByLabelText(ADMIN_UI.tourNameLabel)).not.toBeVisible();
    expect(screen.getByLabelText(ADMIN_UI.descriptionLabel)).toBeVisible();
    await user.click(screen.getByRole('tab', { name: ADMIN_UI.sectionNav.catalog }));
    await waitFor(() =>
      expect(screen.getByRole('tab', { name: ADMIN_UI.sectionNav.catalog })).toHaveAttribute(
        'aria-selected',
        'true',
      ),
    );
    expect(screen.getByLabelText(ADMIN_UI.tourNameLabel)).toBeVisible();
    expect(screen.getByLabelText(ADMIN_UI.tourNameLabel)).toHaveValue('Изюбриная!');
  });

  it('из дашборда открывает вкладку с блокером', async () => {
    vi.mocked(adminGetTour).mockResolvedValue({
      document: { ...readyTour(), coverAssetId: null },
      meta: createCmsTourMeta(),
      published: true,
    });
    renderEditor(
      {
        login: 'alice',
        role: 'admin',
        canPublishTours: true,
        canPublishSchedule: true,
      },
      '/tours/winter-1?tab=attention',
    );
    const aboutTab = `${ADMIN_UI.sectionNav.about}, ${ADMIN_UI.tabHasBlocker}`;
    await waitFor(() =>
      expect(screen.getByRole('tab', { name: aboutTab })).toHaveAttribute('aria-selected', 'true'),
    );
    expect(screen.getByText(ADMIN_UI.aboutCoverHeading)).toBeVisible();
  });

  it('раскладывает одноколоночное описание в две колонки редактора', async () => {
    const user = userEvent.setup();
    vi.mocked(adminGetTour).mockResolvedValue({
      document: {
        ...readyTour(),
        descriptionLeadBold: 'Гора Изюбриная (1433 м)',
        description:
          ' — живописная вершина в Чугуевском районе Приморского края на пересечении хребтов Белки и Лугового. «Самая снежная» вершина известна своими сказочными заснеженными елями и является местом притяжения зимнего туризма. Входит в список «Лунного медведя».',
        descriptionAside: '',
      },
      meta: createCmsTourMeta(),
      published: false,
    });
    renderEditor({
      login: 'alice',
      role: 'admin',
      canPublishTours: true,
      canPublishSchedule: true,
    });
    await user.click(await screen.findByRole('tab', { name: ADMIN_UI.sectionNav.about }));
    expect(screen.getByLabelText(ADMIN_UI.descriptionLabel)).toHaveValue(
      'живописная вершина в Чугуевском районе Приморского края на пересечении хребтов Белки и Лугового.',
    );
    expect(screen.getByLabelText(ADMIN_UI.asideLabel)).toHaveValue(
      '«Самая снежная» вершина известна своими сказочными заснеженными елями и является местом притяжения зимнего туризма. Входит в список «Лунного медведя».',
    );
    expect(screen.getByTestId('admin-about-columns')).toHaveClass('md:grid-cols-2');
  });
});
