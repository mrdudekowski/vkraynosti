import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useModalFocusTrap } from '../../hooks/useModalFocusTrap';
import { useAdminViewport } from '../hooks/useAdminViewport';

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
    'relative z-modal ml-auto flex h-full w-full max-w-md flex-col overflow-y-auto rounded-l-admin-overlay border-l border-divider bg-surface-light p-4 shadow-admin-overlay',
  sheet:
    'relative z-modal mt-auto max-h-[85vh] w-full overflow-y-auto rounded-t-admin-overlay border-t border-divider bg-surface-light p-4 shadow-admin-overlay',
  fullscreen:
    'relative z-modal flex h-full w-full flex-col overflow-y-auto bg-surface-light p-4',
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
        <h2 id={titleId} className="mb-3 text-admin-section text-text-primary">
          {title}
        </h2>
        {children}
      </div>
    </div>,
    window.document.body,
  );
};

export default AdminSheet;
