import { CMS_PUBLISHED_CATALOG_KEY } from '../../../src/cms/cmsPackageKeys.ts';
import { setCatalogMirrorState } from './catalogMirrorState.ts';
import type { CmsApiEnv } from './env.ts';
import type { StorageCircuit } from './storageCircuit.ts';
import { createS3JsonStore, type CmsJsonStore } from './store.ts';

export type StorageBootProbeDeps = {
  env: Pick<CmsApiEnv, 'storeKind' | 'storageCanaryKey' | 's3'>;
  store: Pick<CmsJsonStore, 'getBytes'>;
  storageCircuit: Pick<StorageCircuit, 'guardBytes'>;
  probeCatalogMirror?: () => Promise<unknown>;
};

async function defaultCatalogMirrorProbe(
  env: Pick<CmsApiEnv, 's3'>,
): Promise<unknown> {
  const mirror = createS3JsonStore(env.s3);
  return mirror.getJson(CMS_PUBLISHED_CATALOG_KEY);
}

export async function probeCatalogMirrorNow(
  deps: Pick<StorageBootProbeDeps, 'env' | 'probeCatalogMirror'>,
): Promise<void> {
  if (deps.env.storeKind !== 's3') {
    setCatalogMirrorState('up');
    return;
  }

  const probe = deps.probeCatalogMirror ?? (() => defaultCatalogMirrorProbe(deps.env));

  try {
    const body = await probe();
    setCatalogMirrorState(body != null ? 'up' : 'down');
  } catch {
    setCatalogMirrorState('down');
  }
}

export async function runStorageBootProbes(deps: StorageBootProbeDeps): Promise<void> {
  const canaryKey = deps.env.storageCanaryKey || 'media/tours/fall-1/cover.webp';
  try {
    await deps.storageCircuit.guardBytes(() => deps.store.getBytes(canaryKey));
  } catch {
    // Missing canary (asset_missing) or storage_down already recorded on the circuit.
  }

  await probeCatalogMirrorNow(deps);
}
