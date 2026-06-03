import { describe, expect, it } from 'vitest';
import {
  HOME_SEASON_BANNER_FALL_LOOP_VIDEOS,
  HOME_SEASON_BANNER_SPRING_LOOP_VIDEOS,
  HOME_SEASON_BANNER_SUMMER_LOOP_VIDEOS,
  HOME_SEASON_BANNER_WINTER_LOOP_VIDEOS,
} from '../constants/images';
import { getHomeSeasonBannerClips } from './homeSeasonBannerClips';

function expectUniqueVideoUrls(label: string, urls: readonly string[]): void {
  expect(urls, `${label}: expected 10 slots`).toHaveLength(10);
  expect(new Set(urls).size, `${label}: duplicate videoSrc`).toBe(10);
}

describe('homeSeasonBannerClips', () => {
  it('summer: 10 unique video URLs in SSOT and clips', () => {
    expectUniqueVideoUrls('HOME_SEASON_BANNER_SUMMER_LOOP_VIDEOS', HOME_SEASON_BANNER_SUMMER_LOOP_VIDEOS);
    const clips = getHomeSeasonBannerClips('summer');
    expectUniqueVideoUrls(
      'getHomeSeasonBannerClips(summer)',
      clips.map((c) => c.videoSrc).filter((src): src is string => Boolean(src))
    );
    clips.forEach((clip, i) => {
      expect(clip.videoSrc).toBe(HOME_SEASON_BANNER_SUMMER_LOOP_VIDEOS[i]);
    });
  });

  it('fall: 10 unique video URLs in SSOT and clips', () => {
    expectUniqueVideoUrls('HOME_SEASON_BANNER_FALL_LOOP_VIDEOS', HOME_SEASON_BANNER_FALL_LOOP_VIDEOS);
    const clips = getHomeSeasonBannerClips('fall');
    expectUniqueVideoUrls(
      'getHomeSeasonBannerClips(fall)',
      clips.map((c) => c.videoSrc).filter((src): src is string => Boolean(src))
    );
    clips.forEach((clip, i) => {
      expect(clip.videoSrc).toBe(HOME_SEASON_BANNER_FALL_LOOP_VIDEOS[i]);
    });
  });

  it('winter and spring: 10 unique video URLs (regression)', () => {
    expectUniqueVideoUrls('HOME_SEASON_BANNER_WINTER_LOOP_VIDEOS', HOME_SEASON_BANNER_WINTER_LOOP_VIDEOS);
    expectUniqueVideoUrls('HOME_SEASON_BANNER_SPRING_LOOP_VIDEOS', HOME_SEASON_BANNER_SPRING_LOOP_VIDEOS);
  });
});
