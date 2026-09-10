import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ADMIN_SIDEBAR_COLLAPSED_STORAGE_KEY } from '../../constants/adminUiTokens';
import { ADMIN_SIDEBAR_LOGO } from '../../constants/images';
import type { AdminSession } from '../api';
import { ADMIN_UI } from '../constants/ui';
import AdminChrome from './AdminChrome';

const navState = vi.hoisted(() => ({
  items: null as null | unknown[],
  canonicalItems: null as null | unknown[],
}));

vi.mock('../constants/nav', async () => {
  const actual = await vi.importActual<typeof import('../constants/nav')>('../constants/nav');
  navState.canonicalItems = [...actual.ADMIN_NAV_ITEMS];
  navState.items = actual.ADMIN_NAV_ITEMS as unknown as unknown[];
  return {
    ...actual,
    get ADMIN_NAV_ITEMS() {
      return navState.items ?? actual.ADMIN_NAV_ITEMS;
    },
  };
});

const adminSession: AdminSession = {
  login: 'admin',
  role: 'admin',
  canPublishTours: true,
  canPublishSchedule: true,
  canEditSiteContent: true,
};

const editorSession: AdminSession = {
  login: 'editor',
  role: 'editor',
  canPublishTours: false,
  canPublishSchedule: false,
  canEditSiteContent: false,
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
        {!keepChromeOnAllRoutes ? <Route path="/inbox" element={<LocationProbe />} /> : null}
      </Routes>
    </MemoryRouter>,
  );
}

