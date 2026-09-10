import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AdminDisabledHint from './AdminDisabledHint';

describe('AdminDisabledHint', () => {
  it('connects a disabled action explanation by id', () => {
    render(<AdminDisabledHint id="schedule-publish-hint">Нет изменений</AdminDisabledHint>);

    expect(screen.getByText('Нет изменений')).toHaveAttribute('id', 'schedule-publish-hint');
  });
});
