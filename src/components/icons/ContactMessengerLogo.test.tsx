import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ContactMessengerLogo from './ContactMessengerLogo';
import {
  MAX_MESSENGER_SIGN_LOGO,
  PHONE_ALT_LOGO,
  TELEGRAM_LOGO,
  WHATSAPP_LOGO,
} from '../../constants/images';

describe('ContactMessengerLogo', () => {
  it.each([
    ['phone', PHONE_ALT_LOGO],
    ['telegram', TELEGRAM_LOGO],
    ['whatsapp', WHATSAPP_LOGO],
    ['max', MAX_MESSENGER_SIGN_LOGO],
  ] as const)('renders %s from images SSOT', (variant, expectedSrc) => {
    const { container } = render(<ContactMessengerLogo variant={variant} />);
    expect(container.querySelector('img')).toHaveAttribute('src', expectedSrc);
  });
});
