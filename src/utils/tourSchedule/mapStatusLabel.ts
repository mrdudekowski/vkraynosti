import { UI } from '../../constants/ui';
import type { TourScheduleStatus } from '../../types/tourSchedule';

export const mapStatusLabel = (status: TourScheduleStatus): string => {
  switch (status) {
    case 'open':
      return UI.tourCalendar.status.open;
    case 'planned':
      return UI.tourCalendar.status.planned;
    case 'full':
      return UI.tourCalendar.status.full;
    case 'cancelled':
      return '';
  }
};
