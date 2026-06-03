import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { loadYandexMetrika } from '../utils/analytics/loadYandexMetrika';
import { readStoredCookieConsent } from '../utils/cookieConsent/readStoredCookieConsent';
import { writeStoredCookieConsent } from '../utils/cookieConsent/writeStoredCookieConsent';
import {
  CookieConsentContext,
  type CookieConsentStatus,
} from './cookieConsentContextDefinition';

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<CookieConsentStatus>('pending');
  const [analytics, setAnalytics] = useState(false);
  const [isBannerOpen, setIsBannerOpen] = useState(false);

  useEffect(() => {
    const stored = readStoredCookieConsent();
    if (stored) {
      setStatus('decided');
      setAnalytics(stored.analytics);
      setIsBannerOpen(false);
      if (stored.analytics) {
        loadYandexMetrika();
      }
      return;
    }

    setStatus('pending');
    setIsBannerOpen(true);
  }, []);

  const acceptAnalytics = useCallback(() => {
    writeStoredCookieConsent(true);
    setStatus('decided');
    setAnalytics(true);
    setIsBannerOpen(false);
    loadYandexMetrika();
  }, []);

  const rejectAnalytics = useCallback(() => {
    writeStoredCookieConsent(false);
    setStatus('decided');
    setAnalytics(false);
    setIsBannerOpen(false);
  }, []);

  const openBanner = useCallback(() => {
    setIsBannerOpen(true);
  }, []);

  const closeBanner = useCallback(() => {
    if (status === 'decided') {
      setIsBannerOpen(false);
    }
  }, [status]);

  const value = useMemo(
    () => ({
      status,
      analytics,
      isBannerOpen,
      acceptAnalytics,
      rejectAnalytics,
      openBanner,
      closeBanner,
    }),
    [
      status,
      analytics,
      isBannerOpen,
      acceptAnalytics,
      rejectAnalytics,
      openBanner,
      closeBanner,
    ]
  );

  return (
    <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>
  );
}
