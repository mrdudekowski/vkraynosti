import { useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import { cmsDocumentToSiteTour } from './cmsDocumentToSiteTour';
import { CmsToursRevisionContext } from './cms-tours-revision-context';
import { resolveCmsContentBaseUrl } from './cmsContentUrls';
import { loadCmsToursFile } from './loadCmsToursFile';
import { clearCmsTourOverlay, setCmsTourOverlay } from './cmsTourOverlay';

export function CmsToursProvider({ children }: { children: ReactNode }) {
  const [revision, setRevision] = useState(0);

  useLayoutEffect(() => {
    let cancelled = false;
    const cmsEnabled = resolveCmsContentBaseUrl() != null;

    if (cmsEnabled) {
      setCmsTourOverlay([]);
      queueMicrotask(() => {
        if (!cancelled) {
          setRevision((current) => current + 1);
        }
      });
    } else {
      clearCmsTourOverlay();
    }

    void loadCmsToursFile().then((file) => {
      if (cancelled) {
        return;
      }
      if (file != null) {
        setCmsTourOverlay(file.tours.map(cmsDocumentToSiteTour));
      } else if (cmsEnabled) {
        setCmsTourOverlay([]);
      } else {
        clearCmsTourOverlay();
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
