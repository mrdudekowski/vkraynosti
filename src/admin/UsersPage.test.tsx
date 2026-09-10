import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ADMIN_UI } from './constants/ui';

vi.mock('./api', () => ({
  adminListUsers: vi.fn(),
  adminCreateUser: vi.fn(),
  adminUpdateUser: vi.fn(),
  adminDeleteUser: vi.fn(),
}));

import { adminCreateUser, adminDeleteUser, adminListUsers, adminUpdateUser } from './api';
import { AdminToastProvider } from './components/AdminToast';
import UsersPage from './UsersPage';

const session = {
  login: 'alice',
  role: 'admin' as const,
  canPublishTours: true,
  canPublishSchedule: true,
};

function user(
  login: string,
  role: 'admin' | 'editor',
  flags: { canPublishTours?: boolean; canPublishSchedule?: boolean } = {},
) {
  return {
    login,
    role,
    canPublishTours: flags.canPublishTours ?? false,
    canPublishSchedule: flags.canPublishSchedule ?? false,
  };
}

function renderUsers() {
  return render(
    <AdminToastProvider>
      <UsersPage session={session} />
    </AdminToastProvider>,
  );
}

describe('UsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminListUsers).mockResolvedValue([
      user('alice', 'admin'),
      user('bob', 'editor'),
    ]);
    vi.mocked(adminCreateUser).mockResolvedValue([
      user('alice', 'admin'),
      user('bob', 'editor'),
      user('cara', 'editor'),
    ]);
    vi.mocked(adminDeleteUser).mockResolvedValue([user('alice', 'admin')]);
  });

  it('держит форму создания в модалке, а не на странице', async () => {
    const user = userEvent.setup();
    renderUsers();

    await screen.findByText('bob');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(ADMIN_UI.loginLabel)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: ADMIN_UI.addUser }));
    expect(screen.getByRole('dialog', { name: ADMIN_UI.addUserTitle })).toBeInTheDocument();
    expect(screen.getByLabelText(ADMIN_UI.loginLabel)).toBeInTheDocument();
  });

  it('opens a user in a drawer instead of inline fields', async () => {
    const user = userEvent.setup();
    renderUsers();

    await screen.findByText('bob');
    expect(screen.queryByLabelText(`bob: ${ADMIN_UI.publishToursFlag}`)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'bob' }));
    expect(screen.getByRole('dialog', { name: 'bob' })).toBeInTheDocument();
    expect(screen.getByLabelText(`bob: ${ADMIN_UI.publishToursFlag}`)).toBeInTheDocument();
    expect(screen.queryByLabelText(`alice: ${ADMIN_UI.publishToursFlag}`)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: ADMIN_UI.closeOverlay }));
    await user.click(screen.getByRole('button', { name: 'alice' }));
    expect(screen.queryByLabelText(`alice: ${ADMIN_UI.publishToursFlag}`)).not.toBeInTheDocument();
    expect(screen.getAllByText(ADMIN_UI.fullAccess).length).toBeGreaterThan(0);
  });

  it('не удаляет пользователя без подтверждения', async () => {
    const user = userEvent.setup();
    renderUsers();

    await screen.findByText('bob');
    await user.click(screen.getByRole('button', { name: 'bob' }));
    await user.click(screen.getByRole('button', { name: `${ADMIN_UI.deleteUser} bob` }));

    expect(adminDeleteUser).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: ADMIN_UI.deleteUserTitle })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: ADMIN_UI.deleteUserConfirm }));
    expect(adminDeleteUser).toHaveBeenCalledWith('bob');
  });

  it('сохраняет флаги публикации редактора', async () => {
    const userEvents = userEvent.setup();
    vi.mocked(adminUpdateUser).mockResolvedValue([
      user('alice', 'admin'),
      user('bob', 'editor', { canPublishTours: true }),
    ]);
    renderUsers();

    await screen.findByText('bob');
    await userEvents.click(screen.getByRole('button', { name: 'bob' }));
    await userEvents.click(screen.getByRole('checkbox', { name: `bob: ${ADMIN_UI.publishToursFlag}` }));
    expect(adminUpdateUser).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: ADMIN_UI.usersTitle })).toBeInTheDocument();
    await userEvents.click(screen.getByRole('button', { name: ADMIN_UI.usersAccessConfirm }));
    expect(adminUpdateUser).toHaveBeenCalledWith('bob', { canPublishTours: true });
    expect(screen.queryByLabelText(`alice: ${ADMIN_UI.publishToursFlag}`)).not.toBeInTheDocument();
  });

  it('не меняет роль без подтверждения', async () => {
    const userEvents = userEvent.setup();
    vi.mocked(adminUpdateUser).mockResolvedValue([user('alice', 'admin'), user('bob', 'admin')]);
    renderUsers();

    await screen.findByText('bob');
    await userEvents.click(screen.getByRole('button', { name: 'bob' }));
    await userEvents.selectOptions(screen.getByLabelText(`bob: ${ADMIN_UI.roleLabel}`), 'admin');
    expect(adminUpdateUser).not.toHaveBeenCalled();
    expect(screen.getByText(ADMIN_UI.usersRoleConfirm)).toBeInTheDocument();
    await userEvents.click(screen.getByRole('button', { name: ADMIN_UI.usersAccessConfirm }));
    expect(adminUpdateUser).toHaveBeenCalledWith('bob', { role: 'admin' });
  });
});
