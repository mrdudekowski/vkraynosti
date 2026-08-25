import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { LogOut, Menu, PanelLeftClose, PanelLeftOpen, Plus } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ADMIN_SIDEBAR_LOGO } from '../../constants/images';
import { useModalFocusTrap } from '../../hooks/useModalFocusTrap';
import type { AdminSession } from '../api';
import { ADMIN_NAV_ITEMS, type AdminNavItem } from '../constants/nav';
import { ADMIN_PATHS } from '../constants/routes';
import { ADMIN_UI } from '../constants/ui';
import { useAdminSidebarCollapsed } from '../hooks/useAdminSidebarCollapsed';
import { useAdminViewport } from '../hooks/useAdminViewport';
import AdminIcon from './AdminIcon';
import CreateTourModal from './CreateTourModal';
import AdminProfileMenu from './AdminProfileMenu';

type AdminChromeProps = {
  session: AdminSession;
  onLogout: () => void;
  children: ReactNode;
};

function visibleNavItems(session: AdminSession): AdminNavItem[] {
  return ADMIN_NAV_ITEMS.filter((item) => item.adminOnly !== true || session.role === 'admin');
}

type NavRowProps = {
  item: AdminNavItem;
  compact: boolean;
  pathname: string;
  onNavigate?: () => void;
};

const NavRow = ({ item, compact, pathname, onNavigate }: NavRowProps) => {
  const active = item.isActive(pathname);
  return (
    <NavLink
      to={item.to}
      end={item.id === 'dashboard'}
      title={compact ? item.label : undefined}
      onClick={onNavigate}
      className={active ? 'admin-sidebar-nav-active' : 'admin-sidebar-nav'}
      aria-current={active ? 'page' : undefined}
    >
      <span
        className={`h-5 w-0.5 shrink-0 rounded-full ${active ? 'bg-brand-accent' : 'bg-transparent'}`}
      />
      <AdminIcon icon={item.icon} />
      <span className={compact ? 'sr-only' : 'min-w-0 truncate'}>{item.label}</span>
      {item.soon ? (
        <span className={compact ? 'hidden' : 'admin-badge-neutral'} aria-hidden>
          {ADMIN_UI.soon}
        </span>
      ) : null}
    </NavLink>
  );
};

type SidebarBodyProps = {
  session: AdminSession;
  compact: boolean;
  pathname: string;
  onLogout: () => void;
  onToggleCollapsed: () => void;
  onQuickAddTour: () => void;
  onQuickAddDeparture: () => void;
  onNavigate?: () => void;
};

