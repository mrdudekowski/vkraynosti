import { UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CMS_PASSWORD_MIN_LENGTH } from '../cms/cmsUsers';
import {
  adminDeleteUser,
  adminListUsers,
  adminUpdateUser,
  type AdminSession,
  type AdminUser,
} from './api';
import { ADMIN_UI } from './constants/ui';
import { useAdminToast } from './toast/adminToastContext';
import AdminAlert from './components/AdminAlert';
import AdminBadge from './components/AdminBadge';
import AdminButton from './components/AdminButton';
import AdminConfirmDialog from './components/AdminConfirmDialog';
import AdminDataList from './components/AdminDataList';
import AdminEmptyState from './components/AdminEmptyState';
import { AdminTextInput } from './components/AdminFields';
import AdminPageFrame from './components/AdminPageFrame';
import AdminPageHeader from './components/AdminPageHeader';
import AdminSelect from './components/AdminSelect';
import AdminSheet from './components/AdminSheet';
import AdminSkeleton from './components/AdminSkeleton';
import AdminStatus from './components/AdminStatus';
import CreateUserModal from './components/CreateUserModal';

function isCmsRole(value: string): value is AdminUser['role'] {
  return value === 'admin' || value === 'editor';
}

function userAccessSummary(user: AdminUser): string {
  if (user.role === 'admin') {
    return ADMIN_UI.fullAccess;
  }
  const parts: string[] = [];
  if (user.canPublishTours) {
    parts.push(ADMIN_UI.inboxTabTours);
  }
  if (user.canPublishSchedule) {
    parts.push(ADMIN_UI.inboxTabSchedule);
  }
  return parts.length > 0 ? parts.join(', ') : ADMIN_UI.usersDraftOnly;
}

type UsersPageProps = {
  session: AdminSession;
};

type UserAccessPatch = {
  role?: AdminUser['role'];
  canPublishTours?: boolean;
  canPublishSchedule?: boolean;
};

type PendingAccess = {
  login: string;
  patch: UserAccessPatch;
  description: string;
};

type UserDrawerProps = {
  user: AdminUser;
  sessionLogin: string;
  password: string;
  onPasswordChange: (value: string) => void;
  onUsers: (users: AdminUser[]) => void;
  onStatus: (message: string) => void;
  onClose: () => void;
  onDelete: () => void;
  onRequestAccess: (patch: UserAccessPatch, description: string) => void;
};

const UserDrawer = ({
  user,
  sessionLogin,
  password,
  onPasswordChange,
  onUsers,
  onStatus,
  onClose,
  onDelete,
  onRequestAccess,
}: UserDrawerProps) => {
  const { push } = useAdminToast();

  return (
    <AdminSheet
      title={user.login}
      titleId="admin-user-drawer-heading"
      closeLabel={ADMIN_UI.closeOverlay}
      onClose={onClose}
    >
      <div className="flex flex-col gap-4">
        <AdminStatus level="secondary">{userAccessSummary(user)}</AdminStatus>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-text-primary">{ADMIN_UI.roleLabel}</span>
          <AdminSelect
            value={user.role}
            aria-label={`${user.login}: ${ADMIN_UI.roleLabel}`}
            onChange={(event) => {
              const nextRole = event.target.value;
              if (!isCmsRole(nextRole) || nextRole === user.role) {
                return;
              }
              onRequestAccess({ role: nextRole }, ADMIN_UI.usersRoleConfirm);
            }}
          >
            <option value="editor">{ADMIN_UI.roleEditor}</option>
            <option value="admin">{ADMIN_UI.roleAdmin}</option>
          </AdminSelect>
        </label>
        {user.role === 'admin' ? (
          <p className="text-sm text-text-muted">{ADMIN_UI.fullAccess}</p>
        ) : (
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm text-text-primary">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={user.canPublishTours}
                aria-label={`${user.login}: ${ADMIN_UI.publishToursFlag}`}
                onChange={(event) => {
                  onRequestAccess(
                    { canPublishTours: event.target.checked },
                    ADMIN_UI.usersPublishFlagConfirm,
                  );
                }}
              />
              {ADMIN_UI.publishToursFlag}
            </label>
            <label className="flex items-center gap-2 text-sm text-text-primary">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={user.canPublishSchedule}
                aria-label={`${user.login}: ${ADMIN_UI.publishScheduleFlag}`}
                onChange={(event) => {
                  onRequestAccess(
                    { canPublishSchedule: event.target.checked },
                    ADMIN_UI.usersPublishFlagConfirm,
                  );
                }}
              />
              {ADMIN_UI.publishScheduleFlag}
            </label>
          </div>
        )}
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-text-primary">{ADMIN_UI.newPasswordLabel}</span>
          <AdminTextInput
            id={`pwd-${user.login}`}
            type="password"
            autoComplete="new-password"
            aria-label={`${ADMIN_UI.newPasswordLabel} ${user.login}`}
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
          />
        </label>
        <AdminButton
          type="button"
          variant="secondary"
          disabled={password.length < CMS_PASSWORD_MIN_LENGTH}
          onClick={() => {
            void adminUpdateUser(user.login, { password })
              .then((items) => {
                onUsers(items);
                onPasswordChange('');
                push({ message: ADMIN_UI.passwordChanged });
              })
              .catch(() => onStatus(ADMIN_UI.userError));
          }}
        >
          {ADMIN_UI.changePassword}
        </AdminButton>
        <AdminButton
          type="button"
          variant="destructive"
          disabled={user.login === sessionLogin}
          aria-label={`${ADMIN_UI.deleteUser} ${user.login}`}
          onClick={onDelete}
        >
          {ADMIN_UI.removeItem}
        </AdminButton>
      </div>
    </AdminSheet>
  );
};

