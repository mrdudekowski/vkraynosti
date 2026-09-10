import { SEASON_ORDER } from '../../constants/seasonNavbarAppearance';
import type { Season } from '../../types';

export const ADMIN_PATHS = {
  dashboard: '/',
  tours: '/tours',
  schedule: '/schedule',
  scheduleDeparture: (id: string, startsOn: string) =>
    `/schedule?date=${encodeURIComponent(startsOn)}&departure=${encodeURIComponent(id)}`,
  inbox: '/inbox',
  season: (season: Season) => `/tours/${season}`,
  individual: '/individual',
  tour: (id: string, tab?: string) =>
    tab == null || tab.length === 0
      ? `/tours/${id}`
      : `/tours/${id}?tab=${encodeURIComponent(tab)}`,
  leads: '/leads',
  lead: (personId: string) => `/leads/${personId}`,
  users: '/users',
} as const;

export function isAdminSeasonParam(value: string | undefined): value is Season {
  return value != null && (SEASON_ORDER as readonly string[]).includes(value);
}

export function isAdminDashboardSection(pathname: string): boolean {
  return pathname === ADMIN_PATHS.dashboard;
}

export function isAdminInboxSection(pathname: string): boolean {
  return pathname === ADMIN_PATHS.inbox || pathname.startsWith(`${ADMIN_PATHS.inbox}/`);
}

export function isAdminScheduleSection(pathname: string): boolean {
  return pathname === ADMIN_PATHS.schedule || pathname.startsWith(`${ADMIN_PATHS.schedule}/`);
}

export function isAdminToursSection(pathname: string): boolean {
  return (
    pathname === ADMIN_PATHS.tours ||
    pathname.startsWith(`${ADMIN_PATHS.tours}/`) ||
    pathname.startsWith('/seasons/') ||
    pathname === ADMIN_PATHS.individual
  );
}

export function isAdminUsersSection(pathname: string): boolean {
  return pathname === ADMIN_PATHS.users || pathname.startsWith(`${ADMIN_PATHS.users}/`);
}

export function isAdminLeadsSection(pathname: string): boolean {
  return pathname === ADMIN_PATHS.leads || pathname.startsWith(`${ADMIN_PATHS.leads}/`);
}
