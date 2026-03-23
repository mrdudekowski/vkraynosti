import { useState } from 'react';
import type { MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useLocation, useNavigate } from 'react-router-dom';
import { UI } from '../../constants/ui';
import { SEASON_ICON, SEASON_ORDER, SEASON_STYLE } from '../../constants/seasonNavbarAppearance';
import type { Season } from '../../types';
import { useSeason } from '../../context/useSeason';
import { navigateSeasonFromNavbar } from '../../utils/navigateSeasonFromNavbar';

type SeasonSwitcherVariant = 'navbar' | 'section';

interface SeasonSwitcherProps {
  variant?: SeasonSwitcherVariant;
  className?: string;
}

const SeasonSwitcher = ({ variant = 'section', className }: SeasonSwitcherProps) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { activeSeason, setActiveSeason } = useSeason();
  const [flashActive, setFlashActive] = useState(false);
  const [flashKey, setFlashKey] = useState(0);

  const handleClick = (event: MouseEvent<HTMLButtonElement>, season: Season) => {
    event.preventDefault();
    if (variant === 'navbar') {
      if (navigateSeasonFromNavbar(navigate, pathname, season)) {
        setFlashKey(k => k + 1);
        setFlashActive(true);
      }
      return;
    }
    if (season === activeSeason) return;
    setActiveSeason(season);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isNavbar = variant === 'navbar';

  return (
    <div
      className={[
        isNavbar
          ? 'inline-flex items-end gap-2'
          : 'inline-grid grid-cols-2 gap-3 xs:inline-flex xs:items-end xs:gap-3 phone:gap-4 phone-lg:gap-5',
        className ?? '',
      ].join(' ')}
    >
      {flashActive && createPortal(
        <div
          key={flashKey}
          className="fixed inset-0 pointer-events-none z-season-flash bg-surface-light/90 animate-season-flash"
          onAnimationEnd={() => setFlashActive(false)}
        />,
        document.body
      )}
      {SEASON_ORDER.map(seasonKey => {
        const season = UI.seasons[seasonKey];
        const isActive = activeSeason === seasonKey;
        const style = SEASON_STYLE[seasonKey];

        const circleSize = isNavbar
          ? 'w-nav-season-circle-fixed h-nav-season-circle-fixed'
          : 'w-9 h-9 xs:w-10 xs:h-10 phone:w-11 phone:h-11 phone-lg:w-12 phone-lg:h-12';
        const iconSize = isNavbar
          ? 'w-nav-season-icon-fixed h-nav-season-icon-fixed'
          : 'w-3.5 h-3.5 xs:w-4 xs:h-4 phone-lg:w-5 phone-lg:h-5';

        return (
          <button
            key={seasonKey}
            type="button"
            onClick={event => handleClick(event, seasonKey)}
            aria-pressed={isActive}
            aria-label={season.label}
            className={[
              'group relative inline-flex flex-col items-center gap-2',
              'cursor-pointer',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary focus-visible:rounded-lg',
              'transition-all duration-300 ease-out',
            ].join(' ')}
          >
            <div
              className={[
                'relative overflow-hidden flex items-center justify-center',
                'rounded-full',
                circleSize,
                'backdrop-blur-lg border',
                style.border,
                'bg-gradient-to-tr from-black/60 to-black/40',
                'shadow-lg',
                style.hoverShadow,
                'group-hover:shadow-2xl',
                style.hoverBorder,
                style.hoverFrom,
                'group-hover:scale-110',
                style.rotate,
                'group-active:scale-95 group-active:rotate-0',
                'transition-all duration-300 ease-out',
                isActive
                  ? `shadow-xl ${style.activeShadow} scale-105 ${style.activeRing}`
                  : 'opacity-70 group-hover:opacity-100',
              ].join(' ')}
            >
              <div
                className={[
                  'absolute inset-0 pointer-events-none',
                  'bg-gradient-to-r from-transparent',
                  style.shimmer,
                  'to-transparent',
                  '-translate-x-full group-hover:translate-x-full',
                  'transition-transform duration-700 ease-out',
                ].join(' ')}
              />

              <FontAwesomeIcon
                icon={SEASON_ICON[seasonKey]}
                className={[iconSize, style.iconColor, 'relative z-10 transition-colors duration-300'].join(' ')}
              />
            </div>

            <span
              role="tooltip"
              className={[
                'pointer-events-none absolute left-1/2 top-full z-tooltip -translate-x-1/2 mt-tooltip-gap',
                'px-tooltip-x py-tooltip-y rounded-tooltip bg-surface-dark text-text-inverse font-body text-tooltip',
                'whitespace-nowrap shadow-lg',
                'invisible translate-y-1 opacity-0',
                'transition-all duration-hover ease-out',
                'hidden md:block',
                'md:group-hover:visible md:group-hover:translate-y-0 md:group-hover:opacity-100',
                'md:group-focus-visible:visible md:group-focus-visible:translate-y-0 md:group-focus-visible:opacity-100',
              ].join(' ')}
            >
              {season.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default SeasonSwitcher;
