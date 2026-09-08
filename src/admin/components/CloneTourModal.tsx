import { useState, type FormEvent } from 'react';
import { SEASON_ORDER } from '../../constants/seasonNavbarAppearance';
import type { Season } from '../../types';
import type { AdminTourListItem } from '../api';
import { ADMIN_UI } from '../constants/ui';
import AdminAlert from './AdminAlert';
import AdminButton from './AdminButton';
import AdminDialog from './AdminDialog';
import AdminSelect from './AdminSelect';

type CloneTourModalProps = {
  tour: AdminTourListItem;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (targetSeason: Season) => void;
};

function isSeason(value: string): value is Season {
  return (SEASON_ORDER as readonly string[]).includes(value);
}

function errorMessage(error: string | null): string | null {
  if (error == null) {
    return null;
  }
  if (error === 'not_found') {
    return ADMIN_UI.cloneTourNotFound;
  }
  if (error === 'source_media_not_found') {
    return ADMIN_UI.cloneTourMediaError;
  }
  return ADMIN_UI.cloneTourError;
}

const CloneTourModal = ({ tour, busy, error, onClose, onSubmit }: CloneTourModalProps) => {
  const [season, setSeason] = useState<Season | ''>('');
  const message = errorMessage(error);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (season !== '') {
      onSubmit(season);
    }
  };

  return (
    <AdminDialog
      title={ADMIN_UI.cloneTourTitle}
      titleId="admin-clone-tour-heading"
      closeLabel={ADMIN_UI.cloneTourCancel}
      initialFocusId="admin-clone-tour-season"
      onClose={onClose}
    >
      <form className="flex flex-col gap-3" onSubmit={submit}>
        <p className="text-sm text-text-muted">
          <span className="font-medium text-text-primary">{tour.title}</span>
        </p>
        <div className="flex flex-col gap-1">
          <label htmlFor="admin-clone-tour-season" className="text-sm font-medium text-text-primary">
            {ADMIN_UI.cloneTourSeason}
          </label>
          <AdminSelect
            id="admin-clone-tour-season"
            value={season}
            disabled={busy}
            aria-invalid={message != null}
            onChange={(event) => {
              setSeason(isSeason(event.target.value) ? event.target.value : '');
            }}
          >
            <option value="">{ADMIN_UI.cloneTourSeasonPlaceholder}</option>
            {SEASON_ORDER.map((item) => (
              <option key={item} value={item}>
                {ADMIN_UI.seasons[item]}
              </option>
            ))}
          </AdminSelect>
        </div>
        <p className="text-sm text-text-muted">{ADMIN_UI.cloneTourHelper}</p>
        {message != null ? <AdminAlert tone="danger">{message}</AdminAlert> : null}
        <div className="flex flex-wrap gap-2">
          <AdminButton type="submit" disabled={busy || season === ''}>
            {busy ? ADMIN_UI.cloneTourSubmitting : ADMIN_UI.cloneTourSubmit}
          </AdminButton>
          <AdminButton type="button" variant="secondary" onClick={onClose} disabled={busy}>
            {ADMIN_UI.cloneTourCancel}
          </AdminButton>
        </div>
      </form>
    </AdminDialog>
  );
};

export default CloneTourModal;
