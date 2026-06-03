/**
 * Канон типов bento-блоков 2×2 (SSOT).
 * @see docs/TOUR_BENTO_GRID_SYSTEM_AGENT_PROMPT.md
 */

export const BENTO_BLOCK_TYPES = [
  'bento-left',
  'bento-right',
  'bento-center-top',
  'bento-center-bottom',
  'bento-four',
  'bento-single',
  'bento-vert',
] as const;

export type BentoBlockType = (typeof BENTO_BLOCK_TYPES)[number];

const BENTO_BLOCK_SLOT_COUNTS: Record<BentoBlockType, number> = {
  'bento-left': 3,
  'bento-right': 3,
  'bento-center-top': 3,
  'bento-center-bottom': 3,
  'bento-four': 4,
  'bento-single': 1,
  'bento-vert': 2,
};

/** Ожидаемое число медиа-слотов для типа блока. */
export function getBentoBlockSlotCount(type: BentoBlockType): number {
  return BENTO_BLOCK_SLOT_COUNTS[type];
}
