import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { loadYandexMetrika } from '../utils/analytics/loadYandexMetrika';
import { readStoredCookieConsent } from '../utils/cookieConsent/readStoredCookieConsent';
import { writeStoredCookieConsent } from '../utils/cookieConsent/writeStoredCookieConsent';
import {
  CookieConsentContext,
  type CookieConsentStatus,
} from './cookieConsentContextDefinition';

type CookieConsentUiState = {
  status: CookieConsentStatus;
  analytics: boolean;
  isBannerOpen: boolean;
};

const readInitialCookieConsentUiState = (): CookieConsentUiState => {
  if (typeof window === 'undefined') {
    return { status: 'pending', analytics: false, isBannerOpen: false };
  }

  const stored = readStoredCookieConsent();
  if (stored) {
    return {
      status: 'decided',
      analytics: stored.analytics,
      isBannerOpen: false,
    };
  }

  return { status: 'pending', analytics: false, isBannerOpen: true };
};

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [{ status, analytics, isBannerOpen }, setUiState] = useState(
    readInitialCookieConsentUiState
  );

  useEffect(() => {
    if (readStoredCookieConsent()?.analytics) {
      loadYandexMetrika();
    }
  }, []);

  const acceptAnalytics = useCallback(() => {
    writeStoredCookieConsent(true);
    setUiState({ status: 'decided', analytics: true, isBannerOpen: false });
    loadYandexMetrika();
  }, []);

  const rejectAnalytics = useCallback(() => {
    writeStoredCookieConsent(false);
    setUiState({ status: 'decided', analytics: false, isBannerOpen: false });
  }, []);

  const openBanner = useCallback(() => {
    setUiState(prev => ({ ...prev, isBannerOpen: true }));
  }, []);

  const closeBanner = useCallback(() => {
    setUiState(prev =>
      prev.status === 'decided' ? { ...prev, isBannerOpen: false } : prev
    );
  }, []);

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
