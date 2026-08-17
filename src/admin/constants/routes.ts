import { SEASON_ORDER } from '../../constants/seasonNavbarAppearance';
import type { Season } from '../../types';

export const ADMIN_PATHS = {
  tours: '/',
  season: (season: Season) => `/seasons/${season}`,
  individual: '/individual',
  tour: (id: string) => `/tours/${id}`,
  leads: '/leads',
  lead: (personId: string) => `/leads/${personId}`,
  users: '/users',
} as const;

export function isAdminSeasonParam(value: string | undefined): value is Season {
  return value != null && (SEASON_ORDER as readonly string[]).includes(value);
}

export function isAdminToursSection(pathname: string): boolean {
  return (
    pathname === ADMIN_PATHS.tours ||
    pathname.startsWith('/seasons/') ||
    pathname === ADMIN_PATHS.individual ||
    pathname.startsWith('/tours/')
  );
}
