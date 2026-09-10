import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { ADMIN_SIDEBAR_COLLAPSED_STORAGE_KEY } from '../../constants/adminUiTokens';
import { ADMIN_SIDEBAR_LOGO } from '../../constants/images';
import type { AdminSession } from '../api';
import { ADMIN_UI } from '../constants/ui';
import AdminChrome from './AdminChrome';

const adminSession: AdminSession = {
  login: 'admin',
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
  return <p>{`${location.pathname}${location.search}`}</p>;
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

function renderChrome(
  session: AdminSession,
  onLogout = () => undefined,
  widthPx = 1280,
  initialPath = '/',
  keepChromeOnAllRoutes = false,
) {
  mockViewportWidth(widthPx);
  const chrome = (
    <AdminChrome session={session} onLogout={onLogout}>
      <p>{ADMIN_UI.listTitle}</p>
    </AdminChrome>
  );
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path={keepChromeOnAllRoutes ? '*' : '/'} element={chrome} />
        {!keepChromeOnAllRoutes ? <Route path="/schedule" element={<LocationProbe />} /> : null}
        {!keepChromeOnAllRoutes ? <Route path="/inbox" element={<p>{ADMIN_UI.inboxTitle}</p>} /> : null}
      </Routes>
    </MemoryRouter>,
  );
}

describe('AdminChrome', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('показывает ядро навигации и вторичные заявки с бейджем скоро', () => {
    renderChrome(adminSession);

    expect(screen.getByRole('link', { name: ADMIN_UI.dashboardNav })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: ADMIN_UI.toursNav })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: ADMIN_UI.scheduleNav })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: ADMIN_UI.inboxNav })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: ADMIN_UI.usersNav })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: ADMIN_UI.crmNav })).toBeInTheDocument();
    expect(screen.getByText(ADMIN_UI.soon)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: ADMIN_UI.logout })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: ADMIN_UI.skipToContent })).toBeInTheDocument();
    expect(document.querySelector(`img[src="${ADMIN_SIDEBAR_LOGO}"]`)).toBeInTheDocument();
  });

  it('прячет людей от редактора', () => {
    renderChrome(editorSession);
    expect(screen.queryByRole('link', { name: ADMIN_UI.usersNav })).not.toBeInTheDocument();
  });

  it('запоминает свёрнутый сайдбар', async () => {
    const user = userEvent.setup();
    renderChrome(adminSession);

    await user.click(screen.getByRole('button', { name: ADMIN_UI.collapseNav }));
    expect(window.localStorage.getItem(ADMIN_SIDEBAR_COLLAPSED_STORAGE_KEY)).toBe('1');
    expect(screen.getByRole('button', { name: ADMIN_UI.expandNav })).toBeInTheDocument();
  });

  it('не красит быстрое создание как главное действие экрана', () => {
    renderChrome(adminSession);
    expect(screen.getByRole('button', { name: ADMIN_UI.quickAdd })).not.toHaveClass(
      'admin-btn-primary',
    );
  });

  it('быстрое создание ведёт в календарь за новым выездом', async () => {
    const user = userEvent.setup();
    renderChrome(adminSession);

    await user.click(screen.getByRole('button', { name: ADMIN_UI.quickAdd }));
    await user.click(screen.getByRole('menuitem', { name: ADMIN_UI.scheduleAddFromTour }));
    expect(screen.getByText('/schedule')).toBeInTheDocument();
  });

  it('закрывает быстрое создание по Escape и возвращает фокус на триггер', async () => {
    const user = userEvent.setup();
    renderChrome(adminSession);
    const trigger = screen.getByRole('button', { name: ADMIN_UI.quickAdd });

    await user.click(trigger);
    expect(screen.getByRole('menu')).toBeVisible();
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('на 360 даёт нижнюю навигацию и быстрое создание в «Ещё»', async () => {
    const user = userEvent.setup();
    renderChrome(adminSession, () => undefined, 360);

    expect(screen.getByRole('button', { name: ADMIN_UI.moreNav })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: ADMIN_UI.collapseNav })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: ADMIN_UI.expandNav })).not.toBeInTheDocument();
    expect(
      within(screen.getByRole('navigation', { name: ADMIN_UI.primaryNav })).getByRole('link', {
        name: ADMIN_UI.inboxNav,
      }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: ADMIN_UI.moreNav }));
    expect(screen.getByRole('button', { name: ADMIN_UI.addTour })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: ADMIN_UI.scheduleAddFromTour })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: ADMIN_UI.logout })).toBeInTheDocument();
  });

  it('отмечает текущий пункт нижней навигации как текущую страницу', () => {
    renderChrome(adminSession, () => undefined, 360, '/schedule', true);

    expect(screen.getByRole('link', { name: ADMIN_UI.scheduleNav })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('на планшете держит rail без нижней навигации', () => {
    renderChrome(adminSession, () => undefined, 768);
    expect(screen.getByRole('button', { name: ADMIN_UI.expandNav })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: ADMIN_UI.moreNav })).not.toBeInTheDocument();
  });

  it('на широком десктопе держит развёрнутый сайдбар', () => {
    renderChrome(adminSession, () => undefined, 1920);
    expect(screen.getByRole('button', { name: ADMIN_UI.collapseNav })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: ADMIN_UI.moreNav })).not.toBeInTheDocument();
  });
});
