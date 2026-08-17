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
import AdminAlert from './components/AdminAlert';
import AdminBadge from './components/AdminBadge';
import AdminButton from './components/AdminButton';
import AdminConfirmDialog from './components/AdminConfirmDialog';
import AdminEmptyState from './components/AdminEmptyState';
import { AdminTextInput } from './components/AdminFields';
import AdminPageHeader from './components/AdminPageHeader';
import AdminSelect from './components/AdminSelect';
import CreateUserModal from './components/CreateUserModal';

function isCmsRole(value: string): value is AdminUser['role'] {
  return value === 'admin' || value === 'editor';
}

type UsersPageProps = {
  session: AdminSession;
};

const UsersPage = ({ session }: UsersPageProps) => {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [passwordEdits, setPasswordEdits] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

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

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
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
        <p className="text-sm text-text-muted">{ADMIN_UI.loading}</p>
      ) : users.length === 0 ? (
        <AdminEmptyState title={ADMIN_UI.usersEmpty} description={ADMIN_UI.usersEmptyHint} />
      ) : (
        <ul className="flex flex-col">
          {users.map((user) => (
            <li
              key={user.login}
              className="flex flex-col gap-2 border-b border-divider py-3 last:border-b-0"
            >
              <div className="flex min-w-0 items-center gap-2">
                <p className="min-w-0 truncate font-medium text-text-primary">{user.login}</p>
                <AdminBadge tone={user.role === 'admin' ? 'info' : 'neutral'}>
                  {user.role === 'admin' ? ADMIN_UI.roleAdmin : ADMIN_UI.roleEditor}
                </AdminBadge>
              </div>
              <div className="flex flex-wrap items-end gap-2">
                <label className="flex w-36 flex-col gap-1">
                  <span className="text-sm font-medium text-text-primary">{ADMIN_UI.roleLabel}</span>
                  <AdminSelect
                    value={user.role}
                    aria-label={`${user.login}: ${ADMIN_UI.roleLabel}`}
                    onChange={(event) => {
                      const nextRole = event.target.value;
                      if (!isCmsRole(nextRole)) {
                        return;
                      }
                      void adminUpdateUser(user.login, { role: nextRole })
                        .then(setUsers)
                        .catch((error: unknown) => {
                          setStatus(
                            error instanceof Error && error.message === 'last_admin'
                              ? ADMIN_UI.lastAdmin
                              : ADMIN_UI.userError,
                          );
                        });
                    }}
                  >
                    <option value="editor">{ADMIN_UI.roleEditor}</option>
                    <option value="admin">{ADMIN_UI.roleAdmin}</option>
                  </AdminSelect>
                </label>
                <label className="flex min-w-40 flex-1 flex-col gap-1">
                  <span className="text-sm font-medium text-text-primary">
                    {ADMIN_UI.newPasswordLabel}
                  </span>
                  <AdminTextInput
                    id={`pwd-${user.login}`}
                    type="password"
                    autoComplete="new-password"
                    aria-label={`${ADMIN_UI.newPasswordLabel} ${user.login}`}
                    value={passwordEdits[user.login] ?? ''}
                    onChange={(event) =>
                      setPasswordEdits((current) => ({
                        ...current,
                        [user.login]: event.target.value,
                      }))
                    }
                  />
                </label>
                <AdminButton
                  type="button"
                  variant="secondary"
                  disabled={(passwordEdits[user.login] ?? '').length < CMS_PASSWORD_MIN_LENGTH}
                  onClick={() => {
                    const nextPassword = passwordEdits[user.login] ?? '';
                    void adminUpdateUser(user.login, { password: nextPassword })
                      .then((items) => {
                        setUsers(items);
                        setPasswordEdits((current) => ({ ...current, [user.login]: '' }));
                        setStatus(ADMIN_UI.passwordChanged);
                      })
                      .catch(() => setStatus(ADMIN_UI.userError));
                  }}
                >
                  {ADMIN_UI.changePassword}
                </AdminButton>
                <AdminButton
                  type="button"
                  variant="destructive"
                  disabled={user.login === session.login}
                  aria-label={`${ADMIN_UI.deleteUser} ${user.login}`}
                  onClick={() => setPendingDelete(user.login)}
                >
                  {ADMIN_UI.removeItem}
                </AdminButton>
              </div>
            </li>
          ))}
        </ul>
      )}
      {creating ? (
        <CreateUserModal
          onClose={() => setCreating(false)}
          onCreated={(next) => {
            setUsers(next);
            setCreating(false);
            setStatus(ADMIN_UI.userCreated);
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
    </div>
  );
};

export default UsersPage;
