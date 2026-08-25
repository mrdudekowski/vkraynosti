import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import AdminPermissionState from './AdminPermissionState';

describe('AdminPermissionState', () => {
  it('offers a return path from a forbidden route', () => {
    render(
      <MemoryRouter>
        <AdminPermissionState
          title="Нет доступа"
          description="Только администратор может менять пользователей."
          returnTo="/"
          returnLabel="К началу"
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'К началу' })).toHaveAttribute('href', '/');
  });
});
