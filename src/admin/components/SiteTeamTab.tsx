import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2, UsersRound } from 'lucide-react';
import type { TeamContentDocument, TeamContentMember } from '../../cms/siteContentDocument';
import { ADMIN_UI } from '../constants/ui';
import { SITE_CONTENT_IMAGE_ACCEPT } from '../siteContentMediaAccept';
import { moveOrdered, withOrder } from '../siteContentOrder';
import { useAdminToast } from '../toast/adminToastContext';
import { pushAdminUndo } from '../toast/pushAdminUndo';
import AdminButton from './AdminButton';
import AdminConfirmDialog from './AdminConfirmDialog';
import AdminEditorSurface from './AdminEditorSurface';
import AdminEmptyState from './AdminEmptyState';
import { AdminFieldLabel, AdminTextArea, AdminTextInput } from './AdminFields';
import AdminIconButton from './AdminIconButton';
import AdminMediaDropzone from './AdminMediaDropzone';

type SiteTeamTabProps = {
  value: TeamContentDocument;
  onChange: (value: TeamContentDocument) => void;
  onUpload: (memberId: string, file: File) => Promise<void>;
};

const emptyPhoto = {
  assetId: '',
  url: '',
  mimeType: 'image/webp',
  alt: '',
};

const newMember = (order: number): TeamContentMember => ({
  id: `member-${Date.now()}`,
  name: ADMIN_UI.siteNewMemberName,
  photo: emptyPhoto,
  role: '',
  roleVisible: true,
  experience: '',
  experienceVisible: false,
  bio: '',
  bioVisible: true,
  visible: true,
  order,
});

