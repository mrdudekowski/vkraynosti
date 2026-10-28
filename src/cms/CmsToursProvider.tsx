import { useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import { cmsDocumentToSiteTour } from './cmsDocumentToSiteTour';
import type { CmsToursFile } from './cmsTourDocument';
import { CmsToursRevisionContext } from './cms-tours-revision-context';
import { setCmsCatalogStatus } from './cmsCatalogStatus';
import { loadCmsToursFile, loadLiveCmsToursFile } from './loadCmsToursFile';
import { clearCmsTourOverlay, setCmsTourOverlay } from './cmsTourOverlay';
import { resolveCmsContentBaseUrl } from './cmsContentUrls';
import {
  GUEST_STORAGE_BACKOFF_MS,
  selectGuestCanaryUrl,
  startGuestStorageCircuit,
} from './storageCircuit';

export function CmsToursProvider({ children }: { children: ReactNode }) {
  const [revision, setRevision] = useState(0);

  useLayoutEffect(() => {
    let cancelled = false;
    let liveRetryTimer: ReturnType<typeof setTimeout> | null = null;

    const clearLiveRetryTimer = (): void => {
      if (liveRetryTimer != null) {
        clearTimeout(liveRetryTimer);
        liveRetryTimer = null;
      }
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

    setCmsCatalogStatus('loading');

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

      publishOverlayFromFile(load.file);

      if (load.source === 'bake' && resolveCmsContentBaseUrl() != null) {
        let backoffStep = 0;

        const scheduleLiveRetry = (): void => {
          if (cancelled) {
            return;
          }
          const delay =
            GUEST_STORAGE_BACKOFF_MS[Math.min(backoffStep, GUEST_STORAGE_BACKOFF_MS.length - 1)];
          liveRetryTimer = setTimeout(() => {
            if (cancelled) {
              return;
            }
            void loadLiveCmsToursFile().then((liveFile) => {
              if (cancelled) {
                return;
              }
              if (liveFile != null) {
                publishOverlayFromFile(liveFile);
                return;
              }
              backoffStep = Math.min(backoffStep + 1, GUEST_STORAGE_BACKOFF_MS.length - 1);
              scheduleLiveRetry();
            });
          }, delay);
        };

        scheduleLiveRetry();
      }
    });

    return () => {
      cancelled = true;
      clearLiveRetryTimer();
    };
  }, []);

  const value = useMemo(() => revision, [revision]);

  return (
    <CmsToursRevisionContext.Provider value={value}>
      {children}
    </CmsToursRevisionContext.Provider>
  );
}
