import { describe, expect, it } from 'vitest';
import {
  persistTourDescriptionColumns,
  splitTourDescription,
} from './splitTourDescription';

const WINTER_1_BLOB =
  ' — живописная вершина в Чугуевском районе Приморского края на пересечении хребтов Белки и Лугового. «Самая снежная» вершина известна своими сказочными заснеженными елями и является местом притяжения зимнего туризма. Входит в список «Лунного медведя».';

describe('splitTourDescription', () => {
  it('убирает ведущее тире и делит текст на две колонки по предложениям', () => {
    const columns = splitTourDescription(WINTER_1_BLOB);
    expect(columns.primaryText).toBe(
      'живописная вершина в Чугуевском районе Приморского края на пересечении хребтов Белки и Лугового.',
    );
    expect(columns.asideText).toBe(
      '«Самая снежная» вершина известна своими сказочными заснеженными елями и является местом притяжения зимнего туризма. Входит в список «Лунного медведя».',
    );
  });

  it('не выдумывает правую колонку для короткой заглушки', () => {
    expect(splitTourDescription('Описание маршрута готовится.')).toEqual({
      primaryText: 'Описание маршрута готовится.',
      asideText: null,
    });
  });

  it('сохраняет явно заданную правую колонку', () => {
    const columns = splitTourDescription(' — левая колонка.', 'правая колонка сайта');
    expect(columns.primaryText).toBe('левая колонка.');
    expect(columns.asideText).toBe('правая колонка сайта');
  });
});

describe('persistTourDescriptionColumns', () => {
  it('кладёт колонки в поля CMS', () => {
    expect(persistTourDescriptionColumns(WINTER_1_BLOB)).toEqual({
      description:
        'живописная вершина в Чугуевском районе Приморского края на пересечении хребтов Белки и Лугового.',
      descriptionAside:
        '«Самая снежная» вершина известна своими сказочными заснеженными елями и является местом притяжения зимнего туризма. Входит в список «Лунного медведя».',
    });
  });
});
