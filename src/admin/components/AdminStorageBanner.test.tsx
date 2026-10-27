import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ADMIN_UI } from '../constants/ui';
import AdminStorageBanner from './AdminStorageBanner';

describe('AdminStorageBanner', () => {
  it('shows the storage maintenance copy', () => {
    render(<AdminStorageBanner />);
    expect(screen.getByRole('status')).toHaveTextContent(ADMIN_UI.storageBanner);
  });
});
