import { useEffect, type ReactNode } from 'react';
import { formatAdminBlockerCount } from '../formatAdminCopy';
import { ADMIN_UI } from '../constants/ui';
import AdminButton from './AdminButton';
import AdminDisabledHint from './AdminDisabledHint';
import AdminStatus from './AdminStatus';

type AdminStickyContextBarProps = {
  entityState?: ReactNode;
  readiness?: string;
  blockerCount?: number;
  saveHint?: string | null;
  feedback?: ReactNode;
  disabledHint?: string | null;
  onShowProblems?: () => void;
  primary: ReactNode;
  secondary?: ReactNode;
};

const AdminStickyContextBar = ({
  entityState,
  readiness,
  blockerCount = 0,
  saveHint,
  feedback,
  disabledHint,
  onShowProblems,
  primary,
  secondary,
}: AdminStickyContextBarProps) => {
  useEffect(() => {
    window.document.body.dataset.adminStickyBar = 'true';
    return () => {
      delete window.document.body.dataset.adminStickyBar;
    };
  }, []);

  return (
    <div className="sticky bottom-navbar z-season-dock border-t border-divider bg-surface-light px-4 py-2 md:bottom-0">
      <div className="flex flex-col gap-3 admin-desktop:flex-row admin-desktop:items-center admin-desktop:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm text-text-muted">
          {entityState}
          {readiness != null ? <span>· {readiness}</span> : null}
          {blockerCount > 0 ? (
            <AdminStatus level="attention" tone="warning">
              {formatAdminBlockerCount(blockerCount)}
            </AdminStatus>
          ) : null}
          {saveHint != null ? <span className="text-text-primary">{saveHint}</span> : null}
          {feedback}
          {disabledHint != null ? (
            <AdminDisabledHint id="admin-sticky-disabled-hint">{disabledHint}</AdminDisabledHint>
          ) : null}
          {onShowProblems != null && blockerCount > 0 ? (
            <AdminButton type="button" variant="ghost" onClick={onShowProblems}>
              {ADMIN_UI.showProblems}
            </AdminButton>
          ) : null}
        </div>
        <div className="flex w-full shrink-0 flex-col gap-2 admin-desktop:w-auto admin-desktop:flex-row admin-desktop:flex-wrap admin-desktop:items-center [&_button]:w-full admin-desktop:[&_button]:w-auto">
          {secondary}
          {primary}
        </div>
      </div>
    </div>
  );
};

export default AdminStickyContextBar;
