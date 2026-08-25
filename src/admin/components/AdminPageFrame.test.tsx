import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AdminPageFrame from './AdminPageFrame';

describe('AdminPageFrame', () => {
  it('даёт четыре ширины layout primitive', () => {
    const { rerender, container } = render(<AdminPageFrame variant="compact">x</AdminPageFrame>);
    expect(container.firstChild).toHaveClass('max-w-admin-compact');

    rerender(<AdminPageFrame variant="content">x</AdminPageFrame>);
    expect(container.firstChild).toHaveClass('max-w-admin-content');

    rerender(<AdminPageFrame variant="wide">x</AdminPageFrame>);
    expect(container.firstChild).toHaveClass('max-w-admin-wide');

    rerender(<AdminPageFrame variant="fluid">x</AdminPageFrame>);
    expect(container.firstChild).toHaveClass('max-w-none');

    rerender(
      <AdminPageFrame variant="wide" density="compact">
        x
      </AdminPageFrame>,
    );
    expect(container.firstChild).toHaveClass('py-3');
    expect(container.firstChild).toHaveClass('gap-3');
  });
});
