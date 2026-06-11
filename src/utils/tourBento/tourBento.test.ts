import { describe, expect, it } from 'vitest';
import {
  TOUR_SPRING_4_GALLERY_GRID,
  TOUR_SPRING_5_GALLERY_GRID,
  TOUR_SPRING_6_GALLERY_GRID,
  TOUR_SPRING_11_GALLERY_GRID,
  TOUR_SPRING_12_GALLERY_GRID,
  TOUR_SPRING_13_GALLERY_GRID,
  TOUR_SUMMER_8_GALLERY_GRID,
  TOUR_SUMMER_9_GALLERY_GRID,
  TOUR_SUMMER_10_GALLERY_GRID,
  TOUR_SUMMER_11_GALLERY_GRID,
} from '../../constants/images';
import {
  buildSpring4SestraBentoLayout,
  buildSpring5ChitindzuBentoLayout,
  buildSpring6MaralyDrakonyBentoLayout,
  buildSpring11ShkotaBentoLayout,
  buildSpring12TobizinaBentoLayout,
  buildSpring13GamovaBentoLayout,
  buildSummer8CrabbeBentoLayout,
  buildSummer9NeozhidannyBentoLayout,
  buildSummer10EzhSestraBentoLayout,
  buildSummer11RelaxBentoLayout,
} from '../../data/tourBentoLayouts';
import { tourBentoGalleryLayoutSchema } from '../../types/tourBento';
import { flattenBentoSlotsToUrls } from './flattenBentoSlotsToUrls';
import { resolveTourBentoLayout } from './resolveTourBentoLayout';
import { getTourById } from '../../data/toursData';

describe('tourBento validation', () => {
  it('отклоняет неверное число слотов', () => {
    const result = tourBentoGalleryLayoutSchema.safeParse({
      blocks: [{ type: 'bento-left', slots: [{ src: '/a.webp' }] }],
    });
    expect(result.success).toBe(false);
  });

  it('принимает корректный bento-four', () => {
    const result = tourBentoGalleryLayoutSchema.safeParse({
      blocks: [
        {
          type: 'bento-four',
          slots: [
            { src: '/1.webp' },
            { src: '/2.webp' },
            { src: '/3.webp' },
            { src: '/4.webp' },
          ],
        },
      ],
    });
    expect(result.success).toBe(true);
  });
});

describe('flattenBentoSlotsToUrls', () => {
  it('обходит blocks → slots в порядке схемы spring-4', () => {
    const gridImages = TOUR_SPRING_4_GALLERY_GRID.slice(2);
    const layout = buildSpring4SestraBentoLayout([...gridImages]);
    const flat = flattenBentoSlotsToUrls(layout);
    expect(flat).toEqual([
      gridImages[7],
      gridImages[5],
      gridImages[3],
      gridImages[0],
      gridImages[2],
      gridImages[4],
      gridImages[10],
      gridImages[6],
      gridImages[9],
      gridImages[1],
      gridImages[8],
    ]);
    expect(flat).toHaveLength(11);
  });

  it('обходит blocks → slots в порядке схемы summer-8', () => {
    const gridImages = TOUR_SUMMER_8_GALLERY_GRID.slice(2);
    const layout = buildSummer8CrabbeBentoLayout([...gridImages]);
    const flat = flattenBentoSlotsToUrls(layout);
    expect(flat).toEqual([...gridImages]);
    expect(flat).toHaveLength(7);
  });

  it('обходит blocks → slots в порядке схемы summer-9', () => {
    const gridImages = TOUR_SUMMER_9_GALLERY_GRID.slice(2);
    const layout = buildSummer9NeozhidannyBentoLayout([...gridImages]);
    const flat = flattenBentoSlotsToUrls(layout);
    expect(flat).toEqual([...gridImages]);
    expect(flat).toHaveLength(7);
  });

  it('обходит blocks → slots в порядке схемы summer-10', () => {
    const gridImages = TOUR_SUMMER_10_GALLERY_GRID.slice(2);
    const layout = buildSummer10EzhSestraBentoLayout([...gridImages]);
    const flat = flattenBentoSlotsToUrls(layout);
    expect(flat).toEqual([...gridImages]);
    expect(flat).toHaveLength(19);
  });

  it('обходит blocks → slots в порядке схемы summer-11', () => {
    const gridImages = TOUR_SUMMER_11_GALLERY_GRID.slice(2);
    const layout = buildSummer11RelaxBentoLayout([...gridImages]);
    const flat = flattenBentoSlotsToUrls(layout);
    expect(flat).toEqual([...gridImages]);
    expect(flat).toHaveLength(7);
  });

  it('обходит blocks → slots в порядке схемы spring-11 (Шкота)', () => {
    const gridImages = TOUR_SPRING_11_GALLERY_GRID.slice(2);
    const layout = buildSpring11ShkotaBentoLayout([...gridImages]);
    const flat = flattenBentoSlotsToUrls(layout);
    expect(flat).toEqual([
      gridImages[0],
      gridImages[1],
      gridImages[2],
      gridImages[4],
      gridImages[5],
      gridImages[3],
      gridImages[6],
      gridImages[7],
      gridImages[8],
      gridImages[9],
      gridImages[10],
      gridImages[11],
    ]);
    expect(flat).toHaveLength(12);
  });

  it('обходит blocks → slots в порядке схемы spring-5 (Читинза)', () => {
    const gridImages = TOUR_SPRING_5_GALLERY_GRID.slice(2);
    const layout = buildSpring5ChitindzuBentoLayout([...gridImages]);
    const flat = flattenBentoSlotsToUrls(layout);
    expect(flat).toEqual([
      gridImages[0],
      gridImages[4],
      gridImages[5],
      gridImages[2],
      gridImages[3],
      gridImages[4],
      gridImages[6],
      gridImages[1],
      gridImages[7],
      gridImages[8],
      gridImages[9],
    ]);
    expect(flat).toHaveLength(11);
  });

  it('обходит blocks → slots в порядке схемы spring-6 (Маралы х Драконы)', () => {
    const gridImages = TOUR_SPRING_6_GALLERY_GRID.slice(2);
    const layout = buildSpring6MaralyDrakonyBentoLayout([...gridImages]);
    const flat = flattenBentoSlotsToUrls(layout);
    expect(flat).toEqual([
      gridImages[6],
      gridImages[5],
      gridImages[7],
      gridImages[1],
      gridImages[2],
      gridImages[3],
      gridImages[4],
      gridImages[0],
      gridImages[8],
      gridImages[9],
      gridImages[10],
    ]);
    expect(flat).toHaveLength(11);
  });
});

