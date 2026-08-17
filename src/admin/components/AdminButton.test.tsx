import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AdminButton from './AdminButton';

describe('AdminButton', () => {
  it('даёт четыре варианта иерархии действий', () => {
    render(
      <>
        <AdminButton>Сохранить</AdminButton>
        <AdminButton variant="secondary">Опубликовать</AdminButton>
        <AdminButton variant="ghost">Выйти</AdminButton>
        <AdminButton variant="destructive">Удалить</AdminButton>
      </>,
    );

    expect(screen.getByRole('button', { name: 'Сохранить' })).toHaveClass('admin-btn-primary');
    expect(screen.getByRole('button', { name: 'Опубликовать' })).toHaveClass('admin-btn-secondary');
    expect(screen.getByRole('button', { name: 'Выйти' })).toHaveClass('admin-btn-ghost');
    expect(screen.getByRole('button', { name: 'Удалить' })).toHaveClass('admin-btn-destructive');
  });
});
