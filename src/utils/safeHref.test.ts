import { describe, expect, it } from 'vitest';
import { CONTACTS } from '../constants/contacts';
import { toSafePhoneHref } from './safeHref';

describe('toSafePhoneHref', () => {
  it('accepts canonical CONTACTS.PHONE_HREF', () => {
    expect(toSafePhoneHref(CONTACTS.PHONE_HREF)).toBe('tel:+79000000000');
  });

  it('rejects placeholder letters in tel payload', () => {
    expect(toSafePhoneHref('tel:+7XXXXXXXXXX')).toBe('#');
  });
});
