import { useState } from 'react';
import type { MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSnowflake, faSeedling, faSun, faLeaf } from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';
import { NAV_STATE_SKIP_SCROLL_TO_TOP } from '../../constants/navigation';
import { ROUTES, SEASON_TO_LIST_ROUTE } from '../../constants/routes';
import { UI } from '../../constants/ui';
import type { Season } from '../../types';
import { useSeason } from '../../context/useSeason';

// TODO: Replace these placeholder FA icons with more expressive season SVGs or
//       a custom icon set that better captures the mood of each season.
//       Candidates: custom snowflake paths, botanical illustrations, hand-drawn sun, etc.
const SEASON_ICON: Record<Season, IconDefinition> = {
  winter: faSnowflake,
  spring: faSeedling,
  summer: faSun,
  fall:   faLeaf,
};

// Static Tailwind class maps — must be full strings so JIT can detect them.
// Circle effects use group-hover:* because the button element is a transparent
// column wrapper; hover state propagates down from the group parent.
const SEASON_STYLE: Record<Season, {
  border:          string;
  hoverShadow:     string;
  activeShadow:    string;
  hoverBorder:     string;
  hoverFrom:       string;
  shimmer:         string;
  iconColor:       string;
  activeRing:      string;
  rotate:          string;
  hoverUnderline:  string;
  activeUnderline: string;
}> = {
  winter: {
    border:          'border-season-winter/20',
    hoverShadow:     'group-hover:shadow-season-winter/30',
    activeShadow:    'shadow-season-winter/40',
    hoverBorder:     'group-hover:border-season-winter/50',
    hoverFrom:       'group-hover:from-season-winter/10',
    shimmer:         'via-season-winter/20',
    iconColor:       'text-season-winter',
    activeRing:      'ring-2 ring-season-winter/50',
    rotate:          'group-hover:rotate-3',
    hoverUnderline:  'group-hover:border-season-winter',
    activeUnderline: 'border-season-winter',
  },
  spring: {
    border:          'border-season-spring/20',
    hoverShadow:     'group-hover:shadow-season-spring/30',
    activeShadow:    'shadow-season-spring/40',
    hoverBorder:     'group-hover:border-season-spring/50',
    hoverFrom:       'group-hover:from-season-spring/10',
    shimmer:         'via-season-spring/20',
    iconColor:       'text-season-spring',
    activeRing:      'ring-2 ring-season-spring/50',
    rotate:          'group-hover:rotate-2',
    hoverUnderline:  'group-hover:border-season-spring',
    activeUnderline: 'border-season-spring',
  },
  summer: {
    border:          'border-season-summer/20',
    hoverShadow:     'group-hover:shadow-season-summer/30',
    activeShadow:    'shadow-season-summer/40',
    hoverBorder:     'group-hover:border-season-summer/50',
    hoverFrom:       'group-hover:from-season-summer/10',
    shimmer:         'via-season-summer/20',
    iconColor:       'text-season-summer',
    activeRing:      'ring-2 ring-season-summer/50',
    rotate:          'group-hover:-rotate-2',
    hoverUnderline:  'group-hover:border-season-summer',
    activeUnderline: 'border-season-summer',
  },
  fall: {
    border:          'border-season-fall/20',
    hoverShadow:     'group-hover:shadow-season-fall/30',
    activeShadow:    'shadow-season-fall/40',
    hoverBorder:     'group-hover:border-season-fall/50',
    hoverFrom:       'group-hover:from-season-fall/10',
    shimmer:         'via-season-fall/20',
    iconColor:       'text-season-fall',
    activeRing:      'ring-2 ring-season-fall/50',
    rotate:          'group-hover:rotate-2',
    hoverUnderline:  'group-hover:border-season-fall',
    activeUnderline: 'border-season-fall',
  },
};

const SEASON_ORDER: Season[] = ['winter', 'spring', 'summer', 'fall'];

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
      const listPath = SEASON_TO_LIST_ROUTE[season];
      if (pathname === listPath) return;
      const detailMatch = matchPath(ROUTES.TOUR_DETAIL, pathname);
      if (detailMatch?.params.season === season) return;
      navigate(listPath, { state: NAV_STATE_SKIP_SCROLL_TO_TOP });
      setFlashKey(k => k + 1);
      setFlashActive(true);
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
          ? 'w-9 h-9'
          : 'w-9 h-9 xs:w-10 xs:h-10 phone:w-11 phone:h-11 phone-lg:w-12 phone-lg:h-12';
        const iconSize = isNavbar
          ? 'w-4 h-4'
          : 'w-3.5 h-3.5 xs:w-4 xs:h-4 phone-lg:w-5 phone-lg:h-5';

        return (
          // Transparent column wrapper — carries the `group` so child elements
          // can use group-hover:* for coordinated hover effects.
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
            {/* Glassmorphism circle */}
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
              {/* Shimmer sweep on hover */}
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

