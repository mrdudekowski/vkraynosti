import { describe, expect, it } from 'vitest';
import {
  getHomeSeasonBannerFallVideoPreloadLinks,
  getHomeSeasonBannerSpringVideoPreloadLinks,
  getHomeSeasonBannerSummerVideoPreloadLinks,
  getHomeSeasonBannerWinterVideoPreloadLinks,
  HOME_SEASON_BANNER_FALL_HEAD_PRELOAD_CLIP_COUNT,
  HOME_SEASON_BANNER_SPRING_HEAD_PRELOAD_CLIP_COUNT,
  HOME_SEASON_BANNER_SUMMER_HEAD_PRELOAD_CLIP_COUNT,
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

  it('limits summer preload links to strict budget', () => {
    const links = getHomeSeasonBannerSummerVideoPreloadLinks();
    expect(links.length).toBeLessThanOrEqual(HOME_SEASON_BANNER_SUMMER_HEAD_PRELOAD_CLIP_COUNT);
    expect(links.length).toBeLessThanOrEqual(1);
    expect(links.every(link => link.fetchPriority === 'low')).toBe(true);
  });

  it('limits fall preload links to strict budget', () => {
    const links = getHomeSeasonBannerFallVideoPreloadLinks();
    expect(links.length).toBeLessThanOrEqual(HOME_SEASON_BANNER_FALL_HEAD_PRELOAD_CLIP_COUNT);
    expect(links.length).toBeLessThanOrEqual(1);
    expect(links.every(link => link.fetchPriority === 'low')).toBe(true);
  });
});
