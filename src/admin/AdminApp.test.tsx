import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ADMIN_UI } from './constants/ui';

vi.mock('./api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./api')>();
  return { ...actual, adminMe: vi.fn(), adminLogout: vi.fn() };
});

import { adminMe } from './api';
import AdminApp from './AdminApp';

describe('AdminApp', () => {
  it('shows an editor why users management is unavailable', async () => {
    window.location.hash = '/users';
    vi.mocked(adminMe).mockResolvedValue({
      login: 'editor',
      role: 'editor',
      canPublishTours: false,
      canPublishSchedule: false,
    });

    render(<AdminApp />);

    expect(await screen.findByText(ADMIN_UI.permissionDeniedTitle)).toBeVisible();
    expect(screen.getByText(ADMIN_UI.usersPermissionDenied)).toBeVisible();
    expect(screen.getByRole('link', { name: ADMIN_UI.returnToDashboard })).toHaveAttribute(
      'href',
      '#/',
    );
  });
});
