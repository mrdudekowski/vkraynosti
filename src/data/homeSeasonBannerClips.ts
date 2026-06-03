import { HOME_SEASON_BANNER_COLUMN_VIDEO_PLAY_SEC } from '../constants/homeSeasonBannerAnimation';
import {
  HOME_SEASON_BANNER_FALL_LOOP_VIDEO_POSTERS,
  HOME_SEASON_BANNER_FALL_LOOP_VIDEOS,
  HOME_SEASON_BANNER_SPRING_LOOP_VIDEO_POSTERS,
  HOME_SEASON_BANNER_SPRING_LOOP_VIDEOS,
  HOME_SEASON_BANNER_SUMMER_LOOP_VIDEO_POSTERS,
  HOME_SEASON_BANNER_SUMMER_LOOP_VIDEOS,
  HOME_SEASON_BANNER_WINTER_CLIP_SOURCE_START_SEC,
  HOME_SEASON_BANNER_WINTER_LOOP_VIDEO_POSTERS,
  HOME_SEASON_BANNER_WINTER_LOOP_VIDEOS,
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

const WINTER_BANNER_CLIP_INDICES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

/**
 * Зима: те же `*.grid.webm`, что в турах; сегмент задаётся `startSec` (см. `HOME_SEASON_BANNER_WINTER_CLIP_SOURCE_START_SEC` в `images.ts`).
 */
const WINTER_CLIPS: HomeSeasonBannerClip[] = WINTER_BANNER_CLIP_INDICES.map((i) => {
  const videoSrc = HOME_SEASON_BANNER_WINTER_LOOP_VIDEOS[i];
  return {
    videoSrc,
    posterSrc: HOME_SEASON_BANNER_WINTER_LOOP_VIDEO_POSTERS[videoSrc]!,
    startSec: HOME_SEASON_BANNER_WINTER_CLIP_SOURCE_START_SEC[i],
    durationSec: HOME_SEASON_BANNER_COLUMN_VIDEO_PLAY_SEC,
  };
});

const SPRING_BANNER_CLIP_INDICES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

/**
 * Весна: 10 клипов из spring `*.grid.webm` туров (spring-2/3/4), без повторов URL.
 */
const SPRING_CLIPS: HomeSeasonBannerClip[] = SPRING_BANNER_CLIP_INDICES.map((i) => {
  const videoSrc = HOME_SEASON_BANNER_SPRING_LOOP_VIDEOS[i];
  return {
    videoSrc,
    posterSrc: HOME_SEASON_BANNER_SPRING_LOOP_VIDEO_POSTERS[videoSrc]!,
    startSec: 0,
    durationSec: HOME_SEASON_BANNER_COLUMN_VIDEO_PLAY_SEC,
  };
});

const SUMMER_BANNER_CLIP_INDICES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

/** Лето: 10 клипов из summer `*.grid.webm` (summer-1/3/5/7/10/11), без повторов URL. */
const SUMMER_CLIPS: HomeSeasonBannerClip[] = SUMMER_BANNER_CLIP_INDICES.map((i) => {
  const videoSrc = HOME_SEASON_BANNER_SUMMER_LOOP_VIDEOS[i];
  return {
    videoSrc,
    posterSrc: HOME_SEASON_BANNER_SUMMER_LOOP_VIDEO_POSTERS[videoSrc]!,
    startSec: 0,
    durationSec: HOME_SEASON_BANNER_COLUMN_VIDEO_PLAY_SEC,
  };
});

const FALL_BANNER_CLIP_INDICES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

/** Осень: 10 клипов из fall `*.grid.webm` (fall-2/3/4), зеркало весеннего шортлиста. */
const FALL_CLIPS: HomeSeasonBannerClip[] = FALL_BANNER_CLIP_INDICES.map((i) => {
  const videoSrc = HOME_SEASON_BANNER_FALL_LOOP_VIDEOS[i];
  return {
    videoSrc,
    posterSrc: HOME_SEASON_BANNER_FALL_LOOP_VIDEO_POSTERS[videoSrc]!,
    startSec: 0,
    durationSec: HOME_SEASON_BANNER_COLUMN_VIDEO_PLAY_SEC,
  };
});

const CLIPS_BY_SEASON: Record<Season, HomeSeasonBannerClip[]> = {
  winter: WINTER_CLIPS,
  spring: SPRING_CLIPS,
  summer: SUMMER_CLIPS,
  fall: FALL_CLIPS,
};

export function getHomeSeasonBannerClips(season: Season): HomeSeasonBannerClip[] {
  const clips = CLIPS_BY_SEASON[season];
  if (import.meta.env.DEV && clips.length !== 10) {
    console.error('HomeSeasonBanner: expected 10 clip slots per season');
  }
  return clips;
}
