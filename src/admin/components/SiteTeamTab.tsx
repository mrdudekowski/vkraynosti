import { useState } from 'react';
import { ArrowLeft, Plus, UsersRound } from 'lucide-react';
import PlaceholderImage from '../../components/shared/PlaceholderImage';
import { IMAGES } from '../../constants/images';
import type { TeamContentDocument, TeamContentMember } from '../../cms/siteContentDocument';
import { ADMIN_UI } from '../constants/ui';
import { resolveSiteContentAssetUrl } from '../siteContentAssetUrl';
import { moveOrdered, withOrder } from '../siteContentOrder';
import { useAdminToast } from '../toast/adminToastContext';
import { pushAdminUndo } from '../toast/pushAdminUndo';
import AdminButton from './AdminButton';
import AdminConfirmDialog from './AdminConfirmDialog';
import AdminEmptyState from './AdminEmptyState';
import AdminIcon from './AdminIcon';
import { AdminOnSiteStatus } from './AdminOnSiteStatus';
import SiteTeamMemberCard from './SiteTeamMemberCard';

type SiteTeamTabProps = {
  value: TeamContentDocument;
  onChange: (value: TeamContentDocument) => void;
  onUpload: (memberId: string, file: File) => Promise<void>;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
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

const SiteTeamTab = ({
  value,
  onChange,
  onUpload,
  onSave,
  onCancel,
  isSaving,
}: SiteTeamTabProps) => {
  const { push } = useAdminToast();
  const [pendingDelete, setPendingDelete] = useState<TeamContentMember | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const members = [...value.members].sort((left, right) => left.order - right.order);
  const editingIndex = members.findIndex((member) => member.id === editingId);
  const editing = editingIndex >= 0 ? members[editingIndex] : null;

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

  const addMember = () => {
    const created = newMember(value.members.length);
    replace([...value.members, created]);
    setEditingId(created.id);
  };

  return (
    <section
      id="admin-panel-team"
      role="tabpanel"
      aria-labelledby="admin-tab-team"
      className="flex flex-col gap-5"
    >
      {editing != null ? (
        <button
          type="button"
          className="inline-flex items-center gap-2 self-start text-sm text-text-muted transition-colors hover:text-text-primary"
          onClick={() => setEditingId(null)}
        >
          <AdminIcon icon={ArrowLeft} size={16} />
          {ADMIN_UI.siteBackToMembers}
        </button>
      ) : null}

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-4xl font-semibold leading-tight text-text-primary">{ADMIN_UI.siteTabTeam}</h2>
          <p className="mt-1 text-sm text-text-muted">{ADMIN_UI.siteTeamHint}</p>
        </div>
        {editing != null ? (
          <div className="flex flex-wrap items-center gap-3">
            <AdminButton variant="secondary" className="min-h-12 px-6" disabled={isSaving} onClick={onCancel}>
              {ADMIN_UI.undo}
            </AdminButton>
            <AdminButton
              variant="primary"
              className="min-h-12 px-7"
              aria-busy={isSaving}
              disabled={isSaving}
              onClick={onSave}
            >
              {isSaving ? ADMIN_UI.saving : ADMIN_UI.siteSaveChanges}
            </AdminButton>
          </div>
        ) : null}
      </header>

      {members.length === 0 ? (
        <AdminEmptyState
          icon={UsersRound}
          title={ADMIN_UI.siteTeamEmpty}
          description={ADMIN_UI.siteTeamEmptyHint}
          action={
            <AdminButton variant="secondary" className="gap-2" onClick={addMember}>
              <AdminIcon icon={Plus} size={16} />
              {ADMIN_UI.siteAddMember}
            </AdminButton>
          }
        />
      ) : editing != null ? (
        <SiteTeamMemberCard
          member={editing}
          index={editingIndex}
          total={members.length}
          onPatch={(patch) => patchMember(editing.id, patch)}
          onMove={(direction) => {
            const next = moveOrdered(members, editingIndex, direction);
            replace(next);
          }}
          onDelete={() => setPendingDelete(editing)}
          onUpload={(file) => void onUpload(editing.id, file)}
        />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {members.map((member) => {
            const displayName = member.name.trim() || ADMIN_UI.siteMemberUntitled;
            const photoSrc =
              member.photo.url.length > 0
                ? resolveSiteContentAssetUrl(member.photo.url)
                : IMAGES.team.placeholder;
            const role = member.roleVisible ? member.role.trim() : '';

            return (
              <li key={member.id} className="flex">
                <button
                  type="button"
                  className="admin-editor-surface relative flex h-full w-full items-start gap-3 text-left"
                  onClick={() => setEditingId(member.id)}
                >
                  <PlaceholderImage
                    src={photoSrc}
                    alt={member.photo.alt || displayName}
                    className="h-28 w-36 shrink-0 rounded-admin-control"
                    imgClassName="h-full w-full object-cover object-center"
                  />
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="font-heading text-card leading-tight text-text-primary">
                      {displayName}
                    </span>
                    {role.length > 0 ? (
                      <span className="text-sm text-text-muted">{role}</span>
                    ) : null}
                    <AdminOnSiteStatus visible={member.visible} />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {members.length > 0 && editing == null ? (
        <AdminButton variant="secondary" className="self-start gap-2" onClick={addMember}>
          <AdminIcon icon={Plus} size={16} />
          {ADMIN_UI.siteAddMember}
        </AdminButton>
      ) : null}

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
            setEditingId(null);
            setPendingDelete(null);
          }}
          onClose={() => setPendingDelete(null)}
        />
      ) : null}
    </section>
  );
};

export default SiteTeamTab;
