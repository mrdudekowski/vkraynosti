import { describe, expect, it } from 'vitest';
import {
  getHomeSeasonBannerSpringVideoPreloadLinks,
  getHomeSeasonBannerWinterVideoPreloadLinks,
  HOME_SEASON_BANNER_SPRING_HEAD_PRELOAD_CLIP_COUNT,
  HOME_SEASON_BANNER_WINTER_HEAD_PRELOAD_CLIP_COUNT,
} from './homeSeasonBannerVideoPreload';

describe('homeSeasonBannerVideoPreload invariants', () => {
  it('limits winter preload links to strict budget', () => {
    const links = getHomeSeasonBannerWinterVideoPreloadLinks();
    expect(links.length).toBeLessThanOrEqual(HOME_SEASON_BANNER_WINTER_HEAD_PRELOAD_CLIP_COUNT);
    expect(links.length).toBeLessThanOrEqual(1);
    expect(links.every(link => link.fetchPriority === 'low')).toBe(true);
  });

  it('limits spring preload links to strict budget', () => {
    const links = getHomeSeasonBannerSpringVideoPreloadLinks();
    expect(links.length).toBeLessThanOrEqual(HOME_SEASON_BANNER_SPRING_HEAD_PRELOAD_CLIP_COUNT);
    expect(links.length).toBeLessThanOrEqual(1);
    expect(links.every(link => link.fetchPriority === 'low')).toBe(true);
  });
});
