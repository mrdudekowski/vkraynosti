import { describe, expect, it } from 'vitest';
import { BENTO_BLOCK_TYPES, getBentoBlockSlotCount } from './blockTypes';
import {
  BENTO_LEGACY_TILE_CLASS_ALIASES,
  BENTO_SLOT_PLACEMENTS,
  getBentoSlotTileClassName,
} from './slotPlacement';

describe('getBentoBlockSlotCount', () => {
  it.each(BENTO_BLOCK_TYPES)('тип %s — число слотов совпадает с placement', type => {
    expect(getBentoBlockSlotCount(type)).toBe(BENTO_SLOT_PLACEMENTS[type].length);
  });

  it('сводная таблица mediaCount', () => {
    expect(getBentoBlockSlotCount('bento-left')).toBe(3);
    expect(getBentoBlockSlotCount('bento-four')).toBe(4);
    expect(getBentoBlockSlotCount('bento-single')).toBe(1);
    expect(getBentoBlockSlotCount('bento-vert')).toBe(2);
  });
});

function tailwindTokenSet(className: string): Set<string> {
  return new Set(className.trim().split(/\s+/));
}

function expectSameTailwindTokens(received: string, expected: string) {
  expect(tailwindTokenSet(received)).toEqual(tailwindTokenSet(expected));
}

describe('BENTO_SLOT_PLACEMENTS snapshot', () => {
  it('bento-left совпадает с legacy tall-left + right squares', () => {
    const placements = BENTO_SLOT_PLACEMENTS['bento-left'];
    expectSameTailwindTokens(
      getBentoSlotTileClassName(placements[0]),
      BENTO_LEGACY_TILE_CLASS_ALIASES.tallLeft
    );
    expectSameTailwindTokens(
      getBentoSlotTileClassName(placements[1]),
      BENTO_LEGACY_TILE_CLASS_ALIASES.rightTop
    );
    expectSameTailwindTokens(
      getBentoSlotTileClassName(placements[2]),
      BENTO_LEGACY_TILE_CLASS_ALIASES.rightBottom
    );
  });

  it('bento-right — legacy tall-right + left squares', () => {
    const placements = BENTO_SLOT_PLACEMENTS['bento-right'];
    expectSameTailwindTokens(
      getBentoSlotTileClassName(placements[0]),
      BENTO_LEGACY_TILE_CLASS_ALIASES.leftTop
    );
    expectSameTailwindTokens(
      getBentoSlotTileClassName(placements[1]),
      BENTO_LEGACY_TILE_CLASS_ALIASES.leftBottom
    );
    expectSameTailwindTokens(
      getBentoSlotTileClassName(placements[2]),
      BENTO_LEGACY_TILE_CLASS_ALIASES.tallRight
    );
  });

  it('bento-single — legacy full 2×2 tile', () => {
    expectSameTailwindTokens(
      getBentoSlotTileClassName(BENTO_SLOT_PLACEMENTS['bento-single'][0]),
      BENTO_LEGACY_TILE_CLASS_ALIASES.wide2x2
    );
  });

  it('bento-wide-square — legacy full-width square', () => {
    expectSameTailwindTokens(
      getBentoSlotTileClassName(BENTO_SLOT_PLACEMENTS['bento-wide-square'][0]),
      BENTO_LEGACY_TILE_CLASS_ALIASES.fullWidthSquare
    );
  });

  it('bento-center-top — wide 2×1 + два квадрата снизу', () => {
    const placements = BENTO_SLOT_PLACEMENTS['bento-center-top'];
    const wideTopTokens = tailwindTokenSet(getBentoSlotTileClassName(placements[0]));
    const legacyWide = tailwindTokenSet(BENTO_LEGACY_TILE_CLASS_ALIASES.wide2x1);
    for (const token of legacyWide) {
      expect(wideTopTokens.has(token)).toBe(true);
    }
    expect(placements[1].gridClass).toContain('col-start-1');
    expect(placements[1].gridClass).toContain('row-start-2');
    expect(placements[2].gridClass).toContain('col-start-2');
    expect(placements[2].gridClass).toContain('row-start-2');
  });

  it('все типы — tile classNames (snapshot)', () => {
    const snapshot = Object.fromEntries(
      BENTO_BLOCK_TYPES.map(type => [
        type,
        BENTO_SLOT_PLACEMENTS[type].map(getBentoSlotTileClassName),
      ])
    );
    expect(snapshot).toMatchInlineSnapshot(`
      {
        "bento-center-bottom": [
          "col-start-1 row-start-1 w-full min-h-0 aspect-square",
          "col-start-2 row-start-1 w-full min-h-0 aspect-square",
          "col-span-2 row-start-2 w-full min-w-0 aspect-gallery-tile-2x1",
        ],
        "bento-center-top": [
          "col-span-2 row-start-1 w-full min-w-0 aspect-gallery-tile-2x1",
          "col-start-1 row-start-2 w-full min-h-0 aspect-square",
          "col-start-2 row-start-2 w-full min-h-0 aspect-square",
        ],
        "bento-four": [
          "col-start-1 row-start-1 w-full min-h-0 aspect-square",
          "col-start-2 row-start-1 w-full min-h-0 aspect-square",
          "col-start-1 row-start-2 w-full min-h-0 aspect-square",
          "col-start-2 row-start-2 w-full min-h-0 aspect-square",
        ],
        "bento-left": [
          "col-start-1 row-span-2 row-start-1 h-full min-h-0 w-full aspect-gallery-bento-tall",
          "col-start-2 row-start-1 w-full min-h-0 aspect-square",
          "col-start-2 row-start-2 w-full min-h-0 aspect-square",
        ],
        "bento-right": [
          "col-start-1 row-start-1 w-full min-h-0 aspect-square",
          "col-start-1 row-start-2 w-full min-h-0 aspect-square",
          "col-start-2 row-span-2 row-start-1 h-full min-h-0 w-full aspect-gallery-bento-tall",
        ],
        "bento-single": [
          "col-span-2 w-full min-w-0 aspect-gallery-tile-2x2",
        ],
        "bento-vert": [
          "col-start-1 row-span-2 row-start-1 h-full min-h-0 w-full aspect-gallery-bento-tall",
          "col-start-2 row-span-2 row-start-1 h-full min-h-0 w-full aspect-gallery-bento-tall",
        ],
        "bento-wide-square": [
          "col-span-2 w-full min-w-0 aspect-square",
        ],
      }
    `);
  });
});
