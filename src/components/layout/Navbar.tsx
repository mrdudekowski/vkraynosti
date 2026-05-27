import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons/faChevronDown';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLenis } from 'lenis/react';
import { UI } from '../../constants/ui';
import { ROUTES } from '../../constants/routes';
import { scrollHomeHeroTopImmediate, scrollHomeHeroTopSmooth } from '../../constants/smoothScroll';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { SEASON_ICON, SEASON_STYLE, SEASON_TEXT_CLASS } from '../../constants/seasonNavbarAppearance';
import { computeHomeNavbarEffectiveTopChromeOpacity } from '../../constants/homeNavbarBridgeChrome';
import { homeNavbarChromeOpacityShellClass } from '../../constants/homeNavbarChrome';
import { useHomeNavbarChrome } from '../../context/useHomeNavbarChrome';
import { useMobileNavMenu } from '../../context/useMobileNavMenu';
import { useSeasonNavMenu } from '../../context/useSeasonNavMenu';
import { useSeason } from '../../context/useSeason';
import SeasonSwitcher from '../shared/SeasonSwitcher';
import AnimatedHamburgerIcon from '../shared/AnimatedHamburgerIcon';
import BrandWordmark from '../shared/BrandWordmark';

type NavbarMobileMenuPortalProps = {
  panelMounted: boolean;
  panelEnter: boolean;
  mobileOverlayTop: string;
  closeMenu: () => void;
  handleCtaClick: () => void;
  handleMobilePanelTransitionEnd: (event: React.TransitionEvent<HTMLDivElement>) => void;
  navLinkClassMobile: string;
};

