import { ADMIN_UI } from '../constants/ui';
import type { AdminToastContextValue } from './adminToastContext';

export function pushAdminUndo(
  push: AdminToastContextValue['push'],
  message: string,
  onUndo: () => void,
): void {
  push({
    message,
    actionLabel: ADMIN_UI.undo,
    onAction: onUndo,
  });
}
