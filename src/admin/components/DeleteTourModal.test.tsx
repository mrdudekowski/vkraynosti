import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { AdminTourListItem } from '../api';
import { ADMIN_UI } from '../constants/ui';
import DeleteTourModal from './DeleteTourModal';

const tour: AdminTourListItem = {
  id: 'winter-1',
  title: 'Изюбриная',
  season: 'winter',
  status: 'active',
  published: true,
  slug: 'izubrinaya',
  imageUrl: null,
  ready: true,
  readyCount: 5,
  readyTotal: 5,
};

describe('DeleteTourModal', () => {
  it('requires confirmation and passes the selected tour to the handler', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(<DeleteTourModal tour={tour} busy={false} error={null} onClose={vi.fn()} onConfirm={onConfirm} />);

    const dialog = screen.getByRole('dialog', { name: ADMIN_UI.deleteTourTitle });
    expect(within(dialog).getByText(tour.title)).toBeInTheDocument();
    expect(within(dialog).getByText(ADMIN_UI.deleteTourWarning)).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: ADMIN_UI.deleteTourSubmit }));

    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('keeps the dialog actionable with a dependency error and disables controls while deleting', () => {
    render(
      <DeleteTourModal
        tour={tour}
        busy
        error="tour_has_dependencies"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    const dialog = screen.getByRole('dialog', { name: ADMIN_UI.deleteTourTitle });
    expect(within(dialog).getByRole('alert')).toHaveTextContent(ADMIN_UI.deleteTourDependencies);
    expect(within(dialog).getByRole('button', { name: ADMIN_UI.deleteTourSubmitting })).toBeDisabled();
    expect(
      within(dialog)
        .getAllByRole('button', { name: ADMIN_UI.deleteTourCancel })
        .find((button) => button.getAttribute('aria-label') == null),
    ).toBeDisabled();
  });
});
