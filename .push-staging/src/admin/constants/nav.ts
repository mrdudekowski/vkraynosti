import type { LucideIcon } from 'lucide-react';
import { CalendarDays, Inbox, LayoutDashboard, Map, Send, Users } from 'lucide-react';
import {
  ADMIN_PATHS,
  isAdminDashboardSection,
  isAdminInboxSection,
  isAdminLeadsSection,
  isAdminScheduleSection,
  isAdminToursSection,
  isAdminUsersSection,
} from './routes';
import { ADMIN_UI } from './ui';

export type AdminNavId = 'dashboard' | 'tours' | 'schedule' | 'inbox' | 'users' | 'leads';

export type AdminNavItem = {
  id: AdminNavId;
  to: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  secondary?: boolean;
  soon?: boolean;
  inBottomNav?: boolean;
  isActive: (pathname: string) => boolean;
};

export const ADMIN_NAV_ITEMS: readonly AdminNavItem[] = [
  {
    id: 'dashboard',
    to: ADMIN_PATHS.dashboard,
    label: ADMIN_UI.dashboardNav,
    icon: LayoutDashboard,
    inBottomNav: true,
    isActive: isAdminDashboardSection,
  },
  {
    id: 'tours',
    to: ADMIN_PATHS.tours,
    label: ADMIN_UI.toursNav,
    icon: Map,
    inBottomNav: true,
    isActive: isAdminToursSection,
  },
  {
    id: 'schedule',
    to: ADMIN_PATHS.schedule,
    label: ADMIN_UI.scheduleNav,
    icon: CalendarDays,
    inBottomNav: true,
    isActive: isAdminScheduleSection,
  },
  {
    id: 'inbox',
    to: ADMIN_PATHS.inbox,
    label: ADMIN_UI.inboxNav,
    icon: Send,
    inBottomNav: true,
    isActive: isAdminInboxSection,
  },
  {
    id: 'users',
    to: ADMIN_PATHS.users,
    label: ADMIN_UI.usersNav,
    icon: Users,
    adminOnly: true,
    isActive: isAdminUsersSection,
  },
  {
    id: 'leads',
    to: ADMIN_PATHS.leads,
    label: ADMIN_UI.crmNav,
    icon: Inbox,
    secondary: true,
    soon: true,
    isActive: isAdminLeadsSection,
  },
];
