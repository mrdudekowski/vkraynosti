export type CmsCatalogStatus = 'loading' | 'ready' | 'maintenance';

let status: CmsCatalogStatus = 'loading';
const listeners = new Set<(next: CmsCatalogStatus) => void>();

export function getCmsCatalogStatus(): CmsCatalogStatus {
  return status;
}

export function setCmsCatalogStatus(next: CmsCatalogStatus): void {
  status = next;
  listeners.forEach((listener) => listener(status));
}

export function subscribeCmsCatalogStatus(
  listener: (next: CmsCatalogStatus) => void,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function resetCmsCatalogStatusForTests(): void {
  listeners.clear();
  status = 'loading';
}
