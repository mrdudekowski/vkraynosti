import { useEffect, useState } from 'react';
import { useLenis } from 'lenis/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { UI } from '../../constants/ui';
import {
  SEASON_ICON,
  SEASON_ORDER,
  SEASON_TEXT_CLASS,
} from '../../constants/seasonNavbarAppearance';
import { useSeasonNavMenu } from '../../context/useSeasonNavMenu';
import { useSeason } from '../../context/useSeason';
import type { Season } from '../../types';
import { scrollWindowToTopSmooth } from '../../constants/smoothScroll';

const SeasonNavDock = () => {
  const [reducedMotion, setReducedMotion] = useState(false);
  const lenis = useLenis();
  const { activeSeason, setActiveSeason } = useSeason();
  const { open, setOpen } = useSeasonNavMenu();

  const otherSeasons = SEASON_ORDER.filter(s => s !== activeSeason);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!open) return;

    const collapse = () => setOpen(false);

    const onPointerDown = (event: PointerEvent) => {
      const el = event.target as Element;
      if (el.closest('[data-season-nav-toggle]')) return;
      if (el.closest('[data-season-nav-panel]')) return;
      collapse();
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
  }, [open, setOpen]);

  useEffect(() => {
    if (open) return;
    const panel = document.getElementById('season-nav-dock-panel');
    const active = document.activeElement;
    if (panel?.contains(active) && active instanceof HTMLElement) {
      active.blur();
      document.querySelector<HTMLElement>('[data-season-nav-toggle]')?.focus();
    }
  }, [open]);

  const handleSeasonPick = (season: Season) => {
    setActiveSeason(season);
    scrollWindowToTopSmooth(lenis);
    setOpen(false);
  };

  const slideTransition = reducedMotion
    ? 'duration-0'
    : 'transition-[max-height,transform] duration-season-dock-slide ease-out';

  return (
    <div
      data-testid="season-nav-dock"
      data-expanded={open ? '' : undefined}
      className={[
        'block season-md:hidden fixed top-16 left-0 right-0 z-season-dock',
        'overflow-hidden will-change-transform',
        slideTransition,
        open
          ? 'max-h-season-dock-panel translate-y-0'
          : 'max-h-0 -translate-y-full pointer-events-none',
      ].join(' ')}
    >
      <div
        className={[
          'bg-surface-dark/95 backdrop-blur-sm border-b',
          open ? 'border-white/10' : 'border-transparent',
        ].join(' ')}
      >
        <div
          id="season-nav-dock-panel"
          data-season-nav-panel
          role="region"
          aria-label={UI.nav.seasonDockExpand}
          inert={!open}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap justify-center gap-6 sm:gap-8"
        >
          {otherSeasons.map(seasonKey => {
            const season = UI.seasons[seasonKey];
            const textClass = SEASON_TEXT_CLASS[seasonKey];
            return (
              <button
                key={seasonKey}
                type="button"
                onClick={() => handleSeasonPick(seasonKey)}
                aria-label={season.label}
                className={[
                  'flex flex-col items-center gap-1.5',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary focus-visible:rounded-lg',
                  'rounded-lg px-1 py-1',
                ].join(' ')}
              >
                <FontAwesomeIcon
                  icon={SEASON_ICON[seasonKey]}
                  className={['w-nav-season-icon-fluid h-nav-season-icon-fluid', textClass].join(' ')}
                />
                <span className={`text-xs font-heading font-normal ${textClass}`}>{season.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SeasonNavDock;
