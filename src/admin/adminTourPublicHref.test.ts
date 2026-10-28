import { describe, expect, it } from 'vitest';
import { adminTourHasPublicPage, adminTourPublicHref } from './adminTourPublicHref';

describe('adminTourPublicHref', () => {
  it('собирает абсолютный URL гостевого сайта из сезона и slug, не из id', () => {
    expect(
      adminTourPublicHref({ id: 'winter-1', season: 'winter', slug: 'izubrinaya' }),
    ).toBe('https://vkraynosti.ru/tours/winter/izubrinaya/');
  });

  it('использует SITE_URL, а не BASE_URL админки', () => {
    expect(
      adminTourPublicHref({ id: 'fall-3', season: 'fall', slug: 'reka-milogradovka' }),
    ).toBe('https://vkraynosti.ru/tours/fall/reka-milogradovka/');
  });
});

describe('adminTourHasPublicPage', () => {
  it('живая страница только у выпущенного active, не у «в работе» и не у ещё не выпущенного скрытия', () => {
    expect(adminTourHasPublicPage({ published: true, status: 'active', publishedStatus: 'active' })).toBe(
      true,
    );
    expect(
      adminTourHasPublicPage({ published: true, status: 'hidden', publishedStatus: 'active' }),
    ).toBe(true);
    expect(adminTourHasPublicPage({ published: true, status: 'in_development' })).toBe(false);
    expect(
      adminTourHasPublicPage({ published: true, status: 'hidden', publishedStatus: 'hidden' }),
    ).toBe(false);
    expect(adminTourHasPublicPage({ published: false, status: 'draft' })).toBe(false);
  });
});
