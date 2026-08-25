import { GUEST_SCHEDULE_STATUSES } from '../cms/publishQueue';
import type { CmsTourDocument } from '../cms/cmsTourDocument';
import { adminTourVisibility } from './adminTourVisibility';

export function guestWillSeeDeparture(input: {
  tour: { status: CmsTourDocument['status']; published: boolean };
  status: 'planned' | 'open' | 'full' | 'cancelled' | 'completed';
}): boolean {
  if (adminTourVisibility(input.tour) !== 'on_site') {
    return false;
  }
  return (GUEST_SCHEDULE_STATUSES as readonly string[]).includes(input.status);
}
