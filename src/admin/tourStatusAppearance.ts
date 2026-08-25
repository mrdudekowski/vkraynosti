import type { CmsTourDocument } from '../cms/cmsTourDocument';
import type { AdminBadgeTone } from './components/AdminBadge';

export function tourStatusTone(status: CmsTourDocument['status']): AdminBadgeTone {
  if (status === 'active') {
    return 'success';
  }
  if (status === 'in_development') {
    return 'warning';
  }
  if (status === 'hidden') {
    return 'info';
  }
  if (status === 'draft') {
    return 'draft';
  }
  return 'neutral';
}
