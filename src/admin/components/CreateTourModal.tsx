import { useState, type FormEvent } from 'react';
import { slugFromTitle } from '../../cms/cmsTourSlug';
import { SEASON_ORDER } from '../../constants/seasonNavbarAppearance';
import type { Season } from '../../types';
import { adminCalendarSeason } from '../adminCalendarSeason';
import { adminCreateTour } from '../api';
import { invalidateAdminTours, invalidateAdminPublishQueue } from '../adminDataCache';
import { ADMIN_UI } from '../constants/ui';
import AdminAlert from './AdminAlert';
import AdminButton from './AdminButton';
import AdminDialog from './AdminDialog';
import AdminSelect from './AdminSelect';
import TourIdentityFields from './TourIdentityFields';

type CreateTourModalProps = {
  lockedSeason?: Season;
  onClose: () => void;
  onCreated: (tourId: string) => void;
};

function isSeason(value: string): value is Season {
  return (SEASON_ORDER as readonly string[]).includes(value);
}

const CreateTourModal = ({ lockedSeason, onClose, onCreated }: CreateTourModalProps) => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [season, setSeason] = useState<Season>(lockedSeason ?? adminCalendarSeason());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onTitle = (value: string) => {
    setTitle(value);
    if (!slugManual) {
      setSlug(slugFromTitle(value));
    }
  };

  const onSlug = (value: string) => {
    setSlugManual(true);
    setSlug(value);
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextTitle = title.trim();
    if (nextTitle.length === 0) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const payload = await adminCreateTour({
        title: nextTitle,
        season,
        slug: slug.trim().length > 0 ? slug.trim() : slugFromTitle(nextTitle),
      });
      invalidateAdminTours();
      invalidateAdminPublishQueue();
      onCreated(payload.document.id);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'create_failed';
      setError(
        message === 'slug_taken'
          ? ADMIN_UI.slugTaken
          : message === 'invalid_slug'
            ? ADMIN_UI.invalidSlug
            : ADMIN_UI.createTourError,
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminDialog
      title={ADMIN_UI.createTourTitle}
      titleId="admin-create-tour-heading"
      closeLabel={ADMIN_UI.createTourCancel}
      initialFocusId="admin-create-tour-title"
      onClose={onClose}
    >
      <form className="flex flex-col gap-3" onSubmit={(event) => void onSubmit(event)}>
        {lockedSeason == null ? (
          <div className="flex flex-col gap-1">
            <label htmlFor="admin-create-tour-season" className="text-sm font-medium text-text-primary">
              {ADMIN_UI.createTourSeason}
            </label>
            <AdminSelect
              id="admin-create-tour-season"
              value={season}
              onChange={(event) => {
                if (isSeason(event.target.value)) {
                  setSeason(event.target.value);
                }
              }}
            >
              {SEASON_ORDER.map((item) => (
                <option key={item} value={item}>
                  {ADMIN_UI.seasons[item]}
                </option>
              ))}
            </AdminSelect>
          </div>
        ) : null}
        <TourIdentityFields
          idPrefix="admin-create-tour"
          surface={false}
          title={title}
          slug={slug}
          season={season}
          onTitle={onTitle}
          onSlug={onSlug}
          onRegenerateSlug={() => {
            setSlugManual(false);
            setSlug(slugFromTitle(title));
          }}
        />
        {error != null ? <AdminAlert tone="danger">{error}</AdminAlert> : null}
        <div className="flex flex-wrap gap-2">
          <AdminButton type="submit" disabled={busy || title.trim().length === 0}>
            {ADMIN_UI.createTourSubmit}
          </AdminButton>
          <AdminButton type="button" variant="secondary" onClick={onClose} disabled={busy}>
            {ADMIN_UI.createTourCancel}
          </AdminButton>
        </div>
      </form>
    </AdminDialog>
  );
};

export default CreateTourModal;
