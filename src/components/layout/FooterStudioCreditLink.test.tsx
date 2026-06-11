import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SeasonProvider } from '../../context/SeasonContext';
import { UI } from '../../constants/ui';
import { CONTACTS } from '../../constants/contacts';
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
    expect(link.querySelector('[aria-hidden]')).toHaveClass('bg-season-chrome-text-winter');
  });
});
