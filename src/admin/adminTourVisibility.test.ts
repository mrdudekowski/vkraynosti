import { describe, expect, it } from 'vitest';
import {
  adminTourGuestVisibilityAction,
  adminTourVisibility,
  adminTourVisibilityTone,
  countToursOnSite,
  matchesAdminTourVisibility,
} from './adminTourVisibility';

describe('adminTourVisibility', () => {
  it('на витрине только опубликованный active', () => {
    expect(adminTourVisibility({ published: true, status: 'active' })).toBe('on_site');
    expect(adminTourVisibility({ published: true, status: 'draft' })).toBe('in_development');
    expect(adminTourVisibility({ published: true, status: 'in_development' })).toBe(
      'in_development',
    );
    expect(adminTourVisibility({ published: true, status: 'hidden' })).toBe('hidden');
    expect(adminTourVisibility({ published: false, status: 'active' })).toBe('draft');
  });

  it('скрывает только то, что гость уже видит, и возвращает скрытое', () => {
    expect(adminTourGuestVisibilityAction({ published: true, status: 'active' })).toBe('hide');
    expect(adminTourGuestVisibilityAction({ published: true, status: 'hidden' })).toBe('show');
    expect(adminTourGuestVisibilityAction({ published: true, status: 'in_development' })).toBe(
      null,
    );
    expect(adminTourGuestVisibilityAction({ published: false, status: 'active' })).toBe(null);
  });

  it('кодирует видимость тоном бейджа', () => {
    expect(adminTourVisibilityTone('on_site')).toBe('success');
    expect(adminTourVisibilityTone('in_development')).toBe('warning');
    expect(adminTourVisibilityTone('hidden')).toBe('info');
    expect(adminTourVisibilityTone('draft')).toBe('draft');
  });

  it('фильтрует по видимости и названию', () => {
    const tour = { title: 'Изюбриная', published: true, status: 'active' as const };
    expect(matchesAdminTourVisibility(tour, 'on_site', 'изюбр')).toBe(true);
    expect(matchesAdminTourVisibility(tour, 'hidden', '')).toBe(false);
    expect(matchesAdminTourVisibility(tour, 'draft', '')).toBe(false);
    expect(matchesAdminTourVisibility(tour, 'all', 'краб')).toBe(false);
    expect(
      matchesAdminTourVisibility(
        {
          title: 'Полуостров Краббе',
          published: true,
          status: 'hidden',
        },
        'draft',
        '',
      ),
    ).toBe(false);
  });

  it('фильтр На сайте смотрит на снимок, не на черновик скрытия', () => {
    const willHide = {
      title: 'Изюбриная',
      published: true,
      status: 'hidden' as const,
      publishedStatus: 'active' as const,
    };
    expect(matchesAdminTourVisibility(willHide, 'on_site', '')).toBe(true);
    expect(matchesAdminTourVisibility(willHide, 'hidden', '')).toBe(false);
    const willShow = {
      title: 'Голец',
      published: true,
      status: 'active' as const,
      publishedStatus: 'hidden' as const,
    };
    expect(matchesAdminTourVisibility(willShow, 'hidden', '')).toBe(true);
    expect(matchesAdminTourVisibility(willShow, 'on_site', '')).toBe(false);
  });

  it('считает сколько туров гость увидит в сетке', () => {
    expect(
      countToursOnSite([
        { published: true, status: 'active' },
        { published: true, status: 'active' },
        { published: true, status: 'in_development' },
        { published: false, status: 'draft' },
      ]),
    ).toEqual({ onSite: 2, total: 4 });
  });

  it('считает витрину по выпущенной копии, не по черновику скрытия', () => {
    expect(
      countToursOnSite([
        { published: true, status: 'hidden', publishedStatus: 'active' },
        { published: true, status: 'active', publishedStatus: 'hidden' },
      ]),
    ).toEqual({ onSite: 1, total: 2 });
  });
});
