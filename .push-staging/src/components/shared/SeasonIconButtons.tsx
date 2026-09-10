import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { UI } from '../../constants/ui';
import { SEASON_ICON, SEASON_ORDER, SEASON_STYLE } from '../../constants/seasonNavbarAppearance';
import type { Season } from '../../types';

type SeasonIconButtonsVariant = 'navbar' | 'section';

export interface SeasonIconButtonsProps {
  activeSeason: Season;
  onSeasonChange: (season: Season) => void;
  variant?: SeasonIconButtonsVariant;
  /** Одна строка иконок (Mini App); по умолчанию — сетка 2×2 на узких экранах как на главной. */
  rowLayout?: boolean;
  className?: string;
}

const SeasonIconButtons = ({
  activeSeason,
  onSeasonChange,
  variant = 'section',
  rowLayout = false,
  className,
}: SeasonIconButtonsProps) => {
  const isNavbar = variant === 'navbar';

  const containerClass = isNavbar
    ? 'inline-flex items-end gap-2'
    : rowLayout
      ? 'inline-flex items-end justify-center gap-3 phone:gap-4'
      : 'inline-grid grid-cols-2 gap-3 xs:inline-flex xs:items-end xs:gap-3 phone:gap-4 phone-lg:gap-5';

  return (
    <div className={[containerClass, className ?? ''].join(' ')}>
      {SEASON_ORDER.map(seasonKey => {
        const season = UI.seasons[seasonKey];
        const isActive = activeSeason === seasonKey;
        const style = SEASON_STYLE[seasonKey];

        const circleSize = isNavbar
          ? 'w-nav-season-circle-fixed h-nav-season-circle-fixed'
          : rowLayout
            ? 'w-7 h-7 xs:w-8 xs:h-8 phone:w-9 phone:h-9 phone-lg:w-10 phone-lg:h-10'
            : 'w-9 h-9 xs:w-10 xs:h-10 phone:w-11 phone:h-11 phone-lg:w-12 phone-lg:h-12';
        const iconSize = isNavbar
          ? 'w-nav-season-icon-fixed h-nav-season-icon-fixed'
          : rowLayout
            ? 'w-2.5 h-2.5 xs:w-3 xs:h-3 phone-lg:w-4 phone-lg:h-4'
            : 'w-3.5 h-3.5 xs:w-4 xs:h-4 phone-lg:w-5 phone-lg:h-5';

        const sectionGradientClasses = rowLayout
          ? isActive
            ? 'from-surface-dark to-surface-dark'
            : 'from-home-season-strip-btn-from to-home-season-strip-btn-to group-hover:from-surface-dark group-hover:to-surface-dark'
          : 'from-home-season-strip-btn-from to-home-season-strip-btn-to group-hover:from-surface-dark group-hover:to-surface-dark';

        const sectionActiveClasses = rowLayout
          ? 'scale-105'
          : `shadow-xl ${style.activeShadow} scale-105 ${style.activeRing}`;

        const sectionCircleClasses = [
          'relative overflow-hidden flex items-center justify-center',
          'rounded-full',
          circleSize,
          'backdrop-blur-lg border',
          style.border,
          'bg-gradient-to-tr',
          sectionGradientClasses,
          'shadow-lg',
          style.hoverBorder,
          'group-hover:scale-105',
          ...(isActive ? [] : [style.sectionHoverGlow]),
          style.rotate,
          'group-active:scale-95 group-active:rotate-0',
          'transition-all duration-300 ease-out',
          isActive ? sectionActiveClasses : 'opacity-70 group-hover:opacity-100',
        ].join(' ');

        const navbarCircleClasses = [
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
        ].join(' ');

        return (
          <button
            key={seasonKey}
            type="button"
            onClick={() => onSeasonChange(seasonKey)}
            aria-pressed={isActive}
            aria-label={season.label}
            className={[
              'group relative inline-flex flex-col items-center gap-2',
              'cursor-pointer',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary focus-visible:rounded-lg',
              'transition-all duration-300 ease-out',
            ].join(' ')}
          >
            <div className={isNavbar ? navbarCircleClasses : sectionCircleClasses}>
              {isNavbar ? (
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
              ) : null}

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

export default SeasonIconButtons;
