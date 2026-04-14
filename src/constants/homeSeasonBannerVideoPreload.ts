import { HOME_SEASON_BANNER_WINTER_LOOP_VIDEOS } from './images';

/**
 * Сколько первых лупов в очереди `<link rel="preload" as="video">` получают `fetchPriority="high"`.
 * Остальные — `low`, чтобы не конкурировать друг с другом и с первым кадром hero.
 */
export const HOME_SEASON_BANNER_WINTER_VIDEO_PRELOAD_HIGH_PRIORITY_COUNT = 4 as const;

export interface HomeSeasonBannerWinterVideoPreloadLink {
  href: string;
  fetchPriority: 'high' | 'low';
}

/**
 * Порядок совпадает с колонками 0…9 баннера (`HOME_SEASON_BANNER_WINTER_LOOP_VIDEOS`).
 */
export function getHomeSeasonBannerWinterVideoPreloadLinks(): readonly HomeSeasonBannerWinterVideoPreloadLink[] {
  return HOME_SEASON_BANNER_WINTER_LOOP_VIDEOS.map((href, i) => ({
    href,
    fetchPriority:
      i < HOME_SEASON_BANNER_WINTER_VIDEO_PRELOAD_HIGH_PRIORITY_COUNT ? ('high' as const) : ('low' as const),
  }));
}
