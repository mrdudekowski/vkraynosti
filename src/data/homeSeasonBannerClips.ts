import { HOME_SEASON_BANNER_COLUMN_VIDEO_PLAY_SEC } from '../constants/homeSeasonBannerAnimation';
import {
  HOME_SEASON_BANNER_WINTER_LOOP_VIDEO_POSTERS,
  HOME_SEASON_BANNER_WINTER_LOOP_VIDEOS,
  IMAGES,
} from '../constants/images';
import type { Season } from '../types';

/**
 * Один слот баннера (колонка 0…9 ↔ буква `UI.homeSeasonBannerWordmark`).
 * Без `videoSrc` — только постер/заглушка-картинка.
 */
export interface HomeSeasonBannerClip {
  posterSrc: string;
  videoSrc?: string;
  /** Секунда начала зацикленного фрагмента в исходнике. */
  startSec: number;
  /**
   * Длина зацикливаемого фрагмента — с запасом относительно удержания полоски и crossfade
   * (`homeSeasonBannerAnimation.ts`), чтобы loop не щёлкал во время показа колонки.
   */
  durationSec: number;
}

const posterClip = (posterSrc: string): HomeSeasonBannerClip => ({
  posterSrc,
  startSec: 0,
  durationSec: 0,
});

const WINTER_BANNER_CLIP_INDICES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

/**
 * Зима: десять `*.banner-loop.mp4` в `public/banners_winter/` (нарезка из `public/tours/.../*.grid.mp4` — `npm run generate:banner-loops`).
 * В рантайме фрагмент с начала файла (`startSec: 0`).
 */
const WINTER_CLIPS: HomeSeasonBannerClip[] = WINTER_BANNER_CLIP_INDICES.map((i) => {
  const videoSrc = HOME_SEASON_BANNER_WINTER_LOOP_VIDEOS[i];
  return {
    videoSrc,
    posterSrc: HOME_SEASON_BANNER_WINTER_LOOP_VIDEO_POSTERS[videoSrc]!,
    startSec: 0,
    durationSec: HOME_SEASON_BANNER_COLUMN_VIDEO_PLAY_SEC,
  };
});

const CLIPS_BY_SEASON: Record<Season, HomeSeasonBannerClip[]> = {
  winter: WINTER_CLIPS,
  spring: Array.from({ length: 10 }, () => posterClip(IMAGES.seasonSection.spring)),
  summer: Array.from({ length: 10 }, () => posterClip(IMAGES.seasonSection.summer)),
  fall: Array.from({ length: 10 }, () => posterClip(IMAGES.seasonSection.fall)),
};

export function getHomeSeasonBannerClips(season: Season): HomeSeasonBannerClip[] {
  const clips = CLIPS_BY_SEASON[season];
  if (import.meta.env.DEV && clips.length !== 10) {
    console.error('HomeSeasonBanner: expected 10 clip slots per season');
  }
  return clips;
}
