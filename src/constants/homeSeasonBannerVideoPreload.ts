import {
  HOME_SEASON_BANNER_SPRING_LOOP_VIDEOS,
  HOME_SEASON_BANNER_WINTER_LOOP_VIDEOS,
} from './images';

/**
 * Сколько лупов отдаём в `<head>` как `rel="preload" as="video"`.
 * Десять параллельных preloads перегружают лимит соединений к origin (~6) — очередь и 5–8 с до первого кадра.
 * Остальные колонки подтягиваются при hover из HTTP-кэша после первого запроса.
 */
export const HOME_SEASON_BANNER_WINTER_HEAD_PRELOAD_CLIP_COUNT = 3 as const;

export interface HomeSeasonBannerWinterVideoPreloadLink {
  href: string;
  fetchPriority: 'high' | 'low';
}

/**
 * Только первые N лупов (левые колонки вордмарка), все с `fetchPriority="high"`.
 */
export function getHomeSeasonBannerWinterVideoPreloadLinks(): readonly HomeSeasonBannerWinterVideoPreloadLink[] {
  return HOME_SEASON_BANNER_WINTER_LOOP_VIDEOS.slice(0, HOME_SEASON_BANNER_WINTER_HEAD_PRELOAD_CLIP_COUNT).map(
    (href) => ({ href, fetchPriority: 'high' as const })
  );
}

export function getHomeSeasonBannerSpringVideoPreloadLinks(): readonly HomeSeasonBannerWinterVideoPreloadLink[] {
  return HOME_SEASON_BANNER_SPRING_LOOP_VIDEOS.slice(0, HOME_SEASON_BANNER_WINTER_HEAD_PRELOAD_CLIP_COUNT).map(
    (href) => ({ href, fetchPriority: 'high' as const })
  );
}
