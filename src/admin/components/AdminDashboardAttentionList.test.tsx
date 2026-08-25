import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import AdminDashboardAttentionList from './AdminDashboardAttentionList';

describe('AdminDashboardAttentionList', () => {
  it('makes the full attention row actionable and exposes its severity', () => {
    render(
      <MemoryRouter>
        <AdminDashboardAttentionList
          items={[
            {
              id: 'returned-tour',
              title: 'Мыс Льва',
              issue: 'Возвращено на доработку: проверьте программу',
              severity: 'critical',
              to: '/tours/mys-lva',
            },
          ]}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: /Мыс Льва.*Критично/i })).toHaveAttribute(
      'href',
      '/tours/mys-lva',
    );
    expect(screen.getByText('Возвращено на доработку: проверьте программу')).toBeVisible();
  });
});
