import type { CrmDealStatus } from '../crm/crmDocument';
import type { AdminBadgeTone } from './components/AdminBadge';

export function crmDealStatusTone(status: CrmDealStatus): AdminBadgeTone {
  if (status === 'booked') {
    return 'success';
  }
  if (status === 'in_progress' || status === 'no_answer') {
    return 'warning';
  }
  if (status === 'declined') {
    return 'danger';
  }
  return 'info';
}
