import { Check, Eye, Link2, MapPin, Sparkles } from 'lucide-react';
import { getTourPublicPath, isValidTourSlug } from '../../constants/tourUrls';
import { ADMIN_EDITOR_SHORT_TEXT_MAX } from '../../constants/adminUiTokens';
import { type CmsTourDocument } from '../../cms/cmsTourDocument';
import type { Season } from '../../types';
import { ADMIN_UI } from '../constants/ui';
import { EDITOR_FOCUS_IDS } from '../tourEditorTabs';
import AdminButton from './AdminButton';
import AdminCharCount from './AdminCharCount';
import AdminEditorSurface from './AdminEditorSurface';
import { AdminFieldLabel, AdminTextInput } from './AdminFields';
import AdminIcon from './AdminIcon';
import AdminSelect from './AdminSelect';

type TourIdentityFieldsProps = {
  title: string;
  slug: string;
  season: Season;
  status?: CmsTourDocument['status'];
  idPrefix?: string;
  surface?: boolean;
  className?: string;
  onTitle: (value: string) => void;
  onSlug: (value: string) => void;
  onStatus?: (value: CmsTourDocument['status']) => void;
  onRegenerateSlug: () => void;
  publicHref?: string;
};

const GUEST_VISIBILITY_STATUSES = ['active', 'in_development', 'hidden'] as const;

function isGuestVisibilityStatus(
  value: string,
): value is (typeof GUEST_VISIBILITY_STATUSES)[number] {
  return (GUEST_VISIBILITY_STATUSES as readonly string[]).includes(value);
}

function guestVisibilitySelectValue(
  status: CmsTourDocument['status'],
): (typeof GUEST_VISIBILITY_STATUSES)[number] {
  if (status === 'draft') {
    return 'active';
  }
  return status;
}

const TourIdentityFields = ({
  title,
  slug,
  season,
  status,
  idPrefix = 'admin-tour',
  surface = true,
  className = '',
  onTitle,
  onSlug,
  onStatus,
  onRegenerateSlug,
  publicHref,
}: TourIdentityFieldsProps) => {
  const titleId = idPrefix === 'admin-tour' ? EDITOR_FOCUS_IDS.title : `${idPrefix}-title`;
  const slugId = idPrefix === 'admin-tour' ? EDITOR_FOCUS_IDS.slug : `${idPrefix}-slug`;
  const statusId = `${idPrefix}-guest-status`;
  const previewPath = getTourPublicPath({
    id: 'tour',
    season,
    slug: slug.trim().length > 0 ? slug.trim() : 'tur',
  });
  const titleMissing = title.trim().length === 0;
  const slugInvalid = !isValidTourSlug(slug);

  const fields = (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <span className="flex items-baseline justify-between gap-2">
          <AdminFieldLabel htmlFor={titleId} required>
            {ADMIN_UI.tourNameLabel}
          </AdminFieldLabel>
          <AdminCharCount value={title} max={ADMIN_EDITOR_SHORT_TEXT_MAX} />
        </span>
        <AdminTextInput
          id={titleId}
          value={title}
          hasError={titleMissing}
          onChange={(event) => onTitle(event.target.value)}
          required
        />
      </div>
      {status != null && onStatus != null ? (
        <div className="flex flex-col gap-1">
          <label htmlFor={statusId} className="text-sm font-medium text-text-primary">
            {ADMIN_UI.tourGuestStatusLabel}
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-text-muted">
              <AdminIcon icon={Eye} size={16} />
            </span>
            <AdminSelect
              id={statusId}
              className="pl-8"
              value={guestVisibilitySelectValue(status)}
              onChange={(event) => {
                if (isGuestVisibilityStatus(event.target.value)) {
                  onStatus(event.target.value);
                }
              }}
            >
              {GUEST_VISIBILITY_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {ADMIN_UI.tourStatus[item]}
                </option>
              ))}
            </AdminSelect>
          </div>
          <span className="text-tooltip text-text-muted">{ADMIN_UI.tourGuestStatusHint}</span>
        </div>
      ) : null}
      <div className="flex flex-col gap-1">
        <AdminFieldLabel htmlFor={slugId} required>
          {ADMIN_UI.tourSlugLabel}
        </AdminFieldLabel>
        <div className="relative">
          <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-text-muted">
            <AdminIcon icon={Link2} size={16} />
          </span>
          <AdminTextInput
            id={slugId}
            className="px-8"
            value={slug}
            hasError={slugInvalid}
            onChange={(event) => onSlug(event.target.value)}
            spellCheck={false}
          />
          {slugInvalid ? null : (
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-difficulty-easy-fg">
              <AdminIcon icon={Check} size={16} />
            </span>
          )}
        </div>
        <span className="text-tooltip text-text-muted">{ADMIN_UI.tourSlugHint}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2 rounded-admin-control bg-surface-dark/5 px-2 py-1.5">
        <span className="text-text-muted">
          <AdminIcon icon={Link2} size={16} />
        </span>
        <p className="min-w-0 flex-1 truncate text-sm text-text-muted">
          <span className="font-medium text-text-primary">{ADMIN_UI.tourUrlPreview}: </span>
          {previewPath}
        </p>
        {publicHref != null ? (
          <a
            href={publicHref}
            target="_blank"
            rel="noreferrer"
            className="admin-btn-ghost shrink-0 no-underline"
          >
            {ADMIN_UI.tourOpenOnSite}
          </a>
        ) : null}
      </div>
      <AdminButton type="button" variant="secondary" className="w-full" onClick={onRegenerateSlug}>
        <AdminIcon icon={Sparkles} size={16} className="mr-2" />
        {ADMIN_UI.regenerateSlug}
      </AdminButton>
    </div>
  );

  if (!surface) {
    return <div className="flex max-w-xl flex-col gap-2">{fields}</div>;
  }

  return (
    <AdminEditorSurface icon={MapPin} title={ADMIN_UI.identityHeading} className={className}>
      {fields}
    </AdminEditorSurface>
  );
};

export default TourIdentityFields;
