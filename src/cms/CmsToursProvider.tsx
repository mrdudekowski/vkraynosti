import { useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import { cmsDocumentToSiteTour } from './cmsDocumentToSiteTour';
import { CmsToursRevisionContext } from './cms-tours-revision-context';
import { setCmsCatalogStatus } from './cmsCatalogStatus';
import { loadCmsToursFile } from './loadCmsToursFile';
import { clearCmsTourOverlay, setCmsTourOverlay } from './cmsTourOverlay';
import { selectGuestCanaryUrl, startGuestStorageCircuit } from './storageCircuit';

export function CmsToursProvider({ children }: { children: ReactNode }) {
  const [revision, setRevision] = useState(0);

  useLayoutEffect(() => {
    let cancelled = false;
    setCmsCatalogStatus('loading');

    void loadCmsToursFile().then((file) => {
      if (cancelled) {
        return;
      }
      if (file == null) {
        clearCmsTourOverlay();
        setCmsCatalogStatus('maintenance');
      } else {
        const overlayTours = file.tours.map(cmsDocumentToSiteTour);
        setCmsTourOverlay(overlayTours);
        setCmsCatalogStatus('ready');
        const canary = selectGuestCanaryUrl(overlayTours);
        if (canary != null) {
          startGuestStorageCircuit(canary);
        }
      }
      setRevision((current) => current + 1);
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
