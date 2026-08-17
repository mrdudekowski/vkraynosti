import { useState, type FormEvent } from 'react';
import { CMS_PASSWORD_MIN_LENGTH } from '../../cms/cmsUsers';
import { adminCreateUser, type AdminUser } from '../api';
import { ADMIN_UI } from '../constants/ui';
import AdminAlert from './AdminAlert';
import AdminButton from './AdminButton';
import AdminDialog from './AdminDialog';
import { AdminTextInput } from './AdminFields';
import AdminSelect from './AdminSelect';

function isCmsRole(value: string): value is AdminUser['role'] {
  return value === 'admin' || value === 'editor';
}

type CreateUserModalProps = {
  onClose: () => void;
  onCreated: (users: AdminUser[]) => void;
};

const CreateUserModal = ({ onClose, onCreated }: CreateUserModalProps) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<AdminUser['role']>('editor');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const next = await adminCreateUser(login, password, role);
      onCreated(next);
    } catch (caught) {
      setError(
        caught instanceof Error && caught.message === 'login_taken'
          ? ADMIN_UI.loginTaken
          : ADMIN_UI.userError,
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminDialog
      title={ADMIN_UI.addUserTitle}
      titleId="admin-create-user-heading"
      closeLabel={ADMIN_UI.cancel}
      onClose={onClose}
    >
      <form className="flex flex-col gap-3" onSubmit={(event) => void onSubmit(event)}>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-text-primary">{ADMIN_UI.loginLabel}</span>
          <AdminTextInput
            id="new-user-login"
            autoComplete="off"
            value={login}
            onChange={(event) => setLogin(event.target.value)}
            required
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-text-primary">{ADMIN_UI.passwordLabel}</span>
          <AdminTextInput
            id="new-user-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={CMS_PASSWORD_MIN_LENGTH}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-text-primary">{ADMIN_UI.roleLabel}</span>
          <AdminSelect
            value={role}
            onChange={(event) => {
              const nextRole = event.target.value;
              if (isCmsRole(nextRole)) {
                setRole(nextRole);
              }
            }}
          >
            <option value="editor">{ADMIN_UI.roleEditor}</option>
            <option value="admin">{ADMIN_UI.roleAdmin}</option>
          </AdminSelect>
        </label>
        {error != null ? <AdminAlert tone="danger">{error}</AdminAlert> : null}
        <div className="flex flex-wrap gap-2">
          <AdminButton type="submit" disabled={busy || login.trim().length === 0}>
            {ADMIN_UI.addUser}
          </AdminButton>
          <AdminButton type="button" variant="secondary" onClick={onClose} disabled={busy}>
            {ADMIN_UI.cancel}
          </AdminButton>
        </div>
      </form>
    </AdminDialog>
  );
};

export default CreateUserModal;
