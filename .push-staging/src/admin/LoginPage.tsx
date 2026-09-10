import { useState, type FormEvent } from 'react';
import { ADMIN_LOGIN_LOGO } from '../constants/images';
import AdminAlert from './components/AdminAlert';
import AdminButton from './components/AdminButton';
import { AdminTextInput } from './components/AdminFields';
import { adminLogin, type AdminSession } from './api';
import { ADMIN_UI } from './constants/ui';

type LoginPageProps = {
  onLoggedIn: (session: AdminSession) => void;
};

const LoginPage = ({ onLoggedIn }: LoginPageProps) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(false);
    try {
      const session = await adminLogin(login, password);
      onLoggedIn(session);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface-light px-4">
      <form
        onSubmit={(event) => void onSubmit(event)}
        className="flex w-full max-w-md flex-col gap-4 rounded-card border border-divider bg-surface-light p-6"
      >
        <img
          src={ADMIN_LOGIN_LOGO}
          alt={ADMIN_UI.logoAlt}
          className="mx-auto h-auto w-full max-w-xs object-contain"
        />
        <h1 className="text-xl font-semibold text-text-primary">{ADMIN_UI.loginTitle}</h1>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-text-primary">{ADMIN_UI.loginLabel}</span>
          <AdminTextInput
            id="cms-login"
            name="username"
            autoComplete="username"
            value={login}
            onChange={(event) => setLogin(event.target.value)}
            required
            hasError={error}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-text-primary">{ADMIN_UI.passwordLabel}</span>
          <AdminTextInput
            id="cms-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            hasError={error}
          />
        </label>
        {error ? <AdminAlert tone="danger">{ADMIN_UI.loginError}</AdminAlert> : null}
        <AdminButton type="submit" disabled={busy}>
          {ADMIN_UI.loginSubmit}
        </AdminButton>
      </form>
    </div>
  );
};

export default LoginPage;
