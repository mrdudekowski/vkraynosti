import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ADMIN_UI } from '../constants/ui';
import AdminFocalPoint from './AdminFocalPoint';

describe('AdminFocalPoint', () => {
  it('рисует маркер точки кадра', () => {
    render(
      <AdminFocalPoint objectPosition="20% 80%" onChange={vi.fn()}>
        <div className="h-24 w-24" />
      </AdminFocalPoint>,
    );

    const handle = screen.getByLabelText(ADMIN_UI.focalPoint);
    expect(handle).toHaveStyle({ left: '20%', top: '80%' });
  });
});
