import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ADMIN_UI } from '../constants/ui';
import { formatAdminReadiness } from '../formatAdminCopy';
import TourEditorOperationalRail from './TourEditorOperationalRail';

describe('TourEditorOperationalRail', () => {
  it('shows readiness progress and lets the editor jump to a blocker', async () => {
    const user = userEvent.setup();
    const onSelectBlocker = vi.fn();

    render(
      <TourEditorOperationalRail
        readyCount={3}
        readyTotal={5}
        blockers={['cover_required', 'tour_not_ready']}
        publicationLabel={ADMIN_UI.unpublishedChanges}
        guestVisibilityLabel={ADMIN_UI.tourVisibility.on_site}
        guestVisibilityTone="success"
        onSelectBlocker={onSelectBlocker}
      />,
    );

    expect(screen.getByText(formatAdminReadiness(3, 5))).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: ADMIN_UI.editorRailReadiness })).toHaveAttribute(
      'aria-valuenow',
      '60',
    );

    await user.click(screen.getByRole('button', { name: ADMIN_UI.publishBlockers.cover_required }));
    expect(onSelectBlocker).toHaveBeenCalledWith('cover_required');
  });

  it('shows an empty blockers state and the current publication context', () => {
    render(
      <TourEditorOperationalRail
        readyCount={5}
        readyTotal={5}
        blockers={[]}
        publicationLabel={ADMIN_UI.autosaved}
        guestVisibilityLabel={ADMIN_UI.tourVisibility.on_site}
        guestVisibilityTone="success"
        onSelectBlocker={vi.fn()}
      />,
    );

    expect(screen.getByText(ADMIN_UI.editorNoBlockers)).toBeInTheDocument();
    expect(screen.getByText(ADMIN_UI.autosaved)).toBeInTheDocument();
    expect(screen.getByText(ADMIN_UI.tourVisibility.on_site)).toBeInTheDocument();
  });
});
