import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { UI } from '../../constants/ui';
import { ROUTES } from '../../constants/routes';
import { useModal } from '../../context/ModalContext';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { openConsultModal } = useModal();
  const location = useLocation();
  const isHome = location.pathname === ROUTES.HOME;

  const handleNavLinkClick = (href: string) => {
    setMenuOpen(false);
    if (isHome) return;
    window.location.href = href;
  };

  const handleCtaClick = () => {
    setMenuOpen(false);
    openConsultModal();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-navbar bg-surface-dark/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to={ROUTES.HOME}
            className="font-display text-xl font-bold text-text-inverse hover:text-brand-secondary transition-colors duration-hover"
          >
            {UI.nav.brand}
          </Link>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-8">
            {UI.nav.links.map(link => (
              <li key={link.href}>
                <a
                  href={isHome ? link.href : `/${link.href}`}
                  onClick={() => handleNavLinkClick(link.href)}
                  className="text-text-inverse/80 hover:text-brand-secondary transition-colors duration-hover text-sm font-medium"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4">
            <button
              onClick={handleCtaClick}
              className="hidden md:block btn-primary text-sm"
            >
              {UI.nav.cta}
            </button>

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(open => !open)}
              className="md:hidden text-text-inverse p-2"
              aria-label="Меню"
            >
              <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/10 py-4 animate-fade-up">
            <ul className="flex flex-col gap-4 mb-4">
              {UI.nav.links.map(link => (
                <li key={link.href}>
                  <a
                    href={isHome ? link.href : `/${link.href}`}
                    onClick={() => handleNavLinkClick(link.href)}
                    className="block text-text-inverse/80 hover:text-brand-secondary transition-colors duration-hover text-base font-medium"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <button onClick={handleCtaClick} className="btn-primary w-full text-center">
              {UI.nav.cta}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