const UsersPage = ({ session }: UsersPageProps) => {
  const { push } = useAdminToast();
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [passwordEdits, setPasswordEdits] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [pendingAccess, setPendingAccess] = useState<PendingAccess | null>(null);
  const [selectedLogin, setSelectedLogin] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void adminListUsers()
      .then((items) => {
        if (!cancelled) {
          setUsers(items);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStatus(ADMIN_UI.userError);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = users?.find((user) => user.login === selectedLogin) ?? null;

  return (
    <AdminPageFrame variant="compact">
      <AdminPageHeader
        title={ADMIN_UI.usersTitle}
        description={ADMIN_UI.usersDescription}
        action={
          <AdminButton type="button" onClick={() => setCreating(true)}>
            {ADMIN_UI.addUser}
          </AdminButton>
        }
      />
      {status != null ? <AdminAlert tone="neutral">{status}</AdminAlert> : null}
      {users == null ? (
        <AdminSkeleton variant="list" count={4} />
      ) : users.length === 0 ? (
        <AdminEmptyState
          title={ADMIN_UI.usersEmpty}
          description={ADMIN_UI.usersEmptyHint}
          icon={UserPlus}
        />
      ) : (
        <AdminDataList
          titleHeader={ADMIN_UI.loginLabel}
          statusHeader={ADMIN_UI.columnRole}
          metaHeader={ADMIN_UI.columnAccess}
          items={users.map((user) => ({
            id: user.login,
            label: user.login,
            title: user.login,
            status: (
              <AdminBadge tone={user.role === 'admin' ? 'info' : 'neutral'}>
                {user.role === 'admin' ? ADMIN_UI.roleAdmin : ADMIN_UI.roleEditor}
              </AdminBadge>
            ),
            meta: userAccessSummary(user),
            onActivate: () => setSelectedLogin(user.login),
          }))}
        />
      )}
      {selected != null ? (
        <UserDrawer
          user={selected}
          sessionLogin={session.login}
          password={passwordEdits[selected.login] ?? ''}
          onPasswordChange={(value) =>
            setPasswordEdits((current) => ({ ...current, [selected.login]: value }))
          }
          onUsers={setUsers}
          onStatus={setStatus}
          onClose={() => setSelectedLogin(null)}
          onDelete={() => {
            setPendingDelete(selected.login);
            setSelectedLogin(null);
          }}
          onRequestAccess={(patch, description) => {
            setPendingAccess({ login: selected.login, patch, description });
          }}
        />
      ) : null}
      {creating ? (
        <CreateUserModal
          onClose={() => setCreating(false)}
          onCreated={(next) => {
            setUsers(next);
            setCreating(false);
            push({ message: ADMIN_UI.userCreated });
          }}
        />
      ) : null}
      {pendingAccess != null ? (
        <AdminConfirmDialog
          title={ADMIN_UI.usersTitle}
          description={pendingAccess.description}
          confirmLabel={ADMIN_UI.usersAccessConfirm}
          onClose={() => setPendingAccess(null)}
          onConfirm={() => {
            const next = pendingAccess;
            setPendingAccess(null);
            void adminUpdateUser(next.login, next.patch)
              .then(setUsers)
              .catch((error: unknown) => {
                setStatus(
                  error instanceof Error && error.message === 'last_admin'
                    ? ADMIN_UI.lastAdmin
                    : ADMIN_UI.userError,
                );
              });
          }}
        />
      ) : null}
      {pendingDelete != null ? (
        <AdminConfirmDialog
          title={ADMIN_UI.deleteUserTitle}
          description={ADMIN_UI.deleteUserBody}
          confirmLabel={ADMIN_UI.deleteUserConfirm}
          onClose={() => setPendingDelete(null)}
          onConfirm={() => {
            const login = pendingDelete;
            setPendingDelete(null);
            void adminDeleteUser(login)
              .then(setUsers)
              .catch((error: unknown) => {
                setStatus(
                  error instanceof Error && error.message === 'cannot_delete_self'
                    ? ADMIN_UI.cannotDeleteSelf
                    : error instanceof Error && error.message === 'last_admin'
                      ? ADMIN_UI.lastAdmin
                      : ADMIN_UI.userError,
                );
              });
          }}
        />
      ) : null}
    </AdminPageFrame>
  );
};

export default UsersPage;
