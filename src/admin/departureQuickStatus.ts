import type { AdminDepartureStatus } from './api';

export const DEPARTURE_QUICK_STATUSES = ['planned', 'open'] as const;
export type DepartureQuickStatus = (typeof DEPARTURE_QUICK_STATUSES)[number];

export function isDepartureQuickStatus(status: AdminDepartureStatus): status is DepartureQuickStatus {
  return (DEPARTURE_QUICK_STATUSES as readonly AdminDepartureStatus[]).includes(status);
}
