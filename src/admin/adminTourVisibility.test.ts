import { describe, expect, it } from 'vitest';
import { adminTourVisibility, matchesAdminTourVisibility } from './adminTourVisibility';

describe('adminTourVisibility', () => {
  it('на сайте только опубликованный и не скрытый', () => {
    expect(adminTourVisibility({ published: true, status: 'draft' })).toBe('on_site');
    expect(adminTourVisibility({ published: true, status: 'hidden' })).toBe('hidden');
    expect(adminTourVisibility({ published: false, status: 'active' })).toBe('hidden');
  });

  it('фильтрует по видимости и названию', () => {
    const tour = { title: 'Изюбриная', published: true, status: 'active' as const };
    expect(matchesAdminTourVisibility(tour, 'on_site', 'изюбр')).toBe(true);
    expect(matchesAdminTourVisibility(tour, 'hidden', '')).toBe(false);
    expect(matchesAdminTourVisibility(tour, 'all', 'краб')).toBe(false);
  });
});
