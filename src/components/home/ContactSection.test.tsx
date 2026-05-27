import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';
import ContactSection from './ContactSection';
import { UI } from '../../constants/ui';

beforeAll(() => {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as typeof ResizeObserver;
});

describe('ContactSection', () => {
  it('renders three icon-only messenger links without action card copy', () => {
    render(<ContactSection />);

    const phoneLink = screen.getByRole('link', { name: UI.hero.homeHeroContactPhoneAria });
    expect(phoneLink).toHaveClass('home-contact-messenger-btn--phone');
    expect(phoneLink).toHaveClass('h-home-contact-section-button');
    expect(screen.getByRole('link', { name: UI.tourRequestModal.messengerTelegramAria })).toHaveClass(
      'home-contact-messenger-btn--telegram'
    );
    expect(screen.getByRole('link', { name: UI.tourRequestModal.messengerMaxAria })).toHaveClass(
      'home-contact-messenger-btn--max'
    );

    expect(screen.queryByText(UI.contact.phone)).toBeNull();
    expect(screen.queryByText(UI.contact.telegram)).toBeNull();
    expect(screen.queryByText(UI.contact.max)).toBeNull();
    expect(document.querySelector('.home-contact-action-card')).toBeNull();
  });
});
