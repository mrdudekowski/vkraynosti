import { useCallback, useEffect, useRef, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useModalFocusTrap } from '../../hooks/useModalFocusTrap';
import AdminIconButton from './AdminIconButton';

type AdminDialogProps = {
  title: string;
  titleId: string;
  closeLabel: string;
  initialFocusId?: string;
  size?: 'md' | 'lg';
  onClose: () => void;
  restoreFocusRef?: RefObject<HTMLElement | null>;
  allowUnderlyingPointerEvents?: boolean;
  dismissible?: boolean;
  alertDialog?: boolean;
  danger?: boolean;
  children: ReactNode;
};

const PANEL_WIDTH: Record<NonNullable<AdminDialogProps['size']>, string> = {
  md: 'max-w-md',
  lg: 'max-w-xl',
};

const AdminDialog = ({
  title,
  titleId,
  closeLabel,
  initialFocusId,
  size = 'md',
  onClose,
  restoreFocusRef,
  allowUnderlyingPointerEvents = false,
  dismissible = true,
  alertDialog = false,
  danger = false,
  children,
}: AdminDialogProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useCallback(() => {
    if (dismissible) {
      onClose();
    }
  }, [dismissible, onClose]);
  useModalFocusTrap(panelRef, onCloseRef);

  useEffect(() => {
    const previous = window.document.activeElement;
    const restoreTarget = restoreFocusRef?.current;
    const requested =
      initialFocusId != null ? window.document.getElementById(initialFocusId) : null;
    const first =
      requested ?? panelRef.current?.querySelector<HTMLElement>('input, button, select, textarea');
    first?.focus();
    return () => {
      const target = restoreTarget ?? previous;
      if (target instanceof HTMLElement) target.focus();
    };
  }, [initialFocusId, restoreFocusRef]);

  return createPortal(
    <div className={`fixed inset-0 z-modal-raised flex items-center justify-center p-4 ${allowUnderlyingPointerEvents ? 'pointer-events-none' : ''}`}>
      <button
        type="button"
        className={`absolute inset-0 z-overlay bg-surface-dark/70 ${allowUnderlyingPointerEvents ? 'pointer-events-none' : ''}`}
        aria-label={closeLabel}
        onClick={onCloseRef}
        tabIndex={dismissible ? undefined : -1}
      />
      <div
        ref={panelRef}
        role={alertDialog ? 'alertdialog' : 'dialog'}
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative z-modal-raised flex max-h-modal-body w-full ${PANEL_WIDTH[size]} flex-col overflow-hidden rounded-admin-overlay border bg-surface-light shadow-admin-overlay pointer-events-auto ${
          danger ? 'border-difficulty-hard-fg/30' : 'border-divider'
        }`}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 px-4 pb-3 pt-4">
          <h2 id={titleId} className="min-w-0 text-base font-semibold text-text-primary">
            {title}
          </h2>
          {dismissible ? <AdminIconButton icon={X} label={closeLabel} onClick={onClose} /> : null}
        </div>
        <div className="min-h-0 overflow-y-auto px-4 pb-4 pb-safe-bottom">{children}</div>
      </div>
    </div>,
    window.document.body,
  );
};

export default AdminDialog;
