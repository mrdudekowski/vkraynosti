import { useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import { cmsDocumentToSiteTour } from './cmsDocumentToSiteTour';
import type { CmsToursFile } from './cmsTourDocument';
import { CmsToursRevisionContext } from './cms-tours-revision-context';
import { setCmsCatalogStatus } from './cmsCatalogStatus';
import { loadCmsToursFile } from './loadCmsToursFile';
import { clearCmsTourOverlay, setCmsTourOverlay } from './cmsTourOverlay';
import { resolveCmsContentBaseUrl } from './cmsContentUrls';
import { selectGuestCanaryUrl, startGuestStorageCircuit } from './storageCircuit';

export function CmsToursProvider({ children }: { children: ReactNode }) {
  const [revision, setRevision] = useState(0);

  useLayoutEffect(() => {
    let cancelled = false;
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

    });

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => revision, [revision]);

  return (
    <CmsToursRevisionContext.Provider value={value}>
      {children}
    </CmsToursRevisionContext.Provider>
  );
}