describe('AdminChrome', () => {
  beforeEach(() => {
    window.localStorage.clear();
    navState.items?.splice(0, navState.items.length, ...(navState.canonicalItems ?? []));
  });

  const setPermittedItemCount = (count: 7 | 8 | 9) => {
    const baseItems = [...(navState.canonicalItems ?? [])];
    const extras = Array.from({ length: count - baseItems.length }, (_, index) => ({
      ...baseItems[baseItems.length - 1],
      id: `extra-${index + 1}`,
      label: `Дополнительный раздел ${index + 1}`,
      to: `/extra-${index + 1}`,
    }));
    navState.items?.splice(0, navState.items.length, ...baseItems, ...extras);
  };

  it('показывает ядро навигации и профиль администратора', () => {
    renderChrome(adminSession);

    expect(screen.getByRole('link', { name: ADMIN_UI.dashboardNav })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: ADMIN_UI.toursNav })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: ADMIN_UI.scheduleNav })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: ADMIN_UI.inboxNav })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: ADMIN_UI.usersNav })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: ADMIN_UI.siteNav })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: ADMIN_UI.crmNav })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: ADMIN_UI.logout })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: ADMIN_UI.skipToContent })).toBeInTheDocument();
    expect(document.querySelector(`img[src="${ADMIN_SIDEBAR_LOGO}"]`)).toBeInTheDocument();
  });

  it('ограничивает открытое меню профиля шириной сайдбара', async () => {
    const user = userEvent.setup();
    renderChrome(adminSession);

    await user.click(screen.getByRole('button', { name: /Администратор/ }));
    expect(screen.getByRole('menu')).toHaveClass('min-w-0', 'max-w-full');
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

  it('показывает сайт редактору только с привилегией', () => {
    renderChrome({ ...editorSession, canEditSiteContent: true });
    expect(screen.getByRole('link', { name: ADMIN_UI.siteNav })).toBeInTheDocument();
    cleanup();
    renderChrome(editorSession);
    expect(screen.queryByRole('link', { name: ADMIN_UI.siteNav })).not.toBeInTheDocument();
  });

  it('открывает command menu и ведёт в найденный раздел', async () => {
    const user = userEvent.setup();
    renderChrome(adminSession);

    await user.click(screen.getByRole('button', { name: ADMIN_UI.commandMenu }));
    const dialog = screen.getByRole('dialog', { name: ADMIN_UI.commandMenu });
    await user.type(within(dialog).getByRole('searchbox'), 'публикации');
    await user.click(within(dialog).getByRole('link', { name: ADMIN_UI.inboxNav }));

    expect(screen.getByText('/inbox')).toBeInTheDocument();
  });

  it('открывает command menu по Ctrl+K и закрывает по Escape', async () => {
    const user = userEvent.setup();
    renderChrome(adminSession);

    await user.keyboard('{Control>}k{/Control}');
    expect(screen.getByRole('dialog', { name: ADMIN_UI.commandMenu })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: ADMIN_UI.commandMenu })).not.toBeInTheDocument();
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

  it('на планшете показывает подписи основной навигации без нижней навигации', () => {
    renderChrome(adminSession, () => undefined, 768);
    expect(screen.getByRole('button', { name: ADMIN_UI.collapseNav })).toBeInTheDocument();
    const navigation = screen.getByRole('navigation', { name: ADMIN_UI.primaryNav });
    expect(within(navigation).getByText(ADMIN_UI.dashboardNav)).not.toHaveClass('sr-only');
    expect(within(navigation).getByText(ADMIN_UI.toursNav)).not.toHaveClass('sr-only');
    expect(within(navigation).getByText(ADMIN_UI.scheduleNav)).not.toHaveClass('sr-only');
    expect(within(navigation).getByText(ADMIN_UI.inboxNav)).not.toHaveClass('sr-only');
    expect(screen.queryByRole('button', { name: ADMIN_UI.moreNav })).not.toBeInTheDocument();
  });

  it('на широком десктопе держит развёрнутый сайдбар', () => {
    renderChrome(adminSession, () => undefined, 1920);
    expect(screen.getByRole('button', { name: ADMIN_UI.collapseNav })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: ADMIN_UI.moreNav })).not.toBeInTheDocument();
  });

  it('сохраняет canonical desktop-навигацию без overflow при семи разрешённых разделах', () => {
    setPermittedItemCount(7);
    renderChrome(adminSession);

    expect(screen.getByRole('link', { name: ADMIN_UI.dashboardNav })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: ADMIN_UI.moreNav })).not.toBeInTheDocument();
  });

  it('показывает все восемь разрешённых разделов без overflow-триггера', () => {
    setPermittedItemCount(8);
    renderChrome(adminSession);

    expect(within(screen.getByRole('navigation', { name: ADMIN_UI.primaryNav })).getAllByRole('link')).toHaveLength(8);
    expect(screen.queryByRole('button', { name: ADMIN_UI.moreNav })).not.toBeInTheDocument();
  });

  it('ограничивает desktop-сайдбар восемью разделами и показывает девятый в диалоге', async () => {
    const user = userEvent.setup();
    setPermittedItemCount(9);
    renderChrome(adminSession);

    const navigation = screen.getByRole('navigation', { name: ADMIN_UI.primaryNav });
    expect(within(navigation).getAllByRole('link')).toHaveLength(8);
    await user.click(screen.getByRole('button', { name: ADMIN_UI.moreNav }));
    expect(screen.getByRole('dialog', { name: ADMIN_UI.overflowNavTitle })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Дополнительный раздел 1' })).toBeInTheDocument();
  });

  it('обменивает overflow-раздел с видимым и восстанавливает обмен после remount', async () => {
    const user = userEvent.setup();
    setPermittedItemCount(9);
    const view = renderChrome(adminSession);

    await user.click(screen.getByRole('button', { name: ADMIN_UI.moreNav }));
    expect(screen.getByRole('link', { name: 'Дополнительный раздел 1' })).toBeInTheDocument();
    const visibleLink = screen.getByRole('link', { name: ADMIN_UI.dashboardNav });
    const data = new Map<string, string>();
    const dataTransfer = {
      dropEffect: 'none',
      effectAllowed: 'none',
      setData: (type: string, value: string) => data.set(type, value),
      getData: (type: string) => data.get(type) ?? '',
    } as unknown as DataTransfer;
    dataTransfer.setData('application/x-admin-sidebar-overflow', 'extra-1');
    fireEvent.drop(visibleLink, { dataTransfer });

    expect(screen.getByRole('link', { name: 'Дополнительный раздел 1' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: ADMIN_UI.dashboardNav })).not.toBeInTheDocument();
    expect(window.localStorage.getItem('admin.sidebar.layout.v1')).toContain('extra-1');

    view.unmount();
    renderChrome(adminSession);
    expect(screen.getByRole('link', { name: 'Дополнительный раздел 1' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: ADMIN_UI.dashboardNav })).not.toBeInTheDocument();
  });
});
