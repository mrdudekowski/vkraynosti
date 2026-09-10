import { render, screen, within } from '@testing-library/react';
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

    expect(screen.getByRole('heading', { name: ADMIN_UI.identityHeading })).toBeInTheDocument();
    expect(screen.getByText('17/80')).toBeInTheDocument();
    expect(screen.getByText('/tours/summer/poluostrov-krabbe/')).toBeInTheDocument();
    expect(screen.queryByLabelText(ADMIN_UI.tourGuestStatusLabel)).not.toBeInTheDocument();

    await user.clear(screen.getByLabelText(ADMIN_UI.tourNameLabel));
    await user.type(screen.getByLabelText(ADMIN_UI.tourNameLabel), 'К');
    expect(onTitle).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: ADMIN_UI.regenerateSlug }));
    expect(onRegenerateSlug).toHaveBeenCalled();
  });

  it('даёт открыть публичную страницу, если передан href', () => {
    render(
      <TourIdentityFields
        title="Полуостров Краббе"
        slug="poluostrov-krabbe"
        season="summer"
        publicHref="/vkraynosti/tours/summer/poluostrov-krabbe/"
        onTitle={vi.fn()}
        onSlug={vi.fn()}
        onRegenerateSlug={vi.fn()}
      />,
    );

    expect(screen.getByRole('link', { name: ADMIN_UI.tourOpenOnSite })).toHaveAttribute(
      'href',
      '/vkraynosti/tours/summer/poluostrov-krabbe/',
    );
  });

  it('не предлагает черновик как видимость для гостя', () => {
    render(
      <TourIdentityFields
        title="Изюбриная"
        slug="izubrinaya"
        season="winter"
        status="draft"
        onTitle={() => undefined}
        onSlug={() => undefined}
        onStatus={() => undefined}
        onRegenerateSlug={() => undefined}
      />,
    );
    const select = screen.getByLabelText(ADMIN_UI.tourGuestStatusLabel);
    expect(select).toHaveValue('active');
    expect(within(select).queryByRole('option', { name: ADMIN_UI.tourStatus.draft })).not.toBeInTheDocument();
  });
});