const SidebarBody = ({
  session,
  compact,
  pathname,
  onLogout,
  onToggleCollapsed,
  onQuickAddTour,
  onQuickAddDeparture,
  onNavigate,
}: SidebarBodyProps) => {
  const [quickOpen, setQuickOpen] = useState(false);
  const quickAddRef = useRef<HTMLDivElement>(null);
  const quickAddTriggerRef = useRef<HTMLButtonElement>(null);
  const items = useMemo(() => visibleNavItems(session), [session]);
  const core = items.filter((item) => item.secondary !== true);
  const secondary = items.filter((item) => item.secondary === true);
  const collapseLabel = compact ? ADMIN_UI.expandNav : ADMIN_UI.collapseNav;

  useEffect(() => {
    if (!quickOpen) {
      return;
    }

    const closeFromEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }
      setQuickOpen(false);
      quickAddTriggerRef.current?.focus();
    };
    const closeFromOutsidePointer = (event: PointerEvent) => {
      if (!quickAddRef.current?.contains(event.target as Node)) {
        setQuickOpen(false);
      }
    };

    document.addEventListener('keydown', closeFromEscape);
    document.addEventListener('pointerdown', closeFromOutsidePointer);
    return () => {
      document.removeEventListener('keydown', closeFromEscape);
      document.removeEventListener('pointerdown', closeFromOutsidePointer);
    };
  }, [quickOpen]);

  return (
    <>
      <div className={`flex h-navbar shrink-0 items-center gap-2 px-2 ${compact ? 'justify-center' : ''}`}>
        <img
          src={ADMIN_SIDEBAR_LOGO}
          alt=""
          className={compact ? 'h-8 w-8 object-contain' : 'h-9 w-8 shrink-0 object-contain'}
        />
        <p className={compact ? 'sr-only' : 'min-w-0 truncate text-sm font-semibold text-text-inverse'}>
          {ADMIN_UI.documentTitle}
        </p>
      </div>
      <div ref={quickAddRef} className="relative px-2">
        <button
          ref={quickAddTriggerRef}
          type="button"
          className="admin-sidebar-nav w-full gap-2"
          aria-expanded={quickOpen}
          aria-haspopup="menu"
          title={ADMIN_UI.quickAdd}
          onClick={() => setQuickOpen((open) => !open)}
        >
          <AdminIcon icon={Plus} />
          <span className={compact ? 'sr-only' : undefined}>{ADMIN_UI.quickAdd}</span>
        </button>
        {quickOpen ? (
          <ul
            role="menu"
            className="absolute z-tooltip mt-1 w-52 rounded-admin-control border border-divider bg-surface-light py-1 shadow-admin-overlay"
          >
            <li>
              <button
                type="button"
                role="menuitem"
                className="admin-btn-ghost w-full justify-start"
                onClick={() => {
                  setQuickOpen(false);
                  onQuickAddTour();
                }}
              >
                {ADMIN_UI.addTour}
              </button>
            </li>
            <li>
              <button
                type="button"
                role="menuitem"
                className="admin-btn-ghost w-full justify-start"
                onClick={() => {
                  setQuickOpen(false);
                  onQuickAddDeparture();
                }}
              >
                {ADMIN_UI.scheduleAddFromTour}
              </button>
            </li>
          </ul>
        ) : null}
      </div>
      <nav aria-label={ADMIN_UI.primaryNav} className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-4">
        {core.map((item) => (
          <NavRow
            key={item.id}
            item={item}
            compact={compact}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        ))}
        {secondary.length > 0 ? (
          <div className="mt-4 flex flex-col gap-1">
            {secondary.map((item) => (
              <NavRow
                key={item.id}
                item={item}
                compact={compact}
                pathname={pathname}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        ) : null}
      </nav>
      <div className="mt-auto flex flex-col gap-1 px-2 pb-3">
        <AdminProfileMenu session={session} onLogout={onLogout} />
        <button type="button" className="admin-sidebar-nav w-full" onClick={onLogout} title={ADMIN_UI.logout}>
          <AdminIcon icon={LogOut} />
          <span className={compact ? 'sr-only' : undefined}>{ADMIN_UI.logout}</span>
        </button>
        <button
          type="button"
          className="admin-sidebar-nav w-full"
          onClick={onToggleCollapsed}
          title={collapseLabel}
        >
          <AdminIcon icon={compact ? PanelLeftOpen : PanelLeftClose} />
          <span className={compact ? 'sr-only' : undefined}>{collapseLabel}</span>
        </button>
      </div>
    </>
  );
};

type OverlaySidebarProps = {
  session: AdminSession;
  pathname: string;
  onClose: () => void;
  onLogout: () => void;
  onQuickAddTour: () => void;
  onQuickAddDeparture: () => void;
};

const OverlaySidebar = ({
  session,
  pathname,
  onClose,
  onLogout,
  onQuickAddTour,
  onQuickAddDeparture,
}: OverlaySidebarProps) => {
  const overlayRef = useRef<HTMLElement>(null);
  useModalFocusTrap(overlayRef, onClose);

  return (
    <div className="fixed inset-0 z-modal">
      <button
        type="button"
        className="absolute inset-0 bg-surface-dark/40"
        aria-label={ADMIN_UI.closeOverlay}
        onClick={onClose}
      />
      <aside
        ref={overlayRef}
        className="relative flex h-full w-admin-sidebar flex-col bg-brand-primary shadow-admin-overlay"
      >
        <SidebarBody
          session={session}
          compact={false}
          pathname={pathname}
          onLogout={onLogout}
          onToggleCollapsed={onClose}
          onQuickAddTour={onQuickAddTour}
          onQuickAddDeparture={onQuickAddDeparture}
          onNavigate={onClose}
        />
      </aside>
    </div>
  );
};

type MoreSheetProps = {
  items: readonly AdminNavItem[];
  onClose: () => void;
  onLogout: () => void;
  onQuickAddTour: () => void;
  onQuickAddDeparture: () => void;
};

const MoreSheet = ({
  items,
  onClose,
  onLogout,
  onQuickAddTour,
  onQuickAddDeparture,
}: MoreSheetProps) => {
  const moreRef = useRef<HTMLDivElement>(null);
  useModalFocusTrap(moreRef, onClose);

  return (
    <div className="fixed inset-0 z-modal">
      <button
        type="button"
        className="absolute inset-0 bg-surface-dark/40"
        aria-label={ADMIN_UI.closeOverlay}
        onClick={onClose}
      />
      <div
        ref={moreRef}
        role="dialog"
        aria-modal="true"
        aria-label={ADMIN_UI.moreNav}
        className="absolute inset-x-0 bottom-0 rounded-t-admin-overlay bg-surface-light p-4 pb-safe-bottom shadow-admin-overlay"
      >
        <div className="flex flex-col gap-1">
          <button
            type="button"
            className="admin-btn-ghost justify-start"
            onClick={() => {
              onClose();
              onQuickAddTour();
            }}
          >
            {ADMIN_UI.addTour}
          </button>
          <button
            type="button"
            className="admin-btn-ghost justify-start"
            onClick={() => {
              onClose();
              onQuickAddDeparture();
            }}
          >
            {ADMIN_UI.scheduleAddFromTour}
          </button>
          {items.map((item) => (
            <NavLink
              key={item.id}
              to={item.to}
              className="admin-nav-item flex min-h-11 items-center gap-2 rounded-admin-control px-2 no-underline"
              onClick={onClose}
            >
              <AdminIcon icon={item.icon} />
              {item.label}
              {item.soon ? (
                <span className="admin-badge-neutral" aria-hidden>
                  {ADMIN_UI.soon}
                </span>
              ) : null}
            </NavLink>
          ))}
          <button type="button" className="admin-btn-ghost justify-start" onClick={onLogout}>
            {ADMIN_UI.logout}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminChrome = ({ session, onLogout, children }: AdminChromeProps) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { collapsed, toggle } = useAdminSidebarCollapsed();
  const viewport = useAdminViewport();
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [createTourOpen, setCreateTourOpen] = useState(false);
  const items = useMemo(() => visibleNavItems(session), [session]);
  const bottomItems = items.filter((item) => item.inBottomNav === true);
  const moreItems = items.filter((item) => item.inBottomNav !== true);
  const showSidebar = viewport !== 'mobile';
  const compact = viewport !== 'desktop' || collapsed;

  const openQuickTour = () => {
    setCreateTourOpen(true);
    setOverlayOpen(false);
    setMoreOpen(false);
  };

  const openQuickDeparture = () => {
    setOverlayOpen(false);
    setMoreOpen(false);
    void navigate(ADMIN_PATHS.schedule);
  };

  const onToggleCollapsed = () => {
    if (viewport === 'desktop') {
      toggle();
      return;
    }
    setOverlayOpen(true);
  };

  return (
    <div className="flex h-dvh max-h-dvh overflow-hidden bg-surface-light">
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-modal focus:rounded-admin-control focus:bg-surface-light focus:px-3 focus:py-2 focus:text-sm"
      >
        {ADMIN_UI.skipToContent}
      </a>
      {showSidebar ? (
        <aside
          className={`flex h-full shrink-0 flex-col overflow-y-auto bg-brand-primary ${
            compact ? 'w-admin-rail' : 'w-admin-sidebar'
          }`}
        >
          <SidebarBody
            session={session}
            compact={compact}
            pathname={pathname}
            onLogout={onLogout}
            onToggleCollapsed={onToggleCollapsed}
            onQuickAddTour={openQuickTour}
            onQuickAddDeparture={openQuickDeparture}
          />
        </aside>
      ) : null}
      {overlayOpen && viewport === 'tablet' ? (
        <OverlaySidebar
          session={session}
          pathname={pathname}
          onClose={() => setOverlayOpen(false)}
          onLogout={onLogout}
          onQuickAddTour={openQuickTour}
          onQuickAddDeparture={openQuickDeparture}
        />
      ) : null}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <main
          id="admin-main"
          className={`min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto ${
            viewport === 'mobile' ? 'pb-navbar' : ''
          }`}
        >
          {children}
        </main>
      </div>
      {viewport === 'mobile' ? (
        <nav
          aria-label={ADMIN_UI.primaryNav}
          className="fixed inset-x-0 bottom-0 z-navbar flex min-h-navbar items-stretch border-t border-divider bg-surface-light pb-safe-bottom"
        >
          {bottomItems.map((item) => {
            const active = item.isActive(pathname);
            return (
              <NavLink
                key={item.id}
                to={item.to}
                end={item.id === 'dashboard'}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-xs no-underline ${
                  active ? 'font-medium text-brand-primary' : 'text-text-muted'
                }`}
              >
                <AdminIcon icon={item.icon} size={20} />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
          <button
            type="button"
            className="flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-xs text-text-muted"
            onClick={() => setMoreOpen(true)}
          >
            <AdminIcon icon={Menu} size={20} />
            <span className="truncate">{ADMIN_UI.moreNav}</span>
          </button>
        </nav>
      ) : null}
      {moreOpen && viewport === 'mobile' ? (
        <MoreSheet
          items={moreItems}
          onClose={() => setMoreOpen(false)}
          onLogout={onLogout}
          onQuickAddTour={openQuickTour}
          onQuickAddDeparture={openQuickDeparture}
        />
      ) : null}
      {createTourOpen ? (
        <CreateTourModal
          onClose={() => setCreateTourOpen(false)}
          onCreated={(tourId) => {
            setCreateTourOpen(false);
            void navigate(ADMIN_PATHS.tour(tourId));
          }}
        />
      ) : null}
    </div>
  );
};

export default AdminChrome;
