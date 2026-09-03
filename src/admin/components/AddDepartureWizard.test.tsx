import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ADMIN_UI } from '../constants/ui';
import AddDepartureWizard from './AddDepartureWizard';

describe('AddDepartureWizard', () => {
  it('lists on-site tours as cards for the selected season and defaults seats to 8', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(
      <AddDepartureWizard
        pickableTours={[
          { id: 'summer-1', title: 'Заповедная Та-Чингоуза', season: 'summer' },
          { id: 'fall-1', title: 'Осенний тур', season: 'fall' },
        ]}
        lockedStartsOn="2026-08-18"
        onClose={() => undefined}
        onComplete={onComplete}
      />,
    );

    expect(screen.getByRole('dialog', { name: ADMIN_UI.scheduleWizardTitle })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Заповедная Та-Чингоуза' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Осенний тур' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: ADMIN_UI.seasons.fall }));
    expect(screen.getByRole('button', { name: 'Осенний тур' })).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: ADMIN_UI.seasons.summer }));
    await user.click(screen.getByRole('button', { name: ADMIN_UI.scheduleWizardNext }));
    expect(screen.getByLabelText(ADMIN_UI.scheduleSeats)).toHaveValue('8');

    await user.click(screen.getByRole('button', { name: ADMIN_UI.scheduleWizardSubmit }));
    expect(onComplete).toHaveBeenCalledWith({
      tourId: 'summer-1',
      startsOn: '2026-08-18',
      seats: 8,
    });
  });

  it('asks for consent when a tour from another season is scheduled on this date', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(
      <AddDepartureWizard
        pickableTours={[{ id: 'winter-1', title: 'Изюбриная', season: 'winter' }]}
        lockedStartsOn="2026-08-18"
        onClose={() => undefined}
        onComplete={onComplete}
      />,
    );

    await user.click(screen.getByRole('tab', { name: ADMIN_UI.seasons.winter }));
    await user.click(screen.getByRole('button', { name: 'Изюбриная' }));
    await user.click(screen.getByRole('button', { name: ADMIN_UI.scheduleWizardNext }));
    expect(
      await screen.findByRole('dialog', { name: ADMIN_UI.scheduleCrossSeasonTitle }),
    ).toHaveTextContent('Изюбриная');

    await user.click(screen.getByRole('button', { name: ADMIN_UI.scheduleCrossSeasonConfirm }));
    await user.click(screen.getByRole('button', { name: ADMIN_UI.scheduleWizardSubmit }));
    expect(onComplete).toHaveBeenCalledWith({
      tourId: 'winter-1',
      startsOn: '2026-08-18',
      seats: 8,
    });
  });
});
