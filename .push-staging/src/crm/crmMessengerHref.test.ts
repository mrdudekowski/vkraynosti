import { describe, expect, it } from 'vitest';
import { crmCallHref, crmMessengerHref } from './crmMessengerHref';

describe('crmMessengerHref', () => {
  it('собирает tel и мессенджеры без выдуманного Max-URL', () => {
    expect(crmCallHref('+7 (900) 111-22-33')).toBe('tel:+79001112233');
    expect(crmMessengerHref('telegram', '+79001112233', '@anna')).toBe('https://t.me/anna');
    expect(crmMessengerHref('whatsapp', '+7 900 111-22-33', '')).toBe('https://wa.me/79001112233');
    expect(crmMessengerHref('max', '+79001112233', 'anna')).toBeNull();
  });
});
