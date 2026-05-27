import { describe, expect, it } from 'vitest';
import {
  TOUR_REQUEST_MESSENGER_LABEL_BASE,
  TOUR_REQUEST_MESSENGER_LABEL_MAX,
  TOUR_REQUEST_MESSENGER_LABEL_TELEGRAM,
  TOUR_REQUEST_MESSENGER_LABEL_WHATSAPP,
  TOUR_REQUEST_MESSENGER_ICON_WELL_CLASS,
  TOUR_REQUEST_MESSENGER_RADIO_CLASS,
  TOUR_REQUEST_MESSENGER_ROW_CLASS,
} from './tourRequestMessenger';

describe('tourRequestMessenger class constants', () => {
  it('includes selectable base and per-messenger modifiers', () => {
    expect(TOUR_REQUEST_MESSENGER_LABEL_BASE).toContain('home-contact-messenger-btn--selectable');
    expect(TOUR_REQUEST_MESSENGER_LABEL_WHATSAPP).toContain('home-contact-messenger-btn--whatsapp');
    expect(TOUR_REQUEST_MESSENGER_LABEL_TELEGRAM).toContain('home-contact-messenger-btn--telegram');
    expect(TOUR_REQUEST_MESSENGER_LABEL_MAX).toContain('home-contact-messenger-btn--max');
  });

  it('reuses icon well from homeContactMessenger', () => {
    expect(TOUR_REQUEST_MESSENGER_ICON_WELL_CLASS).toContain('home-contact-messenger-icon-well');
  });

  it('exports messenger row layout class', () => {
    expect(TOUR_REQUEST_MESSENGER_ROW_CLASS).toContain('gap-home-hero-contact-rail');
  });

  it('hides radio focus ring on click; label has no focus-within outline utilities', () => {
    expect(TOUR_REQUEST_MESSENGER_RADIO_CLASS).toContain('focus:outline-none');
    expect(TOUR_REQUEST_MESSENGER_LABEL_BASE).not.toContain('focus-within:outline');
  });
});
