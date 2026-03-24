import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UI } from '../../constants/ui';
import { ROUTES } from '../../constants/routes';
import { SEASON_ICON, SEASON_STYLE, SEASON_TEXT_CLASS } from '../../constants/seasonNavbarAppearance';
import { useSeasonNavMenu } from '../../context/useSeasonNavMenu';
import { useSeason } from '../../context/useSeason';
import SeasonSwitcher from '../shared/SeasonSwitcher';
import AnimatedHamburgerIcon from '../shared/AnimatedHamburgerIcon';
const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  /** Портал и выходная анимация: держим в DOM, пока transform не доедет до translateX(100%). */
  const [panelMounted, setPanelMounted] = useState(false);
  const [panelEnter, setPanelEnter] = useState(false);
  const prevBodyOverflow = useRef<string | null>(null);
  const menuOpenRef = useRef(menuOpen);
  menuOpenRef.current = menuOpen;

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setPanelEnter(false);
  }, []);

  /** Все хуки до любого useEffect — иначе при Fast Refresh ломается сопоставление хуков и массив зависимостей. */
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === ROUTES.HOME;
  const { activeSeason } = useSeason();
  const activeSeasonUi = UI.seasons[activeSeason];
  const { open: seasonMenuOpen, setOpen: setSeasonMenuOpen, toggle: toggleSeasonMenu } =
    useSeasonNavMenu();
  const activeSeasonStyle = SEASON_STYLE[activeSeason];
  const brandWordmark = UI.nav.brand;
  const brandFirstLetter = brandWordmark.slice(0, 1);
  const brandRest = brandWordmark.slice(1);

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
    if (isHome) {
      const element = document.querySelector('#tours');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }
    navigate({ pathname: ROUTES.HOME, hash: 'tours' });
  };

  const navLinkClass =
    'text-text-inverse/80 hover:text-brand-secondary transition-colors duration-hover text-sm font-medium';
  const navLinkClassMobile =
    'block text-text-inverse/80 hover:text-brand-secondary transition-colors duration-hover text-base font-medium';

  const handleBrandLogoClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const isPlainHome =
      location.pathname === ROUTES.HOME && location.search === '' && location.hash === '';
    if (isPlainHome && window.scrollY > 0) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-navbar bg-surface-dark/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Left: Logo + подпись сезона (текст только здесь; в SeasonNavDock — только иконки) */}
          <div className="flex min-w-0 flex-1 items-center gap-2 xs:gap-3">
            <Link
              to={ROUTES.HOME}
              onClick={handleBrandLogoClick}
              className="shrink-0 font-brand-wordmark text-brand-wordmark-nav group transition-colors duration-hover"
              prefetch="none"
            >
              <span
                className={`transition-colors duration-season-change group-hover:text-brand-secondary ${SEASON_TEXT_CLASS[activeSeason]}`}
              >
                {brandFirstLetter}
              </span>
              <span className="text-text-inverse transition-colors duration-hover group-hover:text-brand-secondary">
                {brandRest}
              </span>
            </Link>
            <span
              data-testid="season-indicator"
              className={`hidden xs:inline min-w-0 truncate font-heading text-sm font-normal ${SEASON_TEXT_CLASS[activeSeason]}`}
            >
              {activeSeasonUi.label}
            </span>
            <div
              role="group"
              aria-label={`${UI.nav.seasonNavCurrentSeasonGroup}: ${activeSeasonUi.label}`}
              className="inline-flex season-md:hidden shrink-0 items-center gap-0.5"
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
              <button
                type="button"
                data-testid="season-nav-toggle"
                data-season-nav-toggle
                className="inline-flex shrink-0 items-center justify-center rounded-md p-1 text-text-inverse/70 hover:text-text-inverse transition-colors duration-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary"
                aria-expanded={seasonMenuOpen}
                aria-controls="season-nav-dock-panel"
                aria-label={
                  seasonMenuOpen ? UI.nav.seasonNavMenuToggleCollapse : UI.nav.seasonDockExpand
                }
                onClick={handleSeasonNavButtonClick}
              >
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={[
                    'w-4 h-4 transition-transform duration-hover',
                    seasonMenuOpen ? '-rotate-180' : '',
                  ].join(' ')}
                />
              </button>
            </div>
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
                className={`block transition-colors duration-season-change ${SEASON_TEXT_CLASS[activeSeason]}`}
              >
                <AnimatedHamburgerIcon />
              </span>
            </button>
          </div>
        </div>

        {/* Mobile menu в portal: иначе backdrop-blur у <nav> ломает containing block для fixed */}
        {panelMounted &&
          createPortal(
            <>
              <button
                type="button"
                className={[
                  'nav-desktop:hidden fixed top-16 left-0 right-0 bottom-0 z-mobileNav bg-black/50',
                  'transition-opacity duration-mobile-nav ease-out mobile-nav-backdrop',
                  panelEnter ? 'opacity-100' : 'opacity-0 pointer-events-none',
                ].join(' ')}
                aria-label={UI.nav.mobileMenuCloseOverlay}
                onClick={closeMenu}
              />
              <div
                className={[
                  'nav-desktop:hidden fixed top-16 right-0 z-mobileNav flex flex-col rounded-b-lg border border-white/10',
                  'bg-surface-dark/95 py-4 pl-5 pr-4 shadow-xl backdrop-blur-sm mobile-nav-panel',
                  'w-[min(100vw,theme(maxWidth.sm))] transform transition-transform duration-mobile-nav ease-out',
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
            </>,
            document.body
          )}
      </div>
    </nav>
  );
};

export default Navbar;
