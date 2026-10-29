import { setCatalogMirrorState } from './catalogMirrorState.ts';
import type { CmsJsonStore } from './store.ts';

export type PublishedJsonMirrorOptions = {
  onMirrorFailure?: (error: unknown) => void;
};

function isPublishedCatalogKey(key: string): boolean {
  return key === 'published/tours.json' || key.startsWith('published/');
}

export function createPublishedJsonMirror(
  primary: CmsJsonStore,
  mirror: CmsJsonStore,
  options?: PublishedJsonMirrorOptions,
): CmsJsonStore {
  const reportMirrorFailure = (error: unknown) => {
    setCatalogMirrorState('down');
    options?.onMirrorFailure?.(error);
  };

  return {
    async getJson(key) {
      const primaryValue = await primary.getJson(key);
      if (primaryValue != null || !isPublishedCatalogKey(key)) {
        return primaryValue;
      }
      try {
        const mirrored = await mirror.getJson(key);
        if (mirrored != null) {
          await primary.putJson(key, mirrored);
          setCatalogMirrorState('up');
        }
        return mirrored;
      } catch (error) {
        reportMirrorFailure(error);
        return null;
      }
    },
    async putJson(key, value) {
      await primary.putJson(key, value);
      if (!isPublishedCatalogKey(key)) {
        return;
      }
      try {
        await mirror.putJson(key, value);
        setCatalogMirrorState('up');
      } catch (error) {
        reportMirrorFailure(error);
      }
    },
    async deleteJson(key) {
      await primary.deleteJson(key);
      if (!isPublishedCatalogKey(key)) {
        return;
      }
      try {
        await mirror.deleteJson(key);
      } catch (error) {
        reportMirrorFailure(error);
      }
    },
    getBytes: (key) => primary.getBytes(key),
    putBytes: (key, body, contentType) => primary.putBytes(key, body, contentType),
    deleteBytes: (key) => primary.deleteBytes(key),
  };
}
