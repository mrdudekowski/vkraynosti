/** @vitest-environment node */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { classifyStorageError, createStorageCircuit } from './storageCircuit.ts';
import { StorageUnavailableError } from './storageUnavailable.ts';

describe('API storage circuit', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('classifies UserSuspended and 403 as storage_down, 404 as asset_missing', () => {
    expect(classifyStorageError(new Error('UserSuspended'))).toBe('storage_down');
    expect(classifyStorageError({ $metadata: { httpStatusCode: 403 } })).toBe('storage_down');
    expect(classifyStorageError({ name: 'NoSuchKey', $metadata: { httpStatusCode: 404 } })).toBe(
      'asset_missing',
    );
  });

  it('opens on storage failure, skips the next byte op, then closes after a successful probe', async () => {
    vi.useFakeTimers();
    let shouldFail = true;
    const circuit = createStorageCircuit(async () => {
      if (shouldFail) {
        throw new StorageUnavailableError();
      }
    });

    circuit.reportFailure(new StorageUnavailableError());
    expect(circuit.state()).toBe('open');
    await expect(circuit.guardBytes(async () => 'ok')).rejects.toBeInstanceOf(StorageUnavailableError);

    shouldFail = false;
    await vi.advanceTimersByTimeAsync(5_000);
    await Promise.resolve();
    expect(circuit.state()).toBe('closed');
    await expect(circuit.guardBytes(async () => 'ok')).resolves.toBe('ok');
  });

  it('does not open on a missing canary object', () => {
    const circuit = createStorageCircuit(async () => undefined);
    circuit.reportFailure({ name: 'NoSuchKey', $metadata: { httpStatusCode: 404 } });
    expect(circuit.state()).toBe('closed');
  });
});
