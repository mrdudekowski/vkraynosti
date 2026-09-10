import { Eye, EyeOff, MoreHorizontal } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { AdminTourListItem } from '../api';
import { adminTourGuestVisibilityAction } from '../adminTourVisibility';
import { ADMIN_UI } from '../constants/ui';
import AdminIcon from './AdminIcon';
import AdminIconButton from './AdminIconButton';

type AdminTourActionsMenuProps = {
  tour: AdminTourListItem;
  open: boolean;
  busy: boolean;
  onOpenChange: (open: boolean) => void;
  onHide: () => void;
  onShow: () => void;
  queuesVisibility?: boolean;
};

const AdminTourActionsMenu = ({
  tour,
  open,
  busy,
  onOpenChange,
  onHide,
  onShow,
  queuesVisibility = false,
}: AdminTourActionsMenuProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const action = adminTourGuestVisibilityAction(tour);

  useEffect(() => {
    if (!open) {
      return;
    }

    const closeFromEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }
      onOpenChange(false);
      triggerRef.current?.focus();
    };
    const closeFromOutsidePointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', closeFromEscape);
    document.addEventListener('pointerdown', closeFromOutsidePointer);
    return () => {
      document.removeEventListener('keydown', closeFromEscape);
      document.removeEventListener('pointerdown', closeFromOutsidePointer);
    };
  }, [onOpenChange, open]);

  if (action == null) {
    return null;
  }

  return (
    <div ref={rootRef} className="relative">
      <AdminIconButton
        ref={triggerRef}
        icon={MoreHorizontal}
        label={ADMIN_UI.tourMenu}
        disabled={busy}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onOpenChange(!open);
        }}
      />
      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-tooltip mt-1 w-56 rounded-admin-control border border-divider bg-surface-light py-1 shadow-admin-overlay"
        >
          {action === 'hide' ? (
            <button
              type="button"
              role="menuitem"
              className="admin-btn-ghost w-full justify-start gap-2"
              disabled={busy}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onOpenChange(false);
                onHide();
              }}
            >
              <AdminIcon icon={EyeOff} size={16} />
              {queuesVisibility ? ADMIN_UI.tourHideQueuedAction : ADMIN_UI.tourHideFromSite}
            </button>
          ) : (
            <button
              type="button"
              role="menuitem"
              className="admin-btn-ghost w-full justify-start gap-2"
              disabled={busy}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onOpenChange(false);
                onShow();
              }}
            >
              <AdminIcon icon={Eye} size={16} />
              {ADMIN_UI.tourShowOnSite}
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default AdminTourActionsMenu;
