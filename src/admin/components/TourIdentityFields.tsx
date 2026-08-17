import { getTourPublicPath } from '../../constants/tourUrls';
import type { Season } from '../../types';
import { ADMIN_UI } from '../constants/ui';
import AdminButton from './AdminButton';
import { AdminTextInput } from './AdminFields';

type TourIdentityFieldsProps = {
  title: string;
  slug: string;
  season: Season;
  idPrefix?: string;
  onTitle: (value: string) => void;
  onSlug: (value: string) => void;
  onRegenerateSlug: () => void;
};

const TourIdentityFields = ({
  title,
  slug,
  season,
  idPrefix = 'admin-tour',
  onTitle,
  onSlug,
  onRegenerateSlug,
}: TourIdentityFieldsProps) => {
  const titleId = `${idPrefix}-title`;
  const slugId = `${idPrefix}-slug`;
  const previewPath = getTourPublicPath({
    id: 'tour',
    season,
    slug: slug.trim().length > 0 ? slug.trim() : 'tur',
  });

  return (
    <div className="flex max-w-xl flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor={titleId} className="text-sm font-medium text-text-primary">
          {ADMIN_UI.tourNameLabel}
        </label>
        <AdminTextInput
          id={titleId}
          value={title}
          onChange={(event) => onTitle(event.target.value)}
          required
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={slugId} className="text-sm font-medium text-text-primary">
          {ADMIN_UI.tourSlugLabel}
        </label>
        <AdminTextInput
          id={slugId}
          value={slug}
          onChange={(event) => onSlug(event.target.value)}
          spellCheck={false}
        />
        <span className="text-tooltip text-text-muted">{ADMIN_UI.tourSlugHint}</span>
      </div>
      <p className="text-sm text-text-muted">
        <span className="font-medium text-text-primary">{ADMIN_UI.tourUrlPreview}: </span>
        {previewPath}
      </p>
      <AdminButton type="button" variant="secondary" className="self-start" onClick={onRegenerateSlug}>
        {ADMIN_UI.regenerateSlug}
      </AdminButton>
    </div>
  );
};

export default TourIdentityFields;
