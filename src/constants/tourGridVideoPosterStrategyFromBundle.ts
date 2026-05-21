import type { TourMediaBundle } from './generated/fallTourMedia.generated';

export type GridVideoPosterMap = Record<string, string>;

export type TourGridVideoPosterStrategy =
  | { mode: 'fixed'; posters: GridVideoPosterMap }
  | { mode: 'breakpoint'; desktop: GridVideoPosterMap; mobile: GridVideoPosterMap };

export function tourGridVideoPosterStrategyFromBundle(
  bundle: TourMediaBundle
): TourGridVideoPosterStrategy | undefined {
  const { gridVideoPosters, gridVideoPostersMobile } = bundle;
  if (gridVideoPosters == null || Object.keys(gridVideoPosters).length === 0) {
    return undefined;
  }
  if (gridVideoPostersMobile != null && Object.keys(gridVideoPostersMobile).length > 0) {
    return {
      mode: 'breakpoint',
      desktop: gridVideoPosters,
      mobile: gridVideoPostersMobile,
    };
  }
  return { mode: 'fixed', posters: gridVideoPosters };
}
