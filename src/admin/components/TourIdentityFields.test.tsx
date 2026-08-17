import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ADMIN_UI } from '../constants/ui';
import TourIdentityFields from './TourIdentityFields';

describe('TourIdentityFields', () => {
  it('показывает превью публичного URL и даёт сменить название и slug', async () => {
    const user = userEvent.setup();
    const onTitle = vi.fn();
    const onSlug = vi.fn();
    const onRegenerateSlug = vi.fn();

    render(
      <TourIdentityFields
        title="Полуостров Краббе"
        slug="poluostrov-krabbe"
        season="summer"
        onTitle={onTitle}
        onSlug={onSlug}
        onRegenerateSlug={onRegenerateSlug}
      />,
    );

    expect(screen.getByText('/tours/summer/poluostrov-krabbe/')).toBeInTheDocument();

    await user.clear(screen.getByLabelText(ADMIN_UI.tourNameLabel));
    await user.type(screen.getByLabelText(ADMIN_UI.tourNameLabel), 'К');
    expect(onTitle).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: ADMIN_UI.regenerateSlug }));
    expect(onRegenerateSlug).toHaveBeenCalled();
  });
});
