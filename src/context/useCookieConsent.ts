import { useContext } from 'react';
import {
  CookieConsentContext,
  type CookieConsentContextValue,
} from './cookieConsentContextDefinition';

export function useCookieConsent(): CookieConsentContextValue {
  const ctx = useContext(CookieConsentContext);
  if (ctx == null) {
    throw new Error('useCookieConsent must be used within CookieConsentProvider');
  }
  return ctx;
}
