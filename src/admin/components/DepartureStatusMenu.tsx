import { useEffect, useId, useRef, useState } from 'react';
import type { AdminDeparture } from '../api';
import { ADMIN_UI } from '../constants/ui';
import {
  DEPARTURE_QUICK_STATUSES,
  isDepartureQuickStatus,
  type DepartureQuickStatus,
} from '../departureQuickStatus';
import DepartureStatus from './DepartureStatus';

type DepartureStatusMenuProps = {
  departure: AdminDeparture;
  onChange?: (status: DepartureQuickStatus) => void;
};

const DepartureStatusMenu = ({ departure, onChange }: DepartureStatusMenuProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const label = ADMIN_UI.departureStatus[departure.status];
  const canChange = onChange != null && isDepartureQuickStatus(departure.status);

  useEffect(() => {
    if (!open) {
      return;
    }
    const closeFromEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }
      setOpen(false);
      triggerRef.current?.focus();
    };
    const closeFromOutsidePointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', closeFromEscape);
    document.addEventListener('pointerdown', closeFromOutsidePointer);
    return () => {
      document.removeEventListener('keydown', closeFromEscape);
      document.removeEventListener('pointerdown', closeFromOutsidePointer);
    };
  }, [open]);

  if (!canChange) {
    return <DepartureStatus status={departure.status} compact />;
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        className="rounded-admin-control underline decoration-dotted underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`${ADMIN_UI.departureStatusMenu}: ${label}`}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((current) => !current);
        }}
      >
        <DepartureStatus status={departure.status} compact />
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute left-0 z-tooltip mt-1 min-w-44 rounded-admin-control border border-divider bg-surface-light py-1 shadow-admin-overlay"
        >
          {DEPARTURE_QUICK_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              role="menuitemradio"
              aria-checked={status === departure.status}
              className="admin-btn-ghost w-full justify-start"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setOpen(false);
                onChange(status);
              }}
            >
              {ADMIN_UI.departureStatus[status]}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default DepartureStatusMenu;
