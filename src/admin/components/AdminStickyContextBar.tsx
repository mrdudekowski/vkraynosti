import { useEffect, useState, type ReactNode } from 'react';
import { CircleAlert } from 'lucide-react';
import { formatAdminBlockerCount } from '../formatAdminCopy';
import { ADMIN_UI } from '../constants/ui';
import AdminButton from './AdminButton';
import AdminDisabledHint from './AdminDisabledHint';
import AdminStatus from './AdminStatus';
import AdminIcon from './AdminIcon';
import AdminSheet from './AdminSheet';

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
  mobileCompact?: boolean;
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
  mobileCompact = false,
}: AdminStickyContextBarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    window.document.body.dataset.adminStickyBar = 'true';
    return () => {
      delete window.document.body.dataset.adminStickyBar;
    };
  }, []);

  const statusContent = (
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
  );
  const actionContent = (
    <div className="flex w-full shrink-0 flex-col gap-2 admin-desktop:w-auto admin-desktop:flex-row admin-desktop:flex-wrap admin-desktop:items-center [&_button]:w-full admin-desktop:[&_button]:w-auto">
      {secondary}
      {primary}
    </div>
  );

  return (
    <>
    <div className={`${mobileCompact ? 'hidden admin-desktop:block' : ''} sticky bottom-navbar z-season-dock border-t border-divider bg-surface-light px-4 py-2 md:bottom-0`.trim()}>
      <div className="flex flex-col gap-3 admin-desktop:flex-row admin-desktop:items-center admin-desktop:justify-between">
        {statusContent}
        {actionContent}
      </div>
    </div>
    {mobileCompact ? (
      <>
        <button
          type="button"
          className="admin-desktop:hidden fixed right-4 top-20 z-season-dock flex h-12 w-12 items-center justify-center rounded-full border border-divider bg-surface-light text-text-primary shadow-admin-overlay"
          aria-label={ADMIN_UI.openEditorActions}
          onClick={() => setMobileOpen(true)}
        >
          <AdminIcon icon={CircleAlert} size={24} />
          {blockerCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-difficulty-medium-fg px-1 text-xs font-semibold text-text-inverse">
              {blockerCount}
            </span>
          ) : null}
        </button>
        {mobileOpen ? (
          <AdminSheet
            title={ADMIN_UI.openEditorActions}
            titleId="admin-mobile-editor-actions"
            closeLabel={ADMIN_UI.closeOverlay}
            placement="sheet"
            onClose={() => setMobileOpen(false)}
          >
            <div className="flex flex-col gap-3">
              {statusContent}
              {actionContent}
            </div>
          </AdminSheet>
        ) : null}
      </>
    ) : null}
    </>
  );
};

export default AdminStickyContextBar;
