import { useSyncExternalStore, type ReactNode } from 'react';
import RecoverableErrorView from '../components/errors/RecoverableErrorView';
import { UI } from '../constants/ui';
import { getCmsCatalogStatus, subscribeCmsCatalogStatus } from './cmsCatalogStatus';

export function CmsCatalogGate({ children }: { children: ReactNode }) {
  const status = useSyncExternalStore(
    subscribeCmsCatalogStatus,
    getCmsCatalogStatus,
    getCmsCatalogStatus,
  );

  if (status === 'loading') {
    return null;
  }

  if (status === 'maintenance') {
    return (
      <RecoverableErrorView
        copy={UI.maintenance}
        onRetry={() => {
          window.location.reload();
        }}
      />
    );
  }

  return children;
}
