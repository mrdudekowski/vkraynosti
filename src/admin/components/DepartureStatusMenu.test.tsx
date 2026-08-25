import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { AdminDeparture } from '../api';
import { ADMIN_UI } from '../constants/ui';
import DepartureStatusMenu from './DepartureStatusMenu';

function departure(status: AdminDeparture['status']): AdminDeparture {
  return {
    id: 'dep-1',
    tourId: 'winter-1',
    startsOn: '2026-08-22',
    seats: 8,
    status,
    version: 1,
    createdAt: '2026-08-18T00:00:00.000Z',
    updatedAt: '2026-08-18T00:00:00.000Z',
  };
}

describe('DepartureStatusMenu', () => {
  it('switches planned to open from the status label', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DepartureStatusMenu departure={departure('planned')} onChange={onChange} />);

    await user.click(
      screen.getByRole('button', {
        name: `${ADMIN_UI.departureStatusMenu}: ${ADMIN_UI.departureStatus.planned}`,
      }),
    );
    await user.click(screen.getByRole('menuitemradio', { name: ADMIN_UI.departureStatus.open }));
    expect(onChange).toHaveBeenCalledWith('open');
  });

  it('keeps cancelled as plain text', () => {
    render(<DepartureStatusMenu departure={departure('cancelled')} onChange={vi.fn()} />);
    expect(screen.getByText(ADMIN_UI.departureStatus.cancelled)).toBeVisible();
    expect(screen.queryByRole('button', { name: /Статус/ })).not.toBeInTheDocument();
  });
});
