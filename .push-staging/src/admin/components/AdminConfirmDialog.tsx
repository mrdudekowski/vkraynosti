import { ADMIN_UI } from '../constants/ui';
import AdminButton from './AdminButton';
import AdminDialog from './AdminDialog';

type AdminConfirmDialogProps = {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
};

const AdminConfirmDialog = ({
  title,
  description,
  confirmLabel,
  onConfirm,
  onClose,
}: AdminConfirmDialogProps) => (
  <AdminDialog title={title} titleId="admin-confirm-title" closeLabel={ADMIN_UI.cancel} onClose={onClose}>
    <p className="mb-4 text-sm text-text-muted">{description}</p>
    <div className="flex flex-wrap gap-2">
      <AdminButton type="button" variant="destructive" onClick={onConfirm}>
        {confirmLabel}
      </AdminButton>
      <AdminButton type="button" variant="secondary" onClick={onClose}>
        {ADMIN_UI.cancel}
      </AdminButton>
    </div>
  </AdminDialog>
);

export default AdminConfirmDialog;