const VisibilityCheck = ({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <label className="inline-flex min-h-11 items-center gap-2 text-sm text-text-primary">
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
    />
    <span>{label}</span>
  </label>
);

const SiteTeamTab = ({ value, onChange, onUpload }: SiteTeamTabProps) => {
  const { push } = useAdminToast();
  const [pendingDelete, setPendingDelete] = useState<TeamContentMember | null>(null);
  const members = [...value.members].sort((left, right) => left.order - right.order);

  const replace = (nextMembers: TeamContentMember[], message?: string) => {
    const previous = value.members;
    onChange({ ...value, members: nextMembers });
    if (message != null) {
      pushAdminUndo(push, message, () => onChange({ ...value, members: previous }));
    }
  };

  const patchMember = (memberId: string, patch: Partial<TeamContentMember>) => {
    onChange({
      ...value,
      members: value.members.map((member) =>
        member.id === memberId ? { ...member, ...patch } : member,
      ),
    });
  };

  return (
    <section
      id="admin-panel-team"
      role="tabpanel"
      aria-labelledby="admin-tab-team"
      className="flex flex-col gap-3"
    >
      <AdminEditorSurface icon={UsersRound} title={ADMIN_UI.siteTabTeam} hint={ADMIN_UI.siteTeamHint}>
        {members.length === 0 ? (
          <AdminEmptyState
            title={ADMIN_UI.siteTeamEmpty}
            description={ADMIN_UI.siteTeamEmptyHint}
            action={
              <AdminButton
                variant="secondary"
                onClick={() => replace([...value.members, newMember(value.members.length)])}
              >
                <Plus className="mr-2" size={16} strokeWidth={1.75} aria-hidden />
                {ADMIN_UI.siteAddMember}
              </AdminButton>
            }
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {members.map((member, index) => (
              <li key={member.id} className="rounded-admin-control border border-divider p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong className="min-w-0 truncate">
                    {member.name.trim() || ADMIN_UI.siteMemberUntitled}
                  </strong>
                  <div className="flex flex-wrap items-center gap-1">
                    <VisibilityCheck
                      id={`${member.id}-visible`}
                      label={ADMIN_UI.siteShowMember}
                      checked={member.visible}
                      onChange={(visible) => patchMember(member.id, { visible })}
                    />
                    <AdminIconButton
                      icon={ChevronUp}
                      label={ADMIN_UI.moveUp}
                      disabled={index === 0}
                      onClick={() => replace(moveOrdered(members, index, -1))}
                    />
                    <AdminIconButton
                      icon={ChevronDown}
                      label={ADMIN_UI.moveDown}
                      disabled={index === members.length - 1}
                      onClick={() => replace(moveOrdered(members, index, 1))}
                    />
                    <AdminIconButton
                      icon={Trash2}
                      label={ADMIN_UI.removeItem}
                      danger
                      onClick={() => setPendingDelete(member)}
                    />
                  </div>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-[8rem_minmax(0,1fr)]">
                  <div className="flex flex-col gap-2">
                    <div className="aspect-square overflow-hidden rounded-admin-control bg-surface-dark/5">
                      {member.photo.url.length > 0 ? (
                        <img
                          src={member.photo.url}
                          alt={member.photo.alt || member.name}
                          width={128}
                          height={128}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center px-2 text-center text-tooltip text-text-muted">
                          {ADMIN_UI.sitePhoto}
                        </div>
                      )}
                    </div>
                    <AdminMediaDropzone
                      id={`${member.id}-photo`}
                      label={ADMIN_UI.sitePhotoHint}
                      accept={SITE_CONTENT_IMAGE_ACCEPT}
                      multiple={false}
                      onFiles={(files) => {
                        const file = files[0];
                        if (file != null) void onUpload(member.id, file);
                      }}
                    />
                    <div className="flex flex-col gap-1">
                      <AdminFieldLabel htmlFor={`${member.id}-alt`}>{ADMIN_UI.sitePhotoAlt}</AdminFieldLabel>
                      <AdminTextInput
                        id={`${member.id}-alt`}
                        value={member.photo.alt}
                        onChange={(event) =>
                          patchMember(member.id, {
                            photo: { ...member.photo, alt: event.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <AdminFieldLabel htmlFor={`${member.id}-name`} required>
                        {ADMIN_UI.siteMemberName}
                      </AdminFieldLabel>
                      <AdminTextInput
                        id={`${member.id}-name`}
                        value={member.name}
                        onChange={(event) => patchMember(member.id, { name: event.target.value })}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <AdminFieldLabel htmlFor={`${member.id}-role`}>
                        {ADMIN_UI.siteMemberRole}
                      </AdminFieldLabel>
                      <AdminTextInput
                        id={`${member.id}-role`}
                        value={member.role}
                        onChange={(event) => patchMember(member.id, { role: event.target.value })}
                      />
                      <VisibilityCheck
                        id={`${member.id}-role-visible`}
                        label={ADMIN_UI.siteShowRole}
                        checked={member.roleVisible}
                        onChange={(roleVisible) => patchMember(member.id, { roleVisible })}
                      />
                    </div>
                    <div className="flex flex-col gap-1 sm:col-span-2">
                      <AdminFieldLabel htmlFor={`${member.id}-experience`}>
                        {ADMIN_UI.siteMemberExperience}
                      </AdminFieldLabel>
                      <AdminTextInput
                        id={`${member.id}-experience`}
                        value={member.experience}
                        onChange={(event) =>
                          patchMember(member.id, { experience: event.target.value })
                        }
                      />
                      <VisibilityCheck
                        id={`${member.id}-experience-visible`}
                        label={ADMIN_UI.siteShowExperience}
                        checked={member.experienceVisible}
                        onChange={(experienceVisible) =>
                          patchMember(member.id, { experienceVisible })
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-1 sm:col-span-2">
                      <AdminFieldLabel htmlFor={`${member.id}-bio`}>
                        {ADMIN_UI.siteMemberBio}
                      </AdminFieldLabel>
                      <AdminTextArea
                        id={`${member.id}-bio`}
                        rows={3}
                        value={member.bio}
                        onChange={(event) => patchMember(member.id, { bio: event.target.value })}
                      />
                      <VisibilityCheck
                        id={`${member.id}-bio-visible`}
                        label={ADMIN_UI.siteShowBio}
                        checked={member.bioVisible}
                        onChange={(bioVisible) => patchMember(member.id, { bioVisible })}
                      />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        {members.length > 0 ? (
          <AdminButton
            variant="secondary"
            className="self-start"
            onClick={() => replace([...value.members, newMember(value.members.length)])}
          >
            <Plus className="mr-2" size={16} strokeWidth={1.75} aria-hidden />
            {ADMIN_UI.siteAddMember}
          </AdminButton>
        ) : null}
      </AdminEditorSurface>
      {pendingDelete != null ? (
        <AdminConfirmDialog
          title={ADMIN_UI.siteDeleteMemberTitle}
          description={ADMIN_UI.siteDeleteMemberBody}
          confirmLabel={ADMIN_UI.siteDeleteMemberConfirm}
          onConfirm={() => {
            replace(
              withOrder(members.filter((member) => member.id !== pendingDelete.id)),
              ADMIN_UI.listItemRemoved,
            );
            setPendingDelete(null);
          }}
          onClose={() => setPendingDelete(null)}
        />
      ) : null}
    </section>
  );
};

export default SiteTeamTab;
