import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ADMIN_LOGIN_LOGO } from '../constants/images';
import { ADMIN_UI } from './constants/ui';
import LoginPage from './LoginPage';

describe('LoginPage', () => {
  it('shows the login wordmark above the form', () => {
    render(<LoginPage onLoggedIn={() => undefined} />);

    expect(screen.getByRole('img', { name: ADMIN_UI.logoAlt })).toHaveAttribute('src', ADMIN_LOGIN_LOGO);
    expect(screen.getByRole('heading', { name: ADMIN_UI.loginTitle })).toBeInTheDocument();
  });
});
