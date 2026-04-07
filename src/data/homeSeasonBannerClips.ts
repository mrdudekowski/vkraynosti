import {
  IMAGES,
  TOUR_WINTER_3_GALLERY_GRID,
  TOUR_WINTER_3_GRID_VIDEO_POSTERS,
  TOUR_WINTER_4_GALLERY_GRID,
  TOUR_WINTER_4_GRID_VIDEO_POSTERS,
  TOUR_WINTER_5_GALLERY_GRID,
  TOUR_WINTER_5_GRID_VIDEO_POSTERS,
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

/** Длина сегмента для loop на время показа полоски (см. `HOME_SEASON_BANNER_MEDIA_VISIBLE_MS`). */
const WINTER_LOOP_SEGMENT_SEC = 2.4 as const;

/**
 * Зима: десять `*.grid.mp4` (в т.ч. gr.board / gr.elya / gr.bbq для «с», «т», «и»).
 * Старт отрезка в секундах (перепроверено по контенту):
 * `gr.clip1.grid` 3, `gr.clip3.grid` 0, `gr.clip4.grid` 16, `gr.clip5.grid` 1,
 * `hs.clip1.grid` 5, `ars.clip1.grid` 2, `ars.clip2.grid` 7.
 */
const WINTER_CLIPS: HomeSeasonBannerClip[] = [
  // 0 «В» — winter-3/gr.clip1.grid.mp4 @ 0:03
  {
    videoSrc: TOUR_WINTER_3_GALLERY_GRID[3],
    posterSrc: TOUR_WINTER_3_GRID_VIDEO_POSTERS[TOUR_WINTER_3_GALLERY_GRID[3]]!,
    startSec: 3,
    durationSec: WINTER_LOOP_SEGMENT_SEC,
  },
  // 1 «к» — winter-3/gr.clip3.grid.mp4 @ 0:00
  {
    videoSrc: TOUR_WINTER_3_GALLERY_GRID[9],
    posterSrc: TOUR_WINTER_3_GRID_VIDEO_POSTERS[TOUR_WINTER_3_GALLERY_GRID[9]]!,
    startSec: 0,
    durationSec: WINTER_LOOP_SEGMENT_SEC,
  },
  // 2 «р» — winter-3/gr.clip4.grid.mp4 @ 0:16
  {
    videoSrc: TOUR_WINTER_3_GALLERY_GRID[11],
    posterSrc: TOUR_WINTER_3_GRID_VIDEO_POSTERS[TOUR_WINTER_3_GALLERY_GRID[11]]!,
    startSec: 16,
    durationSec: WINTER_LOOP_SEGMENT_SEC,
  },
  // 3 «а» — winter-3/gr.clip5.grid.mp4 @ 0:01
  {
    videoSrc: TOUR_WINTER_3_GALLERY_GRID[12],
    posterSrc: TOUR_WINTER_3_GRID_VIDEO_POSTERS[TOUR_WINTER_3_GALLERY_GRID[12]]!,
    startSec: 1,
    durationSec: WINTER_LOOP_SEGMENT_SEC,
  },
  // 4 «й» — winter-4/hs.clip1.grid.mp4 @ 0:05
  {
    videoSrc: TOUR_WINTER_4_GALLERY_GRID[2],
    posterSrc: TOUR_WINTER_4_GRID_VIDEO_POSTERS[TOUR_WINTER_4_GALLERY_GRID[2]]!,
    startSec: 5,
    durationSec: WINTER_LOOP_SEGMENT_SEC,
  },
  // 5 «н» — winter-5/ars.clip1.grid.mp4 @ 0:02
  {
    videoSrc: TOUR_WINTER_5_GALLERY_GRID[4],
    posterSrc: TOUR_WINTER_5_GRID_VIDEO_POSTERS[TOUR_WINTER_5_GALLERY_GRID[4]]!,
    startSec: 2,
    durationSec: WINTER_LOOP_SEGMENT_SEC,
  },
  // 6 «о» — winter-5/ars.clip2.grid.mp4 @ 0:07
  {
    videoSrc: TOUR_WINTER_5_GALLERY_GRID[5],
    posterSrc: TOUR_WINTER_5_GRID_VIDEO_POSTERS[TOUR_WINTER_5_GALLERY_GRID[5]]!,
    startSec: 7,
    durationSec: WINTER_LOOP_SEGMENT_SEC,
  },
  // 7 «с» — gr.board.grid.mp4 (исходник с 0:05, в файле таймлайн с 0)
  {
    videoSrc: TOUR_WINTER_3_GALLERY_GRID[4],
    posterSrc: TOUR_WINTER_3_GRID_VIDEO_POSTERS[TOUR_WINTER_3_GALLERY_GRID[4]]!,
    startSec: 0,
    durationSec: WINTER_LOOP_SEGMENT_SEC,
  },
  // 8 «т» — gr.elya.grid.mp4 @ исходник 0:06
  {
    videoSrc: TOUR_WINTER_3_GALLERY_GRID[7],
    posterSrc: TOUR_WINTER_3_GRID_VIDEO_POSTERS[TOUR_WINTER_3_GALLERY_GRID[7]]!,
    startSec: 0,
    durationSec: WINTER_LOOP_SEGMENT_SEC,
  },
  // 9 «и» — gr.bbq.grid.mp4 @ исходник 0:14
  {
    videoSrc: TOUR_WINTER_3_GALLERY_GRID[10],
    posterSrc: TOUR_WINTER_3_GRID_VIDEO_POSTERS[TOUR_WINTER_3_GALLERY_GRID[10]]!,
    startSec: 0,
    durationSec: WINTER_LOOP_SEGMENT_SEC,
  },
];

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
