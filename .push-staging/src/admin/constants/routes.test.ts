import { describe, expect, it } from 'vitest';
import {
  ADMIN_PATHS,
  isAdminDashboardSection,
  isAdminLeadsSection,
  isAdminToursSection,
  isAdminUsersSection,
} from './routes';

describe('admin routes', () => {
  it('отличает главную, туры, людей и заявки', () => {
    expect(isAdminDashboardSection(ADMIN_PATHS.dashboard)).toBe(true);
    expect(isAdminDashboardSection(ADMIN_PATHS.tours)).toBe(false);
    expect(isAdminToursSection(ADMIN_PATHS.tours)).toBe(true);
    expect(isAdminToursSection('/tours/winter')).toBe(true);
    expect(isAdminToursSection('/tours/winter-1')).toBe(true);
    expect(isAdminToursSection('/seasons/winter')).toBe(true);
    expect(isAdminToursSection(ADMIN_PATHS.dashboard)).toBe(false);
    expect(isAdminToursSection(ADMIN_PATHS.schedule)).toBe(false);
    expect(isAdminUsersSection('/users')).toBe(true);
    expect(isAdminLeadsSection('/leads/abc')).toBe(true);
    expect(isAdminLeadsSection('/inbox')).toBe(false);
    expect(ADMIN_PATHS.season('summer')).toBe('/tours/summer');
    expect(ADMIN_PATHS.tour('winter-1')).toBe('/tours/winter-1');
    expect(ADMIN_PATHS.tour('winter-1', 'attention')).toBe('/tours/winter-1?tab=attention');
  });
});
