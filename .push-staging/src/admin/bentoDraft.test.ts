import { describe, expect, it } from 'vitest';
import {
  createEmptyBentoBlock,
  placeAssetInSlot,
  retargetBentoBlock,
  setSlotObjectPosition,
  swapBentoSlots,
} from './bentoDraft';

describe('bentoDraft', () => {
  it('создаёт пустые слоты под схему', () => {
    const block = createEmptyBentoBlock('bento-vert');
    expect(block).toEqual({
      type: 'bento-vert',
      slots: [{ assetId: null }, { assetId: null }],
    });
  });

  it('при смене схемы лишние кадры уходят, новые ячейки пустые', () => {
    const next = retargetBentoBlock(
      {
        type: 'bento-vert',
        slots: [{ assetId: 'a' }, { assetId: 'b' }],
      },
      'bento-single',
    );
    expect(next).toEqual({ type: 'bento-single', slots: [{ assetId: 'a' }] });

    const wider = retargetBentoBlock(next, 'bento-vert');
    expect(wider.slots).toEqual([{ assetId: 'a' }, { assetId: null }]);
  });

  it('один кадр — одна ячейка', () => {
    const placed = placeAssetInSlot(
      {
        blocks: [
          { type: 'bento-vert', slots: [{ assetId: 'a' }, { assetId: null }] },
        ],
      },
      0,
      1,
      'a',
    );
    expect(placed.blocks[0]?.slots).toEqual([{ assetId: null }, { assetId: 'a' }]);
  });

  it('меняет ячейки местами', () => {
    const swapped = swapBentoSlots(
      {
        blocks: [
          { type: 'bento-vert', slots: [{ assetId: 'a' }, { assetId: 'b' }] },
        ],
      },
      0,
      0,
      0,
      1,
    );
    expect(swapped.blocks[0]?.slots).toEqual([{ assetId: 'b' }, { assetId: 'a' }]);
  });

  it('переносит object-position вместе с кадром', () => {
    const swapped = swapBentoSlots(
      {
        blocks: [
          {
            type: 'bento-vert',
            slots: [
              { assetId: 'a', objectPosition: '20% 80%' },
              { assetId: 'b', objectPosition: '70% 30%' },
            ],
          },
        ],
      },
      0,
      0,
      0,
      1,
    );
    expect(swapped.blocks[0]?.slots).toEqual([
      { assetId: 'b', objectPosition: '70% 30%' },
      { assetId: 'a', objectPosition: '20% 80%' },
    ]);
  });

  it('сбрасывает object-position при новой постановке кадра', () => {
    const placed = placeAssetInSlot(
      {
        blocks: [
          {
            type: 'bento-vert',
            slots: [
              { assetId: 'a', objectPosition: '20% 80%' },
              { assetId: null },
            ],
          },
        ],
      },
      0,
      1,
      'a',
    );
    expect(placed.blocks[0]?.slots).toEqual([{ assetId: null }, { assetId: 'a' }]);
  });

  it('пишет object-position в слот', () => {
    const next = setSlotObjectPosition(
      {
        blocks: [{ type: 'bento-single', slots: [{ assetId: 'a' }] }],
      },
      0,
      0,
      '20% 80%',
    );
    expect(next.blocks[0]?.slots[0]).toEqual({
      assetId: 'a',
      objectPosition: '20% 80%',
    });
  });
});
