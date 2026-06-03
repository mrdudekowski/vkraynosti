import {
  HOME_SEASON_BANNER_FALL_LOOP_VIDEOS,
  HOME_SEASON_BANNER_SPRING_LOOP_VIDEOS,
  HOME_SEASON_BANNER_SUMMER_LOOP_VIDEOS,
  HOME_SEASON_BANNER_WINTER_LOOP_VIDEOS,
} from './images';

/**
 * Сколько лупов отдаём в `<head>` как `rel="preload" as="video"`.
 *
 * Много одновременных preloads конкурируют за полосу и приоритетную очередь браузера (и с LCP-ресурсами),
 * а не только за «число TCP-соединений»: на HTTP/2 и HTTP/3 запросы часто мультиплексируются, узкое место
 * всё равно остаётся. Держим N небольшим.
 *
 * Колонки баннера — разные URL (`HOME_SEASON_BANNER_*_LOOP_VIDEOS`); preload касается только
 * первых N файлов. Остальные клипы при hover идут отдельными запросами; кэш HTTP помогает только если URL
 * уже был загружен. Повторное использование соединения к origin ≠ кэш сущности.
 * Video preload вторичен относительно LCP image, поэтому его priority всегда low.
 */
export const HOME_SEASON_BANNER_WINTER_HEAD_PRELOAD_CLIP_COUNT = 1 as const;
export const HOME_SEASON_BANNER_SPRING_HEAD_PRELOAD_CLIP_COUNT = 1 as const;
export const HOME_SEASON_BANNER_SUMMER_HEAD_PRELOAD_CLIP_COUNT = 1 as const;
export const HOME_SEASON_BANNER_FALL_HEAD_PRELOAD_CLIP_COUNT = 1 as const;

export interface HomeSeasonBannerVideoPreloadLink {
  href: string;
  fetchPriority: 'high' | 'low';
}

/**
 * Только первые N лупов (левые колонки вордмарка), все с `fetchPriority="low"`.
 */
export function getHomeSeasonBannerWinterVideoPreloadLinks(): readonly HomeSeasonBannerVideoPreloadLink[] {
  return HOME_SEASON_BANNER_WINTER_LOOP_VIDEOS.slice(0, HOME_SEASON_BANNER_WINTER_HEAD_PRELOAD_CLIP_COUNT).map(
    (href) => ({ href, fetchPriority: 'low' as const })
  );
}

export function getHomeSeasonBannerSpringVideoPreloadLinks(): readonly HomeSeasonBannerVideoPreloadLink[] {
  return HOME_SEASON_BANNER_SPRING_LOOP_VIDEOS.slice(0, HOME_SEASON_BANNER_SPRING_HEAD_PRELOAD_CLIP_COUNT).map(
    (href) => ({ href, fetchPriority: 'low' as const })
  );
}

export function getHomeSeasonBannerSummerVideoPreloadLinks(): readonly HomeSeasonBannerVideoPreloadLink[] {
  return HOME_SEASON_BANNER_SUMMER_LOOP_VIDEOS.slice(0, HOME_SEASON_BANNER_SUMMER_HEAD_PRELOAD_CLIP_COUNT).map(
    (href) => ({ href, fetchPriority: 'low' as const })
  );
}

export function getHomeSeasonBannerFallVideoPreloadLinks(): readonly HomeSeasonBannerVideoPreloadLink[] {
  return HOME_SEASON_BANNER_FALL_LOOP_VIDEOS.slice(0, HOME_SEASON_BANNER_FALL_HEAD_PRELOAD_CLIP_COUNT).map(
    (href) => ({ href, fetchPriority: 'low' as const })
  );
}
