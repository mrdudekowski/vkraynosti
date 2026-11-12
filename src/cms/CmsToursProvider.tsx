import { useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import { cmsDocumentToSiteTour } from './cmsDocumentToSiteTour';
import type { CmsToursFile } from './cmsTourDocument';
import { CmsToursRevisionContext } from './cms-tours-revision-context';
import { setCmsCatalogStatus } from './cmsCatalogStatus';
import { loadCmsToursFile, loadLiveCmsToursFile } from './loadCmsToursFile';
import { clearCmsTourOverlay, setCmsTourOverlay } from './cmsTourOverlay';
import { resolveCmsContentBaseUrl } from './cmsContentUrls';
import { CMS_LIVE_REFRESH_INTERVAL_MS } from './cmsContentRefresh';
import { selectGuestCanaryUrl, startGuestStorageCircuit } from './storageCircuit';

export function CmsToursProvider({ children }: { children: ReactNode }) {
  const [revision, setRevision] = useState(0);

  useLayoutEffect(() => {
    let cancelled = false;
    let initialized = false;
    let refreshTimer: number | null = null;
    let refreshInFlight = false;

    const clearRefreshTimer = (): void => {
      if (refreshTimer == null) return;
      window.clearTimeout(refreshTimer);
      refreshTimer = null;
    };

    const publishOverlayFromFile = (file: CmsToursFile): void => {
      const overlayTours = file.tours.map(cmsDocumentToSiteTour);
      setCmsTourOverlay(overlayTours);
      setCmsCatalogStatus('ready');
      const canary = selectGuestCanaryUrl(overlayTours, resolveCmsContentBaseUrl());
      if (canary != null) {
        startGuestStorageCircuit(canary);
      }
      setRevision((current) => current + 1);
    };

    const scheduleRefresh = (): void => {
      if (!initialized || cancelled || resolveCmsContentBaseUrl() == null || refreshTimer != null) return;
      refreshTimer = window.setTimeout(() => {
        refreshTimer = null;
        void refreshLiveCatalog();
      }, CMS_LIVE_REFRESH_INTERVAL_MS);
    };

    const refreshLiveCatalog = async (): Promise<void> => {
      if (!initialized || cancelled || refreshInFlight || resolveCmsContentBaseUrl() == null) return;
      refreshInFlight = true;
      try {
        const liveFile = await loadLiveCmsToursFile();
        if (!cancelled && liveFile != null) publishOverlayFromFile(liveFile);
      } finally {
        refreshInFlight = false;
        scheduleRefresh();
      }
    };

    const onVisibilityChange = (): void => {
      if (document.visibilityState !== 'visible') return;
      clearRefreshTimer();
      void refreshLiveCatalog();
    };

    setCmsCatalogStatus('loading');
    document.addEventListener('visibilitychange', onVisibilityChange);

    void loadCmsToursFile().then((load) => {
      if (cancelled) {
        return;
      }
      if (load == null) {
        clearCmsTourOverlay();
        setCmsCatalogStatus('maintenance');
        setRevision((current) => current + 1);
        return;
      }

      initialized = true;
      publishOverlayFromFile(load.file);
      scheduleRefresh();
    });

    return () => {
      cancelled = true;
      clearRefreshTimer();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  const value = useMemo(() => revision, [revision]);

  return (
    <CmsToursRevisionContext.Provider value={value}>
      {children}
    </CmsToursRevisionContext.Provider>
  );
}
