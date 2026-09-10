import { describe, expect, it } from 'vitest';
import { adminTourHasPublicPage, adminTourPublicHref } from './adminTourPublicHref';

describe('adminTourPublicHref', () => {
  it('собирает публичный путь из сезона и slug, не из id', () => {
    expect(
      adminTourPublicHref(
        { id: 'winter-1', season: 'winter', slug: 'izubrinaya' },
        '/vkraynosti/',
      ),
    ).toBe('/vkraynosti/tours/winter/izubrinaya/');
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
