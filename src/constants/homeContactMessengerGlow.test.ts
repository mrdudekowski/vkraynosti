import { describe, expect, it } from 'vitest';
import {
  HOME_CONTACT_MESSENGER_GLOW_INSET_PERCENT,
  HOME_CONTACT_MESSENGER_GLOW_PHONE,
  HOME_CONTACT_MESSENGER_GLOW_WHATSAPP,
  HOME_CONTACT_MESSENGER_ICON_FILL_PHONE,
  HOME_CONTACT_MESSENGER_ICON_FILL_WHATSAPP,
} from './homeContactMessengerGlow';

describe('homeContactMessengerGlow', () => {
  it('documents glow inset for 115% diameter', () => {
    expect(HOME_CONTACT_MESSENGER_GLOW_INSET_PERCENT).toBe(7.5);
  });

  it('uses +20% intensity and tighter outer stop on radial glow', () => {
    expect(HOME_CONTACT_MESSENGER_GLOW_PHONE).toContain('62%');
    expect(HOME_CONTACT_MESSENGER_GLOW_PHONE).toContain('24%');
    expect(HOME_CONTACT_MESSENGER_GLOW_PHONE).toContain('transparent 58%');
  });

  it('exports inner icon fill gradients', () => {
    expect(HOME_CONTACT_MESSENGER_ICON_FILL_PHONE).toContain('radial-gradient');
    expect(HOME_CONTACT_MESSENGER_ICON_FILL_PHONE).toContain('#E53935');
  });

  it('exports whatsapp inner icon fill gradient', () => {
    expect(HOME_CONTACT_MESSENGER_ICON_FILL_WHATSAPP).toContain('radial-gradient');
    expect(HOME_CONTACT_MESSENGER_ICON_FILL_WHATSAPP).toContain('#25D366');
  });

  it('exports whatsapp radial glow gradient', () => {
    expect(HOME_CONTACT_MESSENGER_GLOW_WHATSAPP).toContain('radial-gradient');
    expect(HOME_CONTACT_MESSENGER_GLOW_WHATSAPP).toContain('#25D366');
  });
});