function NavbarMobileMenuPortal({
  panelMounted,
  panelEnter,
  mobileOverlayTop,
  closeMenu,
  handleCtaClick,
  handleMobilePanelTransitionEnd,
  navLinkClassMobile,
}: NavbarMobileMenuPortalProps) {
  if (!panelMounted) {
    return null;
  }

  return createPortal(
    <div className="nav-desktop:hidden contents">
      <button
        type="button"
        className={[
          `fixed left-0 right-0 bottom-0 z-mobileNav bg-black/50 ${mobileOverlayTop}`,
          'transition-opacity duration-mobile-nav ease-out mobile-nav-backdrop',
          panelEnter ? 'opacity-100' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        aria-label={UI.nav.mobileMenuCloseOverlay}
        onClick={closeMenu}
      />
      <div
        className={[
          `fixed right-0 z-mobileNav flex flex-col rounded-b-lg border border-white/10 ${mobileOverlayTop}`,
          'bg-surface-dark/95 py-4 pl-5 pr-4 shadow-xl backdrop-blur-sm mobile-nav-panel',
          'w-mobile-nav-drawer mobile-nav-drawer-compact:w-mobile-nav-drawer-compact transform transition-transform duration-mobile-nav ease-out',
          panelEnter ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
        role="dialog"
        aria-modal="true"
        aria-label={UI.nav.mobileMenuDialog}
        onTransitionEnd={handleMobilePanelTransitionEnd}
      >
        <ul className="flex flex-col gap-3 mb-3">
          {UI.nav.links.map(link => (
            <li key={link.hash}>
              <Link
                to={{ pathname: ROUTES.HOME, hash: link.hash }}
                onClick={closeMenu}
                className={navLinkClassMobile}
                prefetch="none"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <button type="button" onClick={handleCtaClick} className="btn-primary w-full text-center">
          {UI.nav.cta}
        </button>
      </div>
    </div>,
    document.body
  );
}

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  /** Портал и выходная анимация: держим в DOM, пока transform не доедет до translateX(100%). */
  const [panelMounted, setPanelMounted] = useState(false);
  const [panelEnter, setPanelEnter] = useState(false);
  const prevBodyOverflow = useRef<string | null>(null);
  const menuOpenRef = useRef(menuOpen);

  useEffect(() => {
    menuOpenRef.current = menuOpen;
  }, [menuOpen]);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setPanelEnter(false);
  }, []);

  /** Все хуки до любого useEffect — иначе при Fast Refresh ломается сопоставление хуков и массив зависимостей. */
  const location = useLocation();
  const navigate = useNavigate();
  const lenis = useLenis();
  const prefersReducedMotion = usePrefersReducedMotion();
  const { activeSeason } = useSeason();
  const activeSeasonUi = UI.seasons[activeSeason];
  const { setBurgerMenuActive } = useMobileNavMenu();
  const { open: seasonMenuOpen, setOpen: setSeasonMenuOpen, toggle: toggleSeasonMenu } =
    useSeasonNavMenu();
  const { snap: homeChrome } = useHomeNavbarChrome();
  const activeSeasonStyle = SEASON_STYLE[activeSeason];

  useEffect(() => {
    setBurgerMenuActive(menuOpen || panelMounted);
  }, [menuOpen, panelMounted, setBurgerMenuActive]);

  const openMenu = () => {
    setMenuOpen(true);
    setPanelMounted(true);
    setPanelEnter(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setPanelEnter(true));
    });
  };

  const handleMobilePanelTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== 'transform') return;
    if (!menuOpenRef.current) {
      setPanelMounted(false);
    }
  };

  /** Если transitionend не пришёл (редкий случай / reduced motion), всё равно снимаем портал. */
  useEffect(() => {
    if (menuOpen || panelEnter || !panelMounted) return;
    const t = window.setTimeout(() => setPanelMounted(false), 400);
    return () => window.clearTimeout(t);
  }, [menuOpen, panelEnter, panelMounted]);

  useEffect(() => {
    if (!menuOpen && !panelMounted) return;

    prevBodyOverflow.current = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevBodyOverflow.current ?? '';
      prevBodyOverflow.current = null;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen, panelMounted, closeMenu]);

  const handleSeasonNavButtonClick = () => {
    closeMenu();
    toggleSeasonMenu();
  };

  const handleCtaClick = () => {
    closeMenu();
    navigate({ pathname: ROUTES.HOME, hash: 'tours' });
  };

  const navLinkClass =
    'text-text-inverse/80 hover:text-brand-secondary transition-colors duration-hover text-sm font-medium';
  const navLinkClassMobile =
    'block text-text-inverse/80 hover:text-brand-secondary transition-colors duration-hover text-base font-medium';

  const handleBrandLogoClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const isPlainHome =
      location.pathname === ROUTES.HOME && location.search === '' && location.hash === '';
    if (!isPlainHome) return;
    event.preventDefault();
    if (prefersReducedMotion) {
      scrollHomeHeroTopImmediate(lenis);
    } else {
      scrollHomeHeroTopSmooth(lenis);
    }
  };

  const navShellTransition = homeNavbarChromeOpacityShellClass(
    homeChrome.disableTopChromeTransition
  );
  const mobileOverlayTop = homeChrome.mainUsesNavbarTopPadding ? 'top-16' : 'top-0';

  const isHomePath = location.pathname === ROUTES.HOME;
  const navShellOpacity = isHomePath
    ? computeHomeNavbarEffectiveTopChromeOpacity(
        homeChrome.topChromeOpacity,
        homeChrome.bridgeHideProgress
      )
    : 1;
  const navShellPointerEvents =
    isHomePath && navShellOpacity < 0.001 ? 'pointer-events-none' : '';

  return (
    <nav data-layout-navbar className="fixed top-0 left-0 right-0 z-navbar">
      <div
        className={`relative ${navShellTransition} ${navShellPointerEvents}`.trim()}
        style={{ opacity: navShellOpacity }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-navbar-chrome bg-home-gate-start-screen"
        />
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">

          {/* Left: Logo + подпись сезона (текст только здесь; в SeasonNavDock — только иконки) */}
          <div className="flex min-w-0 flex-1 items-center gap-2 xs:gap-3">
            <Link
              to={ROUTES.HOME}
              onClick={handleBrandLogoClick}
              className="shrink-0 group transition-colors duration-hover"
              prefetch="none"
            >
              <BrandWordmark season={activeSeason} size="nav" interactive />
            </Link>
            <span
              data-testid="season-indicator"
              className={`hidden xs:inline min-w-0 truncate font-heading text-sm font-normal transition-all duration-season-change ${SEASON_TEXT_CLASS[activeSeason]}`}
            >
              {activeSeasonUi.label}
            </span>
            <button
              type="button"
              data-testid="season-nav-toggle"
              data-season-nav-toggle
              className="inline-flex season-md:hidden shrink-0 items-center gap-0.5 rounded-md p-0 text-text-inverse/70 transition-colors duration-hover hover:text-text-inverse focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary"
              aria-expanded={seasonMenuOpen}
              aria-controls="season-nav-dock-panel"
              aria-label={
                seasonMenuOpen ? UI.nav.seasonNavMenuToggleCollapse : UI.nav.seasonDockExpand
              }
              onClick={handleSeasonNavButtonClick}
            >
              <span
                aria-hidden
                className={[
                  'relative inline-flex shrink-0 items-center justify-center rounded-full overflow-hidden',
                  'w-nav-season-circle-fluid h-nav-season-circle-fluid',
                  'backdrop-blur-lg border',
                  activeSeasonStyle.border,
                  'bg-gradient-to-tr from-black/60 to-black/40 shadow-lg',
                  activeSeasonStyle.activeShadow,
                  activeSeasonStyle.activeRing,
                  'scale-105',
                ].join(' ')}
              >
                <FontAwesomeIcon
                  icon={SEASON_ICON[activeSeason]}
                  className={[
                    'w-nav-season-icon-fluid h-nav-season-icon-fluid relative z-10',
                    activeSeasonStyle.iconColor,
                  ].join(' ')}
                />
              </span>
              <span
                aria-hidden
                className="inline-flex shrink-0 items-center justify-center rounded-md p-1"
              >
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={[
                    'h-4 w-4 transition-transform duration-hover',
                    seasonMenuOpen ? '-rotate-180' : '',
                  ].join(' ')}
                />
              </span>
            </button>
          </div>

          {/* Center: Desktop nav links */}
          <ul className="hidden nav-desktop:flex items-center gap-8">
            {UI.nav.links.map(link => (
              <li key={link.hash}>
                <Link
                  to={{ pathname: ROUTES.HOME, hash: link.hash }}
                  className={navLinkClass}
                  prefetch="none"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right: Season switcher (от 500px) + CTA + Hamburger */}
          <div className="flex items-center gap-3 shrink-0 nav-desktop:ml-navbar-nav-to-season">
            <div className="hidden season-md:block">
              <SeasonSwitcher variant="navbar" />
            </div>
            <button
              type="button"
              onClick={handleCtaClick}
              className="hidden nav-desktop:block btn-primary text-sm"
            >
              {UI.nav.cta}
            </button>
            <button
              type="button"
              onClick={() => {
                if (menuOpen) {
                  closeMenu();
                } else {
                  setSeasonMenuOpen(false);
                  openMenu();
                }
              }}
              data-testid="burger-menu"
              className="nav-desktop:hidden hamburger-menu-btn p-2 rounded-lg cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary focus-visible:rounded-lg"
              aria-expanded={menuOpen}
              aria-label="Меню"
            >
              <span
                className={`block transition-[color,filter] duration-season-change ${activeSeasonStyle.iconColor}`}
              >
                <AnimatedHamburgerIcon />
              </span>
            </button>
          </div>
            </div>
          </div>
        </div>

        {/* Portal вне blur-оболочки: backdrop-blur у <nav> ломает containing block для fixed */}
        <NavbarMobileMenuPortal
          panelMounted={panelMounted}
          panelEnter={panelEnter}
          mobileOverlayTop={mobileOverlayTop}
          closeMenu={closeMenu}
          handleCtaClick={handleCtaClick}
          handleMobilePanelTransitionEnd={handleMobilePanelTransitionEnd}
          navLinkClassMobile={navLinkClassMobile}
        />
      </div>
    </nav>
  );
};

export default Navbar;
