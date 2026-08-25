import { describe, expect, it } from 'vitest';
import { getTourById } from './toursData';

describe('колонки описания туров', () => {
  it('хранит winter-1 так же, как две колонки на сайте', () => {
    const tour = getTourById('winter-1');
    expect(tour).toBeDefined();
    expect(tour?.descriptionLeadBold).toBe('Гора Изюбриная (1433 м)');
    expect(tour?.description).toBe(
      'живописная вершина в Чугуевском районе Приморского края на пересечении хребтов Белки и Лугового.',
    );
    expect(tour?.descriptionAside).toBe(
      '«Самая снежная» вершина известна своими сказочными заснеженными елями и является местом притяжения зимнего туризма. Входит в список «Лунного медведя».',
    );
  });

  it('не выдумывает правую колонку для заглушки', () => {
    const tour = getTourById('summer-15');
    expect(tour?.description).toBe('Описание маршрута готовится.');
    expect(tour?.descriptionAside).toBeUndefined();
  });
});
