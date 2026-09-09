import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import AdminPageHeader from './AdminPageHeader';

describe('AdminPageHeader', () => {
  it('показывает контекстную навигационную цепочку', () => {
    render(
      <MemoryRouter>
        <AdminPageHeader
          title="Публикации"
          breadcrumbs={[{ label: 'Сегодня', to: '/' }, { label: 'Публикации' }]}
        />
      </MemoryRouter>,
    );

    const breadcrumbs = screen.getByRole('navigation', { name: 'Навигационная цепочка' });
    expect(screen.getByRole('link', { name: 'Сегодня' })).toHaveAttribute('href', '/');
    expect(breadcrumbs).toHaveTextContent('Публикации');
  });
});
