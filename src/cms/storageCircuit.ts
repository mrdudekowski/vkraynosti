import type { Tour } from '../types';

export type StorageCircuitState = 'closed' | 'open' | 'half-open';
export type StorageFetchClass = 'storage_down' | 'asset_missing' | 'not_storage';

const BACKOFF_MS = [5_000, 15_000, 30_000, 60_000] as const;

let state: StorageCircuitState = 'closed';
let backoffIndex = 0;
let timer: ReturnType<typeof setTimeout> | null = null;
let canaryUrl: string | null = null;
let generation = 0;
const listeners = new Set<(next: StorageCircuitState) => void>();

export function getStorageCircuitState(): StorageCircuitState {
  return state;
}

export function subscribeStorageCircuit(
  listener: (next: StorageCircuitState) => void,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function setState(next: StorageCircuitState): void {
  state = next;
  listeners.forEach((listener) => listener(state));
}

export function classifyStorageFetchError(
  status: number,
  isCanary: boolean,
): StorageFetchClass {
  if (!isCanary && (status === 404 || status === 403)) {
    return 'asset_missing';
  }
  if (isCanary && (status === 403 || status >= 500 || status === 0)) {
    return 'storage_down';
  }
  return 'not_storage';
}

export function selectGuestCanaryUrl(
  tours: readonly Tour[],
  liveBaseUrl: string | null = null,
): string | null {
  if (liveBaseUrl == null || liveBaseUrl.length === 0) {
    return null;
  }
  const prefix = liveBaseUrl.replace(/\/+$/, '');
  for (const tour of tours) {
    const urls = [...(tour.galleryGridUrls ?? []), ...tour.galleryImages];
    for (const url of urls) {
      if (url.startsWith(prefix)) {
        return url;
      }
    }
  }
  return null;
}

export function shouldShowGuestHeavyGallery(circuitState: StorageCircuitState): boolean {
  return circuitState === 'closed';
}

function clearTimer(): void {
  if (timer != null) {
    clearTimeout(timer);
    timer = null;
  }
}

async function probe(url: string, runId: number): Promise<void> {
  try {
    let response = await fetch(url, { method: 'HEAD', cache: 'no-store' });
    if (response.status === 405 || response.status === 501) {
      response = await fetch(url, { method: 'GET', cache: 'no-store' });
    }
    if (runId !== generation) {
      return;
    }
    if (response.ok) {
      backoffIndex = 0;
      setState('closed');
      return;
    }
    const kind = classifyStorageFetchError(response.status, true);
    if (kind === 'storage_down') {
      openAndRetry(url, runId);
      return;
    }
    backoffIndex = 0;
    setState('closed');
  } catch {
    if (runId !== generation) {
      return;
    }
    openAndRetry(url, runId);
  }
}

function openAndRetry(url: string, runId: number): void {
  setState('open');
  const delay = BACKOFF_MS[Math.min(backoffIndex, BACKOFF_MS.length - 1)];
  backoffIndex = Math.min(backoffIndex + 1, BACKOFF_MS.length - 1);
  clearTimer();
  timer = setTimeout(() => {
    if (runId !== generation) {
      return;
    }
    setState('half-open');
    void probe(url, runId);
  }, delay);
}

export function startGuestStorageCircuit(url: string): void {
  canaryUrl = url;
  generation += 1;
  const runId = generation;
  clearTimer();
  backoffIndex = 0;
  void probe(url, runId);
}

export function resetStorageCircuitForTests(): void {
  generation += 1;
  clearTimer();
  backoffIndex = 0;
  canaryUrl = null;
  listeners.clear();
  state = 'closed';
}

export function getGuestStorageCanaryUrl(): string | null {
  return canaryUrl;
}
