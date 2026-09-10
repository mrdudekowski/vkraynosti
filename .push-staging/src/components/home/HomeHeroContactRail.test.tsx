import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import HomeHeroContactRail from './HomeHeroContactRail';
import { ROUTES } from '../../constants/routes';
import { UI } from '../../constants/ui';
import { HomeNavbarChromeProvider } from '../../context/HomeNavbarChromeContext';

vi.mock('../../hooks/useHomeHeroContactRailMotion', () => ({
  useHomeHeroContactRailMotion: () => ({
    setRailOuterRef: () => undefined,
  }),
}));

describe('HomeHeroContactRail', () => {
  it('renders three contact links on home with aria labels', () => {
    render(
      <MemoryRouter initialEntries={[ROUTES.HOME]}>
        <HomeNavbarChromeProvider>
          <HomeHeroContactRail />
        </HomeNavbarChromeProvider>
      </MemoryRouter>
    );

    const phoneLink = screen.getByRole('link', { name: UI.hero.homeHeroContactPhoneAria });
    expect(phoneLink).toBeInTheDocument();
    expect(phoneLink).toHaveClass('home-contact-messenger-btn--phone');
    expect(
      screen.getByRole('link', { name: UI.tourRequestModal.messengerTelegramAria })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: UI.tourRequestModal.messengerMaxAria })
    ).toBeInTheDocument();
  });

  it('does not render off home route', () => {
    render(
      <MemoryRouter initialEntries={['/winter']}>
        <HomeNavbarChromeProvider>
          <HomeHeroContactRail />
        </HomeNavbarChromeProvider>
      </MemoryRouter>
    );

    expect(screen.queryByRole('link', { name: UI.hero.homeHeroContactPhoneAria })).toBeNull();
  });
});
