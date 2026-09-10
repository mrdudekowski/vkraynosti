import { describe, expect, it } from 'vitest';
import {
  HOME_CONTACT_MESSENGER_ROW_CLASS,
  HOME_CONTACT_SECTION_CLASS,
  HOME_CONTACT_SECTION_MESSENGER_LINK_PHONE,
  HOME_CONTACT_SECTION_MESSENGER_SIZE_SCALE,
} from './homeContactSection';

describe('homeContactSection class constants', () => {
  it('exposes section shell and horizontal messenger row', () => {
    expect(HOME_CONTACT_SECTION_CLASS).toContain('bg-home-contact-section');
    expect(HOME_CONTACT_SECTION_CLASS).toContain('text-text-primary');
    expect(HOME_CONTACT_MESSENGER_ROW_CLASS).toContain('flex-row');
    expect(HOME_CONTACT_MESSENGER_ROW_CLASS).toContain('gap-home-contact-section');
    expect(HOME_CONTACT_MESSENGER_ROW_CLASS).not.toContain('gap-home-hero-contact-rail');
    expect(HOME_CONTACT_MESSENGER_ROW_CLASS).not.toContain('home-contact-action-card');
  });

  it('uses section-sized messenger links, not hero rail tokens', () => {
    expect(HOME_CONTACT_SECTION_MESSENGER_SIZE_SCALE).toBe(1.3);
    expect(HOME_CONTACT_SECTION_MESSENGER_LINK_PHONE).toContain('home-contact-section-button');
    expect(HOME_CONTACT_SECTION_MESSENGER_LINK_PHONE).toContain('home-contact-messenger-btn--phone');
    expect(HOME_CONTACT_SECTION_MESSENGER_LINK_PHONE).not.toContain('home-hero-contact-rail-button');
  });
});
