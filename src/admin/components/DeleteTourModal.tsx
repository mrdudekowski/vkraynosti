import type { FormEvent } from 'react';
import type { AdminTourListItem } from '../api';
import { ADMIN_UI } from '../constants/ui';
import AdminAlert from './AdminAlert';
import AdminButton from './AdminButton';
import AdminDialog from './AdminDialog';

type DeleteTourModalProps = {
  tour: AdminTourListItem;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

function errorMessage(error: string | null): string | null {
  if (error == null) return null;
  if (error === 'tour_has_dependencies') return ADMIN_UI.deleteTourDependencies;
  if (error === 'not_found') return ADMIN_UI.deleteTourNotFound;
  return ADMIN_UI.deleteTourError;
}

const DeleteTourModal = ({ tour, busy, error, onClose, onConfirm }: DeleteTourModalProps) => {
  const message = errorMessage(error);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!busy) onConfirm();
  };

  return (
    <AdminDialog
      title={ADMIN_UI.deleteTourTitle}
      titleId="admin-delete-tour-heading"
      closeLabel={ADMIN_UI.deleteTourCancel}
      onClose={onClose}
    >
      <form className="flex flex-col gap-3" onSubmit={submit}>
        <p className="text-sm text-text-primary">
          <span className="font-medium">{tour.title}</span>
        </p>
        <p className="text-sm text-text-muted">{ADMIN_UI.deleteTourWarning}</p>
        {message != null ? <AdminAlert tone="danger">{message}</AdminAlert> : null}
        <div className="flex flex-wrap gap-2">
          <AdminButton type="submit" variant="destructive" disabled={busy}>
            {busy ? ADMIN_UI.deleteTourSubmitting : ADMIN_UI.deleteTourSubmit}
          </AdminButton>
          <AdminButton type="button" variant="secondary" onClick={onClose} disabled={busy}>
            {ADMIN_UI.deleteTourCancel}
          </AdminButton>
        </div>
      </form>
    </AdminDialog>
  );
};

export default DeleteTourModal;
