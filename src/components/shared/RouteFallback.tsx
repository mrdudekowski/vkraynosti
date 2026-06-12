import { useLocation } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { getSeasonSeoEntry } from '../../constants/seo';
import { UI } from '../../constants/ui';
import type { Season } from '../../types';
import PageMeta from './PageMeta';
import TourCardSkeleton from '../tours/TourCardSkeleton';

const SEASON_ROUTE_META: Readonly<Record<string, { season: Season; path: string }>> = {
  [ROUTES.WINTER]: { season: 'winter', path: ROUTES.WINTER },
  [ROUTES.SPRING]: { season: 'spring', path: ROUTES.SPRING },
  [ROUTES.SUMMER]: { season: 'summer', path: ROUTES.SUMMER },
  [ROUTES.FALL]: { season: 'fall', path: ROUTES.FALL },
};

const SeasonToursRouteFallback = () => (
  <section
    className="min-h-route-fallback w-full"
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <span className="sr-only">{UI.tourCard.loadingLabel}</span>
    <div className="tour-card-skeleton-media h-72 w-full" aria-hidden />
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" aria-hidden>
      <div className="mb-8 flex gap-2">
        <span className="tour-card-skeleton-line-muted h-3 w-16" />
        <span className="tour-card-skeleton-line-muted h-3 w-24" />
      </div>
      <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <TourCardSkeleton key={`tour-route-skeleton-${index}`} />
        ))}
      </div>
    </div>
  </section>
);

/**
 * Плейсхолдер на время подгрузки ленивого чанка маршрута.
 * Высота согласована с `minHeight.route-fallback` в `tailwind.config.ts`.
 */
const RouteFallback = () => {
  const { pathname } = useLocation();
  const seasonRouteMeta = SEASON_ROUTE_META[pathname];

  if (seasonRouteMeta != null) {
    const seoEntry = getSeasonSeoEntry(seasonRouteMeta.season, seasonRouteMeta.path);
    return (
      <>
        <PageMeta
          title={seoEntry.title}
          description={seoEntry.description}
          path={seoEntry.path}
        />
        <SeasonToursRouteFallback />
      </>
    );
  }

  return (
    <div
      className="min-h-route-fallback w-full animate-pulse bg-surface-light/80"
      aria-hidden
    />
  );
};

export default RouteFallback;
