import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useModalFocusTrap } from '../../hooks/useModalFocusTrap';

type AdminDialogProps = {
  title: string;
  titleId: string;
  closeLabel: string;
  initialFocusId?: string;
  onClose: () => void;
  children: ReactNode;
};

const AdminDialog = ({
  title,
  titleId,
  closeLabel,
  initialFocusId,
  onClose,
  children,
}: AdminDialogProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useCallback(() => {
    onClose();
  }, [onClose]);
  useModalFocusTrap(panelRef, onCloseRef);

  useEffect(() => {
    const previous = window.document.activeElement;
    const requested =
      initialFocusId != null ? window.document.getElementById(initialFocusId) : null;
    const first =
      requested ?? panelRef.current?.querySelector<HTMLElement>('input, button, select, textarea');
    first?.focus();
    return () => {
      if (previous instanceof HTMLElement) {
        previous.focus();
      }
    };
  }, [initialFocusId]);

  return createPortal(
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 z-overlay bg-surface-dark/70"
        aria-label={closeLabel}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-modal max-h-modal-body w-full max-w-md overflow-y-auto rounded-card border border-divider bg-surface-light p-4"
      >
        <h2 id={titleId} className="mb-3 text-base font-semibold text-text-primary">
          {title}
        </h2>
        {children}
      </div>
    </div>,
    window.document.body,
  );
};

export default AdminDialog;
