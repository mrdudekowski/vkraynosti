import { COOKIE_CONSENT_STORAGE_KEY } from '../../constants/cookieConsent';
import { parseStoredCookieConsent } from './parseStoredCookieConsent';

/** Читает сохранённый выбор из localStorage; `null`, если нет или запись невалидна. */
export function readStoredCookieConsent(): ReturnType<typeof parseStoredCookieConsent> {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    return parseStoredCookieConsent(raw);
  } catch {
    return null;
  }
}
