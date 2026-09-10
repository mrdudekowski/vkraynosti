import { createContext } from 'react';

export type CookieConsentStatus = 'pending' | 'decided';

export type CookieConsentContextValue = {
  status: CookieConsentStatus;
  analytics: boolean;
  isBannerOpen: boolean;
  acceptAnalytics: () => void;
  rejectAnalytics: () => void;
  openBanner: () => void;
  closeBanner: () => void;
};

export const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);
