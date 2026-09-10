import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SeasonProvider } from '../../context/SeasonContext';
import { UI } from '../../constants/ui';
import { CONTACTS } from '../../constants/contacts';
import { SEASON_TEXT_CLASS } from '../../constants/seasonNavbarAppearance';
import { getCurrentSeason } from '../../utils/getCurrentSeason';
import FooterStudioCreditLink from './FooterStudioCreditLink';

describe('FooterStudioCreditLink', () => {
  it('renders SILA link with Doloto font and season gradient layer', () => {
    render(
      <SeasonProvider>
        <FooterStudioCreditLink />
      </SeasonProvider>
    );

    const link = screen.getByRole('link', { name: UI.footer.studioCreditLinkAriaLabel });
    expect(link).toHaveAttribute('href', CONTACTS.STUDIO_TELEGRAM_HREF);
    expect(link).toHaveClass('font-doloto');
    expect(link).toHaveAttribute('target', '_blank');
    expect(screen.getAllByText(UI.footer.studioCreditName)).toHaveLength(2);
    // Season-agnostic: provider resolves the live season, so assert against the same source.
    expect(link.querySelector('[aria-hidden]')).toHaveClass(
      SEASON_TEXT_CLASS[getCurrentSeason()],
    );
  });
});
