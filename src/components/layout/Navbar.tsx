import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UI } from '../../constants/ui';
import { ROUTES } from '../../constants/routes';
import { useSeason } from '../../context/useSeason';
import SeasonSwitcher from '../shared/SeasonSwitcher';
import AnimatedHamburgerIcon from '../shared/AnimatedHamburgerIcon';
import type { Season } from '../../types';

const SEASON_TEXT_CLASS: Record<Season, string> = {
  winter: 'text-season-winter',
  spring: 'text-season-spring',
  summer: 'text-season-summer',
  fall:   'text-season-fall',
};

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const prevBodyOverflow = useRef<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === ROUTES.HOME;
  const { activeSeason } = useSeason();
  const activeSeasonUi = UI.seasons[activeSeason];
  const brandWordmark = UI.nav.brand;
  const brandFirstLetter = brandWordmark.slice(0, 1);
  const brandRest = brandWordmark.slice(1);

  useEffect(() => {
    if (!menuOpen) return;

    prevBodyOverflow.current = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevBodyOverflow.current ?? '';
      prevBodyOverflow.current = null;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const handleCtaClick = () => {
    setMenuOpen(false);
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
          </div>

          {/* Center: Desktop nav links */}
          <ul className="hidden md:flex items-center gap-8">
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
          <div className="flex items-center gap-3 shrink-0">
            <div className="max-[499px]:hidden season-md:block">
              <SeasonSwitcher variant="navbar" />
            </div>
            <button
              type="button"
              onClick={handleCtaClick}
              className="hidden md:block btn-primary text-sm"
            >
              {UI.nav.cta}
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen(open => !open)}
              data-testid="burger-menu"
              className="md:hidden hamburger-menu-btn p-2 rounded-lg cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary focus-visible:rounded-lg"
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

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/10 py-4 animate-fade-up">
            <ul className="flex flex-col gap-4 mb-4">
              {UI.nav.links.map(link => (
                <li key={link.hash}>
                  <Link
                    to={{ pathname: ROUTES.HOME, hash: link.hash }}
                    onClick={() => setMenuOpen(false)}
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
        )}
      </div>
    </nav>
  );
};

export default Navbar;
