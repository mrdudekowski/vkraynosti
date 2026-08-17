import { describe, expect, it } from 'vitest';
import { allocateUniqueSlug, nextSeasonTourId, slugFromTitle } from './cmsTourSlug';

describe('slugFromTitle', () => {
  it('транслитерирует русское название в латиницу как в публичных URL', () => {
    expect(slugFromTitle('Восхождение на Изюбриную')).toBe('voskhozhdenie-na-izyubrinuyu');
    expect(slugFromTitle('Хаски поездка')).toBe('khaski-poezdka');
    expect(slugFromTitle('Полуостров Краббе')).toBe('poluostrov-krabbe');
  });

  it('схлопывает пробелы и пунктуацию, пустое название даёт запасной slug', () => {
    expect(slugFromTitle('Остров Петрова!')).toBe('ostrov-petrova');
    expect(slugFromTitle('   ')).toBe('tur');
  });
});

describe('allocateUniqueSlug', () => {
  it('добавляет суффикс, если адрес уже занят', () => {
    expect(allocateUniqueSlug('poluostrov-krabbe', new Set(['poluostrov-krabbe']))).toBe(
      'poluostrov-krabbe-2',
    );
    expect(
      allocateUniqueSlug('poluostrov-krabbe', new Set(['poluostrov-krabbe', 'poluostrov-krabbe-2'])),
    ).toBe('poluostrov-krabbe-3');
  });
});

describe('nextSeasonTourId', () => {
  it('берёт следующий номер сезона по уже существующим id', () => {
    expect(nextSeasonTourId('winter', ['winter-1', 'winter-5', 'summer-8'])).toBe('winter-6');
    expect(nextSeasonTourId('spring', ['winter-1'])).toBe('spring-1');
  });
});
