import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  COOKIE_CONSENT_STORAGE_KEY,
  COOKIE_CONSENT_VERSION,
} from '../../constants/cookieConsent';
import { parseStoredCookieConsent } from './parseStoredCookieConsent';
import { readStoredCookieConsent } from './readStoredCookieConsent';
import { writeStoredCookieConsent } from './writeStoredCookieConsent';

describe('parseStoredCookieConsent', () => {
  it('returns null for empty or invalid JSON', () => {
    expect(parseStoredCookieConsent(null)).toBeNull();
    expect(parseStoredCookieConsent('')).toBeNull();
    expect(parseStoredCookieConsent('not-json')).toBeNull();
    expect(parseStoredCookieConsent('{}')).toBeNull();
  });

  it('rejects wrong version', () => {
    expect(
      parseStoredCookieConsent(
        JSON.stringify({ version: 0, analytics: true, decidedAt: '2026-01-01' })
      )
    ).toBeNull();
  });

  it('parses valid record', () => {
    const raw = JSON.stringify({
      version: COOKIE_CONSENT_VERSION,
      analytics: false,
      decidedAt: '2026-05-27T12:00:00.000Z',
    });
    expect(parseStoredCookieConsent(raw)).toEqual({
      version: COOKIE_CONSENT_VERSION,
      analytics: false,
      decidedAt: '2026-05-27T12:00:00.000Z',
    });
  });
});

describe('readStoredCookieConsent / writeStoredCookieConsent', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('round-trips analytics choice', () => {
    writeStoredCookieConsent(true);
    expect(readStoredCookieConsent()).toEqual({
      version: COOKIE_CONSENT_VERSION,
      analytics: true,
      decidedAt: expect.any(String),
    });
    expect(localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)).toBeTruthy();
  });

  it('returns null when storage missing', () => {
    expect(readStoredCookieConsent()).toBeNull();
  });
});
