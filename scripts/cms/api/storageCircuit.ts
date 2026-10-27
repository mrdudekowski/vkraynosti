import { StorageUnavailableError } from './storageUnavailable.ts';

export type StorageCircuitState = 'closed' | 'open' | 'half-open';
export type StorageFetchClass = 'storage_down' | 'asset_missing' | 'not_storage';

const BACKOFF_MS = [5_000, 15_000, 30_000, 60_000] as const;

export type StorageCircuit = {
  state: () => StorageCircuitState;
  guardBytes: <T>(op: () => Promise<T>) => Promise<T>;
  reportFailure: (error: unknown) => void;
  reportSuccess: () => void;
};

function httpStatusFrom(error: unknown): number | null {
  if (error == null || typeof error !== 'object') {
    return null;
  }
  if ('$metadata' in error && error.$metadata != null && typeof error.$metadata === 'object' && 'httpStatusCode' in error.$metadata) {
    const status = error.$metadata.httpStatusCode;
    return typeof status === 'number' ? status : null;
  }
  if ('status' in error && typeof error.status === 'number') {
    return error.status;
  }
  return null;
}

export function classifyStorageError(error: unknown): StorageFetchClass {
  if (error instanceof StorageUnavailableError) {
    return 'storage_down';
  }
  const status = httpStatusFrom(error);
  const name = error != null && typeof error === 'object' && 'name' in error ? String(error.name) : '';
  const message = error instanceof Error ? error.message : '';
  if (status === 404 || name === 'NoSuchKey' || message.includes('NoSuchKey')) {
    return 'asset_missing';
  }
  if (
    status === 403 ||
    (status != null && status >= 500) ||
    status === 0 ||
    name === 'TimeoutError' ||
    name === 'AbortError' ||
    message.includes('UserSuspended') ||
    message.includes('ETIMEDOUT')
  ) {
    return 'storage_down';
  }
  return 'not_storage';
}

export function createStorageCircuit(probe: () => Promise<void>): StorageCircuit {
  let current: StorageCircuitState = 'closed';
  let backoffIndex = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let generation = 0;

  function clearTimer(): void {
    if (timer != null) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function openFromFailure(): void {
    current = 'open';
    const delay = BACKOFF_MS[Math.min(backoffIndex, BACKOFF_MS.length - 1)] ?? BACKOFF_MS[BACKOFF_MS.length - 1];
    backoffIndex = Math.min(backoffIndex + 1, BACKOFF_MS.length - 1);
    clearTimer();
    const runId = ++generation;
    timer = setTimeout(() => {
      void runProbe(runId);
    }, delay);
  }

  async function runProbe(runId: number): Promise<void> {
    if (runId !== generation) {
      return;
    }
    current = 'half-open';
    try {
      await probe();
      if (runId !== generation) {
        return;
      }
      reportSuccess();
    } catch (error) {
      if (runId !== generation) {
        return;
      }
      if (classifyStorageError(error) === 'asset_missing') {
        reportSuccess();
        return;
      }
      openFromFailure();
    }
  }

  function reportSuccess(): void {
    current = 'closed';
    backoffIndex = 0;
    generation += 1;
    clearTimer();
  }

  return {
    state: () => current,
    async guardBytes(op) {
      if (current === 'open') {
        throw new StorageUnavailableError();
      }
      try {
        const result = await op();
        if (current === 'half-open') {
          reportSuccess();
        }
        return result;
      } catch (error) {
        if (classifyStorageError(error) === 'storage_down') {
          openFromFailure();
          if (error instanceof StorageUnavailableError) {
            throw error;
          }
          throw new StorageUnavailableError();
        }
        throw error;
      }
    },
    reportFailure(error) {
      if (classifyStorageError(error) === 'storage_down') {
        openFromFailure();
      }
    },
    reportSuccess,
  };
}
