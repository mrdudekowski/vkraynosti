import type { LucideIcon } from 'lucide-react';
import { AlertCircle, CheckCircle2, CircleX, Clock3 } from 'lucide-react';
import type { AdminDepartureStatus } from './api';

export type DepartureStatusTone = 'success' | 'info' | 'warning' | 'danger' | 'muted';

export type DepartureStatusPresentation = {
  tone: DepartureStatusTone;
  icon: LucideIcon | null;
  useDot: boolean;
};

const PRESENTATION: Record<AdminDepartureStatus, DepartureStatusPresentation> = {
  open: { tone: 'success', icon: null, useDot: true },
  planned: { tone: 'info', icon: Clock3, useDot: false },
  full: { tone: 'warning', icon: AlertCircle, useDot: false },
  cancelled: { tone: 'danger', icon: CircleX, useDot: false },
  completed: { tone: 'muted', icon: CheckCircle2, useDot: false },
};

export function departureStatusPresentation(status: AdminDepartureStatus): DepartureStatusPresentation {
  return PRESENTATION[status];
}

export const DEPARTURE_STATUS_LEGEND: readonly AdminDepartureStatus[] = [
  'open',
  'planned',
  'full',
  'cancelled',
];
