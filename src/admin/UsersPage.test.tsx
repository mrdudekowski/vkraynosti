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

import { adminCreateUser, adminDeleteUser, adminListUsers } from './api';
import UsersPage from './UsersPage';

const session = { login: 'alice', role: 'admin' as const };

describe('UsersPage', () => {
  beforeEach(() => {
    vi.mocked(adminListUsers).mockResolvedValue([
      { login: 'alice', role: 'admin' },
      { login: 'bob', role: 'editor' },
    ]);
    vi.mocked(adminCreateUser).mockResolvedValue([
      { login: 'alice', role: 'admin' },
      { login: 'bob', role: 'editor' },
      { login: 'cara', role: 'editor' },
    ]);
    vi.mocked(adminDeleteUser).mockResolvedValue([{ login: 'alice', role: 'admin' }]);
  });

  it('держит форму создания в модалке, а не на странице', async () => {
    const user = userEvent.setup();
    render(<UsersPage session={session} />);

    await screen.findByText('bob');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(ADMIN_UI.loginLabel)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: ADMIN_UI.addUser }));
    expect(screen.getByRole('dialog', { name: ADMIN_UI.addUserTitle })).toBeInTheDocument();
    expect(screen.getByLabelText(ADMIN_UI.loginLabel)).toBeInTheDocument();
  });

  it('не удаляет пользователя без подтверждения', async () => {
    const user = userEvent.setup();
    render(<UsersPage session={session} />);

    await screen.findByText('bob');
    await user.click(screen.getByRole('button', { name: `${ADMIN_UI.deleteUser} bob` }));

    expect(adminDeleteUser).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: ADMIN_UI.deleteUserTitle })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: ADMIN_UI.deleteUserConfirm }));
    expect(adminDeleteUser).toHaveBeenCalledWith('bob');
  });
});
