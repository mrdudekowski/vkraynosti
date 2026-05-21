import {
  TOUR_SPRING_10_GRID_VIDEO_POSTERS,
  TOUR_SPRING_10_GRID_VIDEO_POSTERS_MOBILE,
  TOUR_SPRING_11_GRID_VIDEO_POSTERS,
  TOUR_SPRING_13_GRID_VIDEO_POSTERS,
  TOUR_SUMMER_1_GRID_VIDEO_POSTERS,
  TOUR_SUMMER_7_GRID_VIDEO_POSTERS,
  TOUR_SPRING_2_GRID_VIDEO_POSTERS,
  TOUR_SPRING_3_GRID_VIDEO_POSTERS,
  TOUR_SPRING_4_GRID_VIDEO_POSTERS,
  TOUR_SPRING_5_GRID_VIDEO_POSTERS,
  TOUR_SPRING_6_GRID_VIDEO_POSTERS,
  TOUR_SPRING_6_GRID_VIDEO_POSTERS_MOBILE,
  TOUR_SPRING_7_GRID_VIDEO_POSTERS,
  TOUR_SPRING_8_GRID_VIDEO_POSTERS,
  TOUR_SPRING_9_GRID_VIDEO_POSTERS,
  TOUR_SPRING_9_GRID_VIDEO_POSTERS_MOBILE,
  TOUR_WINTER_3_GRID_VIDEO_POSTERS,
  TOUR_WINTER_4_GRID_VIDEO_POSTERS,
  TOUR_WINTER_4_GRID_VIDEO_POSTERS_MOBILE,
  TOUR_WINTER_5_GRID_VIDEO_POSTERS,
} from './images';
import { FALL_TOUR_MEDIA_BY_ID } from './generated/fallTourMedia.generated';
import { SUMMER_PAIRED_TOUR_MEDIA_BY_ID } from './generated/summerPairedTourMedia.generated';
import type { TourMediaBundle } from './generated/fallTourMedia.generated';
import {
  tourGridVideoPosterStrategyFromBundle,
  type TourGridVideoPosterStrategy,
} from './tourGridVideoPosterStrategyFromBundle';

const SPRING_WINTER_SUMMER_UNIQUE_STRATEGIES: Record<string, TourGridVideoPosterStrategy> = {
  'winter-3': { mode: 'fixed', posters: TOUR_WINTER_3_GRID_VIDEO_POSTERS },
  'winter-4': {
    mode: 'breakpoint',
    desktop: TOUR_WINTER_4_GRID_VIDEO_POSTERS,
    mobile: TOUR_WINTER_4_GRID_VIDEO_POSTERS_MOBILE,
  },
  'winter-5': { mode: 'fixed', posters: TOUR_WINTER_5_GRID_VIDEO_POSTERS },
  'spring-2': { mode: 'fixed', posters: TOUR_SPRING_2_GRID_VIDEO_POSTERS },
  'spring-3': { mode: 'fixed', posters: TOUR_SPRING_3_GRID_VIDEO_POSTERS },
  'spring-4': { mode: 'fixed', posters: TOUR_SPRING_4_GRID_VIDEO_POSTERS },
  'spring-5': { mode: 'fixed', posters: TOUR_SPRING_5_GRID_VIDEO_POSTERS },
  'spring-6': {
    mode: 'breakpoint',
    desktop: TOUR_SPRING_6_GRID_VIDEO_POSTERS,
    mobile: TOUR_SPRING_6_GRID_VIDEO_POSTERS_MOBILE,
  },
  'spring-7': { mode: 'fixed', posters: TOUR_SPRING_7_GRID_VIDEO_POSTERS },
  'spring-8': { mode: 'fixed', posters: TOUR_SPRING_8_GRID_VIDEO_POSTERS },
  'spring-9': {
    mode: 'breakpoint',
    desktop: TOUR_SPRING_9_GRID_VIDEO_POSTERS,
    mobile: TOUR_SPRING_9_GRID_VIDEO_POSTERS_MOBILE,
  },
  'spring-10': {
    mode: 'breakpoint',
    desktop: TOUR_SPRING_10_GRID_VIDEO_POSTERS,
    mobile: TOUR_SPRING_10_GRID_VIDEO_POSTERS_MOBILE,
  },
  'spring-11': { mode: 'fixed', posters: TOUR_SPRING_11_GRID_VIDEO_POSTERS },
  'spring-13': { mode: 'fixed', posters: TOUR_SPRING_13_GRID_VIDEO_POSTERS },
  'summer-1': { mode: 'fixed', posters: TOUR_SUMMER_1_GRID_VIDEO_POSTERS },
  'summer-7': { mode: 'fixed', posters: TOUR_SUMMER_7_GRID_VIDEO_POSTERS },
};

function strategiesFromMediaBundles(
  bundles: Record<string, TourMediaBundle>
): Record<string, TourGridVideoPosterStrategy> {
  const out: Record<string, TourGridVideoPosterStrategy> = {};
  for (const [tourId, bundle] of Object.entries(bundles)) {
    const strategy = tourGridVideoPosterStrategyFromBundle(bundle);
    if (strategy != null) {
      out[tourId] = strategy;
    }
  }
  return out;
}

/** Ключ — `tour.id` (медиа не алиасятся на spring). */
const TOUR_GRID_VIDEO_POSTER_STRATEGY_BY_ID: Record<string, TourGridVideoPosterStrategy> = {
  ...SPRING_WINTER_SUMMER_UNIQUE_STRATEGIES,
  ...strategiesFromMediaBundles(FALL_TOUR_MEDIA_BY_ID),
  ...strategiesFromMediaBundles(SUMMER_PAIRED_TOUR_MEDIA_BY_ID),
};

export function resolveTourGridVideoPoster(
  tourId: string,
  gridSrc: string,
  isLgOrAbove: boolean
): string | undefined {
  const strategy = TOUR_GRID_VIDEO_POSTER_STRATEGY_BY_ID[tourId];
  if (strategy == null) return undefined;
  if (strategy.mode === 'fixed') {
    return strategy.posters[gridSrc];
  }
  return isLgOrAbove ? strategy.desktop[gridSrc] : strategy.mobile[gridSrc];
}

/** Колбэк для `TourDetailGallery`: `undefined`, если у тура нет постеров для сетки. */
export function getTourGridVideoPosterGetter(
  tourId: string,
  isLgOrAbove: boolean
): ((gridSrc: string) => string | undefined) | undefined {
  if (!(tourId in TOUR_GRID_VIDEO_POSTER_STRATEGY_BY_ID)) return undefined;
  return (gridSrc) => resolveTourGridVideoPoster(tourId, gridSrc, isLgOrAbove);
}
