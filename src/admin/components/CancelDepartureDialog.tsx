import { useState } from 'react';
import { ADMIN_UI } from '../constants/ui';
import AdminButton from './AdminButton';
import AdminDialog from './AdminDialog';
import { AdminTextArea } from './AdminFields';
import AdminSelect from './AdminSelect';

export const ADMIN_CANCEL_REASON_IDS = [
  'low_attendance',
  'weather',
  'transport',
  'staff',
  'access',
  'force_majeure',
  'organizer',
  'other',
] as const;

export type AdminCancelReasonId = (typeof ADMIN_CANCEL_REASON_IDS)[number];

type CancelDepartureDialogProps = {
  onConfirm: (reasonId: AdminCancelReasonId, comment: string) => void;
  onClose: () => void;
};

const CancelDepartureDialog = ({ onConfirm, onClose }: CancelDepartureDialogProps) => {
  const [reasonId, setReasonId] = useState<AdminCancelReasonId>('low_attendance');
  const [comment, setComment] = useState('');
  const needsComment = reasonId === 'other';
  const canConfirm = !needsComment || comment.trim().length > 0;

  return (
    <AdminDialog
      title={ADMIN_UI.cancelDepartureTitle}
      titleId="admin-cancel-departure"
      closeLabel={ADMIN_UI.cancel}
      onClose={onClose}
    >
      <label className="mb-3 flex flex-col gap-1">
        <span className="text-sm font-medium text-text-primary">{ADMIN_UI.cancelDepartureReason}</span>
        <AdminSelect
          value={reasonId}
          onChange={(event) => {
            const value = event.target.value;
            if ((ADMIN_CANCEL_REASON_IDS as readonly string[]).includes(value)) {
              setReasonId(value as AdminCancelReasonId);
            }
          }}
        >
          {ADMIN_CANCEL_REASON_IDS.map((id) => (
            <option key={id} value={id}>
              {ADMIN_UI.cancelDepartureReasons[id]}
            </option>
          ))}
        </AdminSelect>
      </label>
      {needsComment ? (
        <label className="mb-3 flex flex-col gap-1">
          <span className="text-sm font-medium text-text-primary">{ADMIN_UI.cancelDepartureComment}</span>
          <AdminTextArea value={comment} onChange={(event) => setComment(event.target.value)} rows={3} />
        </label>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <AdminButton
          type="button"
          variant="destructive"
          disabled={!canConfirm}
          onClick={() => onConfirm(reasonId, comment.trim())}
        >
          {ADMIN_UI.cancelDepartureConfirm}
        </AdminButton>
        <AdminButton type="button" variant="secondary" onClick={onClose}>
          {ADMIN_UI.cancel}
        </AdminButton>
      </div>
    </AdminDialog>
  );
};

export default CancelDepartureDialog;
