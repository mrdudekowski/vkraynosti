import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useModalFocusTrap } from '../../hooks/useModalFocusTrap';
import { useAdminViewport } from '../hooks/useAdminViewport';
import AdminIconButton from './AdminIconButton';

export type AdminSheetPlacement = 'drawer' | 'sheet' | 'fullscreen' | 'adaptive';

type AdminSheetProps = {
  title: string;
  titleId: string;
  closeLabel: string;
  placement?: AdminSheetPlacement;
  onClose: () => void;
  children: ReactNode;
};

function resolvePlacement(
  placement: AdminSheetPlacement,
  viewport: 'mobile' | 'tablet' | 'desktop',
): Exclude<AdminSheetPlacement, 'adaptive'> {
  if (placement !== 'adaptive') {
    return placement;
  }
  if (viewport === 'mobile') {
    return 'sheet';
  }
  return 'drawer';
}

const PANEL_CLASS: Record<Exclude<AdminSheetPlacement, 'adaptive'>, string> = {
  drawer:
    'relative z-modal ml-auto flex h-full w-full max-w-md flex-col overflow-hidden rounded-l-admin-overlay border-l border-divider bg-surface-light shadow-admin-overlay',
  sheet:
    'relative z-modal mt-auto flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-admin-overlay border-t border-divider bg-surface-light shadow-admin-overlay',
  fullscreen:
    'relative z-modal flex h-full w-full flex-col overflow-hidden bg-surface-light',
};

const AdminSheet = ({
  title,
  titleId,
  closeLabel,
  placement = 'adaptive',
  onClose,
  children,
}: AdminSheetProps) => {
  const viewport = useAdminViewport();
  const resolved = resolvePlacement(placement, viewport);
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useCallback(() => {
    onClose();
  }, [onClose]);
  useModalFocusTrap(panelRef, onCloseRef);

  useEffect(() => {
    const previous = window.document.activeElement;
    const first = panelRef.current?.querySelector<HTMLElement>('button, a, input, select, textarea');
    first?.focus();
    return () => {
      if (previous instanceof HTMLElement) {
        previous.focus();
      }
    };
  }, []);

  return createPortal(
    <div
      className={
        resolved === 'drawer'
          ? 'fixed inset-0 z-modal flex'
          : resolved === 'fullscreen'
            ? 'fixed inset-0 z-modal'
            : 'fixed inset-0 z-modal flex flex-col justify-end'
      }
    >
      <button
        type="button"
        className="absolute inset-0 z-overlay bg-surface-dark/40"
        aria-label={closeLabel}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={PANEL_CLASS[resolved]}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 px-4 pb-3 pt-4">
          <h2 id={titleId} className="min-w-0 text-admin-section text-text-primary">
            {title}
          </h2>
          <AdminIconButton icon={X} label={closeLabel} onClick={onClose} />
        </div>
        <div className="min-h-0 overflow-y-auto px-4 pb-4 pb-safe-bottom">{children}</div>
      </div>
    </div>,
    window.document.body,
  );
};

export default AdminSheet;
