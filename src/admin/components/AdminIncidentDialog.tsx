import { ADMIN_UI, type AdminIncidentCopy } from '../constants/ui';
import type { AdminIncident } from '../resolveAdminIncident';
import AdminButton from './AdminButton';
import AdminDialog from './AdminDialog';

type AdminIncidentDialogProps = {
  incident: AdminIncident;
  onClose: () => void;
  onRetry: () => void;
};

const AdminIncidentDialog = ({ incident, onClose, onRetry }: AdminIncidentDialogProps) => {
  const copy: AdminIncidentCopy = ADMIN_UI.incident[incident];
  const dismissible = incident === 'media_down';
  const titleId = 'admin-incident-dialog-title';

  return (
    <AdminDialog
      title={copy.title}
      titleId={titleId}
      closeLabel={ADMIN_UI.closeOverlay}
      onClose={onClose}
      dismissible={dismissible}
      alertDialog
      danger
    >
      {incident === 'media_down' ? (
        <div className="flex flex-col gap-3 text-sm text-text-primary">
          <p>{copy.can}</p>
          <p>{copy.cannot}</p>
          <p className="text-text-muted">{copy.note}</p>
        </div>
      ) : (
        <p className="text-sm text-text-primary">{copy.cannot}</p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <AdminButton type="button" variant="primary" onClick={onRetry}>
          {copy.action}
        </AdminButton>
      </div>
    </AdminDialog>
  );
};

export default AdminIncidentDialog;
