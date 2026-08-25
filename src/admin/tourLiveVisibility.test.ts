import { describe, expect, it } from 'vitest';
import { adminTourLiveVisibility, countToursLiveOnSite } from './tourLiveVisibility';

describe('adminTourLiveVisibility', () => {
  it('черновик без выпуска — Черновик', () => {
    expect(adminTourLiveVisibility({ published: false, status: 'active' })).toBe('draft');
    expect(adminTourLiveVisibility({ published: false, status: 'hidden' })).toBe('draft');
  });

  it('скрыли в черновике, на сайте ещё виден — будет скрыт', () => {
    expect(
      adminTourLiveVisibility({
        published: true,
        status: 'hidden',
        publishedStatus: 'active',
      }),
    ).toBe('will_hide');
  });

  it('после выпуска скрытия — Скрыт', () => {
    expect(
      adminTourLiveVisibility({
        published: true,
        status: 'hidden',
        publishedStatus: 'hidden',
      }),
    ).toBe('hidden');
  });

  it('вернули в черновике, гость ещё не видит — будет на сайте', () => {
    expect(
      adminTourLiveVisibility({
        published: true,
        status: 'active',
        publishedStatus: 'hidden',
      }),
    ).toBe('will_show');
  });

  it('считает на сайте по выпущенной копии, не по черновику', () => {
    expect(
      countToursLiveOnSite([
        { published: true, status: 'hidden', publishedStatus: 'active' },
        { published: true, status: 'hidden', publishedStatus: 'hidden' },
        { published: false, status: 'draft' },
      ]),
    ).toEqual({ onSite: 1, total: 3 });
  });
});
