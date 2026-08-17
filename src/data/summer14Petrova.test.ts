import { describe, expect, it } from 'vitest';
import { formatDifficultyRangeLabel } from '../utils/tourDifficultyLabel';
import { flattenBentoSlotsToUrls } from '../utils/tourBento/flattenBentoSlotsToUrls';
import { resolveTourBentoLayout } from '../utils/tourBento/resolveTourBentoLayout';
import { getTourById } from './toursData';

describe('summer-14 Остров Петрова', () => {
  it('публикует полный контент, а не заглушку', () => {
    const tour = getTourById('summer-14');
    expect(tour).toBeDefined();
    expect(tour!.title).toBe('Остров Петрова');
    expect(tour!.subtitle).toBe(
      'Один день среди заповедного моря, тисовой рощи и редкой красоты Приморья.',
    );
    expect(tour!.heroPhrase).toBe(
      'Туда, где бирюзовая вода, древний лес и кажется, будто время стало тише.',
    );
    expect(tour!.duration).toBe('1 день');
    expect(tour!.difficulty).toBe('Easy');
    expect(tour!.difficultyDisplayLabel).toBe(formatDifficultyRangeLabel('Easy', 'Medium'));
    expect(tour!.price).toBe('по запросу');
    expect(tour!.description).not.toBe('Описание маршрута готовится.');
    expect(tour!.descriptionAside).toMatch(/поющими песками/);
    expect(tour!.program).toHaveLength(8);
    expect(tour!.program[0]).toEqual({
      timeLabel: '05:00',
      description: 'Выезд из Владивостока',
    });
    expect(tour!.program[7]?.timeLabel).toBe('21:00–22:00');
    expect(tour!.includedInPrice.map((item) => item.text)).toEqual([
      'Трансфер туда и обратно',
      'Организация маршрута',
      'Сопровождение команды Вкрайности',
      'Посещение острова Петрова',
      'Время на прогулку, отдых и фото',
      'Наша забота и тёплая атмосфера в поездке',
    ]);
    expect(tour!.galleryImages).toHaveLength(8);
    expect(tour!.galleryGridUrls).toHaveLength(8);
    expect(tour!.coverCrop?.card).toEqual({ x: 49.67, y: 53.99 });
  });

  it('собирает bento-left и bento-center-bottom из CMS', () => {
    const tour = getTourById('summer-14');
    expect(tour).toBeDefined();

    const grid = tour!.galleryGridUrls!.slice(2);
    const layout = resolveTourBentoLayout(tour!, grid);

    expect(layout).toBeDefined();
    expect(layout!.blocks.map((block) => block.type)).toEqual([
      'bento-left',
      'bento-center-bottom',
    ]);
    expect(flattenBentoSlotsToUrls(layout!)).toEqual([...grid]);
    expect(grid).toHaveLength(6);
  });
});
