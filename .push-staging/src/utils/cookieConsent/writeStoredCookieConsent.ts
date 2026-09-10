import {
  COOKIE_CONSENT_STORAGE_KEY,
  COOKIE_CONSENT_VERSION,
  type CookieConsentRecord,
} from '../../constants/cookieConsent';

/** Сохраняет выбор пользователя по аналитическим cookies. */
export function writeStoredCookieConsent(analytics: boolean): CookieConsentRecord {
  const record: CookieConsentRecord = {
    version: COOKIE_CONSENT_VERSION,
    analytics,
    decidedAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(record));
    } catch {
      /* quota / private mode — UI всё равно применит выбор в сессии */
    }
  }

  return record;
}
