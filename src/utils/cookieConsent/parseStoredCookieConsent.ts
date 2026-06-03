import {
  COOKIE_CONSENT_VERSION,
  type CookieConsentRecord,
} from '../../constants/cookieConsent';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/** Парсит JSON из localStorage; `null`, если структура или версия невалидны. */
export function parseStoredCookieConsent(raw: string | null): CookieConsentRecord | null {
  if (raw == null || raw === '') return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;

    const version = parsed.version;
    const analytics = parsed.analytics;
    const decidedAt = parsed.decidedAt;

    if (version !== COOKIE_CONSENT_VERSION) return null;
    if (typeof analytics !== 'boolean') return null;
    if (typeof decidedAt !== 'string' || decidedAt.length === 0) return null;

    return {
      version: COOKIE_CONSENT_VERSION,
      analytics,
      decidedAt,
    };
  } catch {
    return null;
  }
}
