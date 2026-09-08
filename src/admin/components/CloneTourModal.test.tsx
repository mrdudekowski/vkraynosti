import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { AdminTourListItem } from '../api';
import { ADMIN_UI } from '../constants/ui';
import CloneTourModal from './CloneTourModal';

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

describe('CloneTourModal', () => {
  it('requires a target season before submitting', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<CloneTourModal tour={tour} busy={false} error={null} onClose={vi.fn()} onSubmit={onSubmit} />);

    expect(screen.getByRole('dialog', { name: ADMIN_UI.cloneTourTitle })).toBeInTheDocument();
    expect(screen.getByText(tour.title)).toBeInTheDocument();
    const submit = screen.getByRole('button', { name: ADMIN_UI.cloneTourSubmit });
    expect(submit).toBeDisabled();

    await user.selectOptions(screen.getByLabelText(ADMIN_UI.cloneTourSeason), 'summer');
    expect(submit).toBeEnabled();
    await user.click(submit);

    expect(onSubmit).toHaveBeenCalledWith('summer');
  });

  it('disables the form while cloning and exposes an error', () => {
    render(
      <CloneTourModal
        tour={tour}
        busy
        error="source_media_not_found"
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    const dialog = screen.getByRole('dialog', { name: ADMIN_UI.cloneTourTitle });
    expect(within(dialog).getByRole('combobox', { name: ADMIN_UI.cloneTourSeason })).toBeDisabled();
    expect(
      within(dialog)
        .getAllByRole('button', { name: ADMIN_UI.cloneTourCancel })
        .find((button) => button.getAttribute('aria-label') == null),
    ).toBeDisabled();
    expect(within(dialog).getByRole('button', { name: ADMIN_UI.cloneTourSubmitting })).toBeDisabled();
    expect(within(dialog).getByRole('alert')).toHaveTextContent(ADMIN_UI.cloneTourMediaError);
  });

  it('closes without submitting when cancelled', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onSubmit = vi.fn();

    render(<CloneTourModal tour={tour} busy={false} error={null} onClose={onClose} onSubmit={onSubmit} />);

    const dialog = screen.getByRole('dialog', { name: ADMIN_UI.cloneTourTitle });
    await user.click(
      within(dialog)
        .getAllByRole('button', { name: ADMIN_UI.cloneTourCancel })
        .find((button) => button.getAttribute('aria-label') == null)!,
    );

    expect(onClose).toHaveBeenCalledOnce();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
