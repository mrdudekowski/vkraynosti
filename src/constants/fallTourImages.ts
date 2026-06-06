import { MEDIA_ASSET_BASE } from './publicAssetBase';

const TOURS_ASSET_BASE = `${MEDIA_ASSET_BASE}tours` as const;

const FALL_TOUR_IDS = [
  'fall-1',
  'fall-2',
  'fall-3',
  'fall-4',
  'fall-5',
  'fall-6',
  'fall-7',
  'fall-8',
  'fall-9',
  'fall-10',
  'fall-11',
  'fall-12',
  'fall-13',
] as const;

export type FallTourId = (typeof FALL_TOUR_IDS)[number];

/** Туры с уникальным осенним hero (`content/Осень/heroes/fall-N.webp` → `hero.webp`). */
const FALL_TOUR_DEDICATED_HERO_IDS = new Set<FallTourId>([
  'fall-6',
  'fall-7',
  'fall-9',
  'fall-10',
]);

function fallTourHeroAssetPath(id: FallTourId): string {
  const fileName = FALL_TOUR_DEDICATED_HERO_IDS.has(id) ? 'hero.webp' : 'cover.webp';
  return `${TOURS_ASSET_BASE}/${id}/${fileName}`;
}

/**
 * Hero осенних туров: `public/tours/fall-N/hero.webp` или `cover.webp`.
 * Галерея — свои URL в `generated/fallTourMedia.generated.ts` (`/tours/fall-N/…`).
 */
export const FALL_TOUR_COVERS = Object.fromEntries(
  FALL_TOUR_IDS.map((id) => [id, fallTourHeroAssetPath(id)])
) as Record<FallTourId, string>;

export const FALL_TOUR_COUNT = FALL_TOUR_IDS.length;
