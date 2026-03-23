import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { UI } from '../../constants/ui';
import { useSeason } from '../../context/useSeason';
import { SEASON_ICON, SEASON_ORDER, SEASON_STYLE } from '../../constants/seasonNavbarAppearance';
import type { Season } from '../../types';
import { navigateSeasonFromNavbar } from '../../utils/navigateSeasonFromNavbar';

const SeasonNavDock = () => {
  const [expanded, setExpanded] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const [flashKey, setFlashKey] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { activeSeason } = useSeason();

  useEffect(() => {
    if (!expanded) return;

    const collapse = () => setExpanded(false);

    const onPointerDown = (event: PointerEvent) => {
      const node = rootRef.current;
      if (node && !node.contains(event.target as Node)) collapse();
    };

    const onScroll = () => collapse();
    const onWheel = () => collapse();
    const onTouchMove = () => collapse();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') collapse();
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [expanded]);

  const triggerFlash = () => {
    setFlashKey(k => k + 1);
    setFlashActive(true);
  };

  const handleSeasonPick = (season: Season) => {
    if (navigateSeasonFromNavbar(navigate, pathname, season)) {
      triggerFlash();
    }
    setExpanded(false);
  };

  const handleChipClick = () => {
    if (!expanded) {
      setExpanded(true);
      return;
    }
    if (navigateSeasonFromNavbar(navigate, pathname, activeSeason)) {
      triggerFlash();
    }
    setExpanded(false);
  };

  const handleArrowClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (expanded) {
      setExpanded(false);
    } else {
      setExpanded(true);
    }
  };

  const activeStyle = SEASON_STYLE[activeSeason];

  return (
    <div
      ref={rootRef}
      data-testid="season-nav-dock"
      className="hidden max-[499px]:block fixed top-16 left-0 right-0 z-season-dock min-h-season-dock border-b border-white/10 bg-surface-dark/95 backdrop-blur-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-season-dock flex-nowrap items-center justify-start gap-2 overflow-x-auto py-2 [scrollbar-width:thin]">
          <button
            type="button"
            onClick={handleChipClick}
            aria-expanded={expanded}
            aria-controls={expanded ? 'season-dock-panel' : undefined}
            aria-label={expanded ? UI.nav.seasonDockGoToList : UI.nav.seasonDockExpand}
            className="inline-flex shrink-0 items-center justify-center rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary"
          >
            <span
              className={[
                'relative flex items-center justify-center rounded-full overflow-hidden',
                'w-nav-season-circle-fluid h-nav-season-circle-fluid',
                'backdrop-blur-lg border',
                activeStyle.border,
                'bg-gradient-to-tr from-black/60 to-black/40 shadow-lg',
                activeStyle.activeShadow,
                activeStyle.activeRing,
                'scale-105',
              ].join(' ')}
            >
              <FontAwesomeIcon
                icon={SEASON_ICON[activeSeason]}
                className={[
                  'w-nav-season-icon-fluid h-nav-season-icon-fluid relative z-10',
                  activeStyle.iconColor,
                ].join(' ')}
              />
            </span>
          </button>

          <button
            type="button"
            onClick={handleArrowClick}
            aria-label={UI.nav.seasonDockToggleArrow}
            className={[
              'inline-flex shrink-0 items-center justify-center rounded-md p-2 text-text-inverse/50',
              'hover:text-text-inverse/80 transition-colors duration-hover',
              expanded ? 'rotate-180' : '',
              'transition-transform duration-hover',
            ].join(' ')}
          >
            <FontAwesomeIcon icon={faChevronRight} className="w-5 h-5" />
          </button>

          {expanded && (
            <div
              id="season-dock-panel"
              role="region"
              aria-label={UI.nav.seasonDockExpand}
              className="flex shrink-0 flex-row flex-nowrap items-center gap-2 border-l border-white/10 pl-2"
            >
              {SEASON_ORDER.map((seasonKey, idx) => {
                const season = UI.seasons[seasonKey];
                const isActive = activeSeason === seasonKey;
                const style = SEASON_STYLE[seasonKey];
                return (
                  <button
                    key={seasonKey}
                    type="button"
                    onClick={() => handleSeasonPick(seasonKey)}
                    aria-pressed={isActive}
                    aria-label={season.label}
                    style={{ animationDelay: `${idx * 55}ms` }}
                    className={[
                      'season-dock-panel-item group relative inline-flex shrink-0 flex-col items-center gap-2',
                      'opacity-0 animate-season-dock-in-x',
                      'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary focus-visible:rounded-lg',
                    ].join(' ')}
                  >
                    <div
                      className={[
                        'relative overflow-hidden flex items-center justify-center rounded-full',
                        'w-nav-season-circle-fluid h-nav-season-circle-fluid',
                        'backdrop-blur-lg border',
                        style.border,
                        'bg-gradient-to-tr from-black/60 to-black/40 shadow-lg',
                        style.hoverShadow,
                        'group-hover:shadow-2xl',
                        style.hoverBorder,
                        style.hoverFrom,
                        'group-hover:scale-110',
                        style.rotate,
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
                        className={[
                          'w-nav-season-icon-fluid h-nav-season-icon-fluid relative z-10 transition-colors duration-300',
                          style.iconColor,
                        ].join(' ')}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {flashActive &&
        createPortal(
          <div
            key={flashKey}
            className="fixed inset-0 pointer-events-none z-season-flash bg-surface-light/90 animate-season-flash"
            onAnimationEnd={() => setFlashActive(false)}
          />,
          document.body,
        )}
    </div>
  );
};

export default SeasonNavDock;