describe('resolveTourBentoLayout', () => {
  it('spring-4 и fall-4 (contentSource) получают layout', () => {
    const spring = getTourById('spring-4');
    const fall = getTourById('fall-4');
    expect(spring).toBeDefined();
    expect(fall).toBeDefined();

    const springGrid = spring!.galleryGridUrls!.slice(2);
    const fallGrid = fall!.galleryGridUrls!.slice(2);

    const springLayout = resolveTourBentoLayout(spring!, springGrid);
    const fallLayout = resolveTourBentoLayout(fall!, fallGrid);

    expect(springLayout).toBeDefined();
    expect(fallLayout).toBeDefined();
    expect(flattenBentoSlotsToUrls(springLayout!)).toHaveLength(11);
    expect(flattenBentoSlotsToUrls(fallLayout!)).toHaveLength(11);
    expect(fallLayout!.blocks.map(b => b.type)).toEqual(
      springLayout!.blocks.map(b => b.type)
    );
  });

  it('spring-5 и fall-5 (contentSource) получают layout', () => {
    const spring = getTourById('spring-5');
    const fall = getTourById('fall-5');
    expect(spring).toBeDefined();
    expect(fall).toBeDefined();

    const springGrid = spring!.galleryGridUrls!.slice(2);
    const fallGrid = fall!.galleryGridUrls!.slice(2);

    const springLayout = resolveTourBentoLayout(spring!, springGrid);
    const fallLayout = resolveTourBentoLayout(fall!, fallGrid);

    expect(springLayout).toBeDefined();
    expect(fallLayout).toBeDefined();
    expect(flattenBentoSlotsToUrls(springLayout!)).toHaveLength(11);
    expect(flattenBentoSlotsToUrls(fallLayout!)).toHaveLength(11);
    expect(fallLayout!.blocks.map((b) => b.type)).toEqual(
      springLayout!.blocks.map((b) => b.type)
    );
    expect(fallGrid.every((url) => url.includes('/tours/fall-5/'))).toBe(true);
  });

  it('spring-6 и fall-6 (contentSource) получают layout', () => {
    const spring = getTourById('spring-6');
    const fall = getTourById('fall-6');
    expect(spring).toBeDefined();
    expect(fall).toBeDefined();

    const springGrid = spring!.galleryGridUrls!.slice(2);
    const fallGrid = fall!.galleryGridUrls!.slice(2);

    const springLayout = resolveTourBentoLayout(spring!, springGrid);
    const fallLayout = resolveTourBentoLayout(fall!, fallGrid);

    expect(springLayout).toBeDefined();
    expect(fallLayout).toBeDefined();
    expect(flattenBentoSlotsToUrls(springLayout!)).toHaveLength(11);
    expect(flattenBentoSlotsToUrls(fallLayout!)).toHaveLength(11);
    expect(fallLayout!.blocks.map((b) => b.type)).toEqual(
      springLayout!.blocks.map((b) => b.type)
    );
    expect(fallGrid.every((url) => url.includes('/tours/fall-6/'))).toBe(true);
  });

  it('buildSpring5ChitindzuBentoLayout отклоняет неверное число кадров', () => {
    const gridImages = TOUR_SPRING_5_GALLERY_GRID.slice(2);
    expect(() => buildSpring5ChitindzuBentoLayout(gridImages.slice(0, 9))).toThrow(
      /expected 10 grid images/
    );
  });

  it('buildSpring6MaralyDrakonyBentoLayout отклоняет неверное число кадров', () => {
    const gridImages = TOUR_SPRING_6_GALLERY_GRID.slice(2);
    expect(() => buildSpring6MaralyDrakonyBentoLayout(gridImages.slice(0, 10))).toThrow(
      /expected 11 grid images/
    );
  });

  it('winter-1 без builder — undefined', () => {
    const tour = getTourById('winter-1');
    expect(tour).toBeDefined();
    const grid = tour!.galleryGridUrls?.slice(2) ?? [];
    expect(resolveTourBentoLayout(tour!, grid)).toBeUndefined();
  });

  it('summer-8 получает bento-center-top + vert×2', () => {
    const tour = getTourById('summer-8');
    expect(tour).toBeDefined();

    const grid = tour!.galleryGridUrls!.slice(2);
    const layout = resolveTourBentoLayout(tour!, grid);

    expect(layout).toBeDefined();
    expect(layout!.blocks.map(b => b.type)).toEqual([
      'bento-center-top',
      'bento-vert',
      'bento-vert',
    ]);
    expect(flattenBentoSlotsToUrls(layout!)).toEqual([...grid]);
    expect(flattenBentoSlotsToUrls(layout!)).toHaveLength(7);
  });

  it('buildSummer8CrabbeBentoLayout отклоняет неверное число кадров', () => {
    const gridImages = TOUR_SUMMER_8_GALLERY_GRID.slice(2);
    expect(() => buildSummer8CrabbeBentoLayout(gridImages.slice(0, 6))).toThrow(
      /expected 7 grid images/
    );
    expect(() =>
      buildSummer8CrabbeBentoLayout([...gridImages, '/extra.webp'])
    ).toThrow(/expected 7 grid images/);
  });

  it('summer-9 получает center-top + single + left', () => {
    const tour = getTourById('summer-9');
    expect(tour).toBeDefined();

    const grid = tour!.galleryGridUrls!.slice(2);
    const layout = resolveTourBentoLayout(tour!, grid);

    expect(layout).toBeDefined();
    expect(layout!.blocks.map(b => b.type)).toEqual([
      'bento-center-top',
      'bento-single',
      'bento-left',
    ]);
    expect(flattenBentoSlotsToUrls(layout!)).toEqual([...grid]);
  });

  it('summer-10 получает single + left + single + left + center-top + right + single + center-bottom + single', () => {
    const tour = getTourById('summer-10');
    expect(tour).toBeDefined();

    const grid = tour!.galleryGridUrls!.slice(2);
    const layout = resolveTourBentoLayout(tour!, grid);

    expect(layout).toBeDefined();
    expect(layout!.blocks.map(b => b.type)).toEqual([
      'bento-single',
      'bento-left',
      'bento-single',
      'bento-left',
      'bento-center-top',
      'bento-right',
      'bento-single',
      'bento-center-bottom',
      'bento-single',
    ]);
    expect(flattenBentoSlotsToUrls(layout!)).toEqual([...grid]);
    expect(flattenBentoSlotsToUrls(layout!)).toHaveLength(19);
  });

  it('summer-11 получает left + center-top + single', () => {
    const tour = getTourById('summer-11');
    expect(tour).toBeDefined();

    const grid = tour!.galleryGridUrls!.slice(2);
    const layout = resolveTourBentoLayout(tour!, grid);

    expect(layout).toBeDefined();
    expect(layout!.blocks.map(b => b.type)).toEqual([
      'bento-left',
      'bento-center-top',
      'bento-single',
    ]);
    expect(flattenBentoSlotsToUrls(layout!)).toEqual([...grid]);
  });

  it('spring-11 получает left + right + single + center-bottom + vert', () => {
    const tour = getTourById('spring-11');
    expect(tour).toBeDefined();

    const grid = tour!.galleryGridUrls!.slice(2);
    const layout = resolveTourBentoLayout(tour!, grid);

    expect(layout).toBeDefined();
    expect(layout!.blocks.map(b => b.type)).toEqual([
      'bento-left',
      'bento-right',
      'bento-single',
      'bento-center-bottom',
      'bento-vert',
    ]);
    const flat = flattenBentoSlotsToUrls(layout!);
    expect(flat).toEqual([
      grid[0],
      grid[1],
      grid[2],
      grid[4],
      grid[5],
      grid[3],
      grid[6],
      grid[7],
      grid[8],
      grid[9],
      grid[10],
      grid[11],
    ]);
    expect(flat).toHaveLength(12);
  });

  it('buildSpring11ShkotaBentoLayout отклоняет неверное число кадров', () => {
    const gridImages = TOUR_SPRING_11_GALLERY_GRID.slice(2);
    expect(() => buildSpring11ShkotaBentoLayout(gridImages.slice(0, 11))).toThrow(
      /expected 12 grid images/
    );
  });

  it('spring-13 получает single + left + single + vert + left', () => {
    const tour = getTourById('spring-13');
    expect(tour).toBeDefined();

    const grid = tour!.galleryGridUrls!.slice(2);
    const layout = resolveTourBentoLayout(tour!, grid);

    expect(layout).toBeDefined();
    expect(layout!.blocks.map(b => b.type)).toEqual([
      'bento-single',
      'bento-left',
      'bento-single',
      'bento-vert',
      'bento-left',
    ]);
    const flat = flattenBentoSlotsToUrls(layout!);
    expect(flat).toEqual([
      grid[3],
      grid[8],
      grid[4],
      grid[2],
      grid[5],
      grid[6],
      grid[7],
      grid[1],
      grid[0],
      grid[9],
    ]);
    expect(flat).toHaveLength(10);
  });

  it('обходит blocks → slots в порядке схемы spring-13 (Гамова)', () => {
    const gridImages = TOUR_SPRING_13_GALLERY_GRID.slice(2);
    const layout = buildSpring13GamovaBentoLayout([...gridImages]);
    const flat = flattenBentoSlotsToUrls(layout);
    expect(flat).toEqual([
      gridImages[3],
      gridImages[8],
      gridImages[4],
      gridImages[2],
      gridImages[5],
      gridImages[6],
      gridImages[7],
      gridImages[1],
      gridImages[0],
      gridImages[9],
    ]);
    expect(flat).toHaveLength(10);
  });

  it('buildSpring13GamovaBentoLayout отклоняет неверное число кадров', () => {
    const gridImages = TOUR_SPRING_13_GALLERY_GRID.slice(2);
    expect(() => buildSpring13GamovaBentoLayout(gridImages.slice(0, 9))).toThrow(
      /expected 10 grid images/
    );
  });

  it('spring-12 получает left + center-top + left (Тобизина)', () => {
    const tour = getTourById('spring-12');
    expect(tour).toBeDefined();

    const grid = tour!.galleryGridUrls!.slice(2);
    const layout = resolveTourBentoLayout(tour!, grid);

    expect(layout).toBeDefined();
    expect(layout!.blocks.map((b) => b.type)).toEqual([
      'bento-left',
      'bento-center-top',
      'bento-left',
    ]);
    expect(flattenBentoSlotsToUrls(layout!)).toEqual([...grid]);
  });

  it('summer-2 использует bento-layout spring-12 с путями summer-2', () => {
    const tour = getTourById('summer-2');
    expect(tour).toBeDefined();

    const grid = tour!.galleryGridUrls!.slice(2);
    const layout = resolveTourBentoLayout(tour!, grid);

    expect(layout).toBeDefined();
    expect(flattenBentoSlotsToUrls(layout!)).toEqual([...grid]);
    expect(grid.every((url) => url.includes('/tours/summer-2/'))).toBe(true);
  });

  it('buildSpring12TobizinaBentoLayout отклоняет неверное число кадров', () => {
    const gridImages = TOUR_SPRING_12_GALLERY_GRID.slice(2);
    expect(() => buildSpring12TobizinaBentoLayout(gridImages.slice(0, 8))).toThrow(
      /expected 9 grid images/
    );
  });
});
