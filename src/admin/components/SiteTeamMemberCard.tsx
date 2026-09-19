import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Trash2, Upload } from 'lucide-react';
import type { TeamContentMember } from '../../cms/siteContentDocument';
import { ADMIN_UI } from '../constants/ui';
import { SITE_CONTENT_IMAGE_ACCEPT } from '../siteContentMediaAccept';
import { resolveSiteContentAssetUrl } from '../siteContentAssetUrl';
import AdminBadge from './AdminBadge';
import AdminButton from './AdminButton';
import { AdminFieldLabel, AdminTextArea, AdminTextInput } from './AdminFields';
import AdminIcon from './AdminIcon';
import AdminIconButton from './AdminIconButton';
import AdminMediaDropzone from './AdminMediaDropzone';

export const SITE_TEAM_BIO_MAX = 1000;

type SiteTeamMemberCardProps = {
  member: TeamContentMember;
  index: number;
  total: number;
  onPatch: (patch: Partial<TeamContentMember>) => void;
  onMove: (direction: -1 | 1) => void;
  onDelete: () => void;
  onUpload: (file: File) => void;
};

const FieldVisibility = ({
  id,
  label,
  hint,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <div className="flex flex-col gap-1">
    <label className="inline-flex items-center gap-2 text-sm text-text-primary">
      <input
        id={id}
        type="checkbox"
        className="h-4 w-4 accent-brand-primary"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>{label}</span>
    </label>
    <p className="text-tooltip text-text-muted">{hint}</p>
  </div>
);

const SiteTeamMemberCard = ({
  member,
  index,
  total,
  onPatch,
  onMove,
  onDelete,
  onUpload,
}: SiteTeamMemberCardProps) => {
  const photoInputId = `${member.id}-photo`;
  const displayName = member.name.trim() || ADMIN_UI.siteMemberUntitled;
  const bioLimit = Math.max(SITE_TEAM_BIO_MAX, member.bio.length);

  return (
    <article className="admin-team-workspace">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <h3 className="text-3xl font-semibold leading-tight text-text-primary">{displayName}</h3>
          <AdminBadge tone={member.visible ? 'success' : 'draft'}>
            <span className="inline-flex items-center gap-1">
              <AdminIcon icon={member.visible ? Eye : EyeOff} size={16} />
              {member.visible ? ADMIN_UI.siteMemberOnSite : ADMIN_UI.siteMemberHidden}
            </span>
          </AdminBadge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AdminIconButton
            icon={ArrowUp}
            label={ADMIN_UI.moveUp}
            className="border border-divider"
            disabled={index === 0}
            onClick={() => onMove(-1)}
          />
          <AdminIconButton
            icon={ArrowDown}
            label={ADMIN_UI.moveDown}
            className="border border-divider"
            disabled={index === total - 1}
            onClick={() => onMove(1)}
          />
          <AdminButton
            variant="destructive"
            className="gap-2 border border-difficulty-hard-fg/30 bg-difficulty-hard-bg"
            onClick={onDelete}
          >
            <AdminIcon icon={Trash2} size={16} />
            {ADMIN_UI.removeItem}
          </AdminButton>
        </div>
      </header>

      <div className="mt-6 grid items-start gap-8 admin-desktop:grid-cols-[minmax(0,0.47fr)_minmax(0,0.53fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <div className="flex flex-col gap-2">
            <AdminFieldLabel htmlFor={photoInputId}>{ADMIN_UI.sitePhoto}</AdminFieldLabel>
            <div className="admin-team-media">
              <div className="admin-team-media-frame">
                {member.photo.url.length > 0 ? (
                  <img
                    src={resolveSiteContentAssetUrl(member.photo.url)}
                    alt={member.photo.alt || member.name}
                    width={270}
                    height={255}
                    className="h-full w-full object-cover object-center"
                  />
                ) : (
                  <div className="flex h-full min-h-60 items-center justify-center px-3 text-center text-sm text-text-muted">
                    {ADMIN_UI.sitePhotoEmpty}
                  </div>
                )}
                <label htmlFor={photoInputId} className="admin-team-photo-edit">
                  <span className="sr-only">{ADMIN_UI.siteReplacePhoto}</span>
                  <AdminIcon icon={Pencil} size={16} />
                </label>
              </div>
              <AdminMediaDropzone
                id={photoInputId}
                label={ADMIN_UI.sitePhotoHint}
                accept={SITE_CONTENT_IMAGE_ACCEPT}
                multiple={false}
                className="h-full min-h-60 gap-2 bg-transparent px-4"
                onFiles={(files) => {
                  const file = files[0];
                  if (file != null) onUpload(file);
                }}
              >
                <AdminIcon icon={Upload} size={24} className="text-text-muted" />
                <p className="text-sm font-semibold text-text-primary">{ADMIN_UI.sitePhotoUploadTitle}</p>
                <p className="text-sm text-text-muted">
                  {ADMIN_UI.sitePhotoDropLead}{' '}
                  <span className="underline">{ADMIN_UI.sitePhotoChooseFile}</span>
                </p>
                <p className="text-tooltip text-text-muted">{ADMIN_UI.sitePhotoUploadMeta}</p>
              </AdminMediaDropzone>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <AdminFieldLabel htmlFor={`${member.id}-name`}>{ADMIN_UI.siteMemberName}</AdminFieldLabel>
            <AdminTextInput
              id={`${member.id}-name`}
              value={member.name}
              onChange={(event) => onPatch({ name: event.target.value })}
            />
            <FieldVisibility
              id={`${member.id}-visible`}
              label={ADMIN_UI.siteShowMember}
              hint={ADMIN_UI.siteShowMemberHint}
              checked={member.visible}
              onChange={(visible) => onPatch({ visible })}
            />
          </div>

          <div className="flex flex-col gap-2">
            <AdminFieldLabel htmlFor={`${member.id}-alt`}>{ADMIN_UI.sitePhotoAlt}</AdminFieldLabel>
            <AdminTextInput
              id={`${member.id}-alt`}
              value={member.photo.alt}
              onChange={(event) => onPatch({ photo: { ...member.photo, alt: event.target.value } })}
            />
            <p className="text-tooltip text-text-muted">{ADMIN_UI.sitePhotoAltHint}</p>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <div className="flex flex-col gap-2">
            <AdminFieldLabel htmlFor={`${member.id}-role`}>{ADMIN_UI.siteMemberRole}</AdminFieldLabel>
            <AdminTextInput
              id={`${member.id}-role`}
              value={member.role}
              onChange={(event) => onPatch({ role: event.target.value })}
            />
            <FieldVisibility
              id={`${member.id}-role-visible`}
              label={ADMIN_UI.siteShowRole}
              hint={ADMIN_UI.siteShowRoleHint}
              checked={member.roleVisible}
              onChange={(roleVisible) => onPatch({ roleVisible })}
            />
          </div>

          <div className="flex flex-col gap-2">
            <AdminFieldLabel htmlFor={`${member.id}-experience`}>
              {ADMIN_UI.siteMemberExperience}
            </AdminFieldLabel>
            <AdminTextInput
              id={`${member.id}-experience`}
              value={member.experience}
              onChange={(event) => onPatch({ experience: event.target.value })}
            />
            <FieldVisibility
              id={`${member.id}-experience-visible`}
              label={ADMIN_UI.siteShowExperience}
              hint={ADMIN_UI.siteShowExperienceHint}
              checked={member.experienceVisible}
              onChange={(experienceVisible) => onPatch({ experienceVisible })}
            />
          </div>

          <div className="flex flex-col gap-2">
            <AdminFieldLabel htmlFor={`${member.id}-bio`}>{ADMIN_UI.siteMemberBio}</AdminFieldLabel>
            <AdminTextArea
              id={`${member.id}-bio`}
              rows={5}
              className="min-h-[7.5rem]"
              maxLength={bioLimit}
              value={member.bio}
              onChange={(event) => onPatch({ bio: event.target.value })}
            />
            <p className="text-right text-tooltip text-text-muted">
              {member.bio.length}/{SITE_TEAM_BIO_MAX}
            </p>
            <FieldVisibility
              id={`${member.id}-bio-visible`}
              label={ADMIN_UI.siteShowBio}
              hint={ADMIN_UI.siteShowBioHint}
              checked={member.bioVisible}
              onChange={(bioVisible) => onPatch({ bioVisible })}
            />
          </div>
        </div>
      </div>
    </article>
  );
};

export default SiteTeamMemberCard;
