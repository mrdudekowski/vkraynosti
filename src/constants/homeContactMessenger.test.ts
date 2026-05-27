import { describe, expect, it } from 'vitest';
import {
  HOME_CONTACT_MESSENGER_ICON_WELL_CLASS,
  HOME_CONTACT_MESSENGER_LINK_BASE,
  HOME_CONTACT_MESSENGER_LINK_MAX,
  HOME_CONTACT_MESSENGER_LINK_PHONE,
  HOME_CONTACT_MESSENGER_LINK_TELEGRAM,
} from './homeContactMessenger';

describe('homeContactMessenger class constants', () => {
  it('includes radial glow base and per-messenger modifiers', () => {
    expect(HOME_CONTACT_MESSENGER_LINK_BASE).toContain('home-contact-messenger-btn');
    expect(HOME_CONTACT_MESSENGER_LINK_PHONE).toContain('home-contact-messenger-btn--phone');
    expect(HOME_CONTACT_MESSENGER_LINK_TELEGRAM).toContain('home-contact-messenger-btn--telegram');
    expect(HOME_CONTACT_MESSENGER_LINK_MAX).toContain('home-contact-messenger-btn--max');
  });

  it('exports icon well without default fill (hover styles in index.css)', () => {
    expect(HOME_CONTACT_MESSENGER_ICON_WELL_CLASS).toContain('home-contact-messenger-icon-well');
    expect(HOME_CONTACT_MESSENGER_ICON_WELL_CLASS).not.toContain('bg-surface-dark');
  });
});
