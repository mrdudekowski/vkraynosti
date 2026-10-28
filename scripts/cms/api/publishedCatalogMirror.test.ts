/** @vitest-environment node */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCatalogMirrorState, setCatalogMirrorState } from './catalogMirrorState.ts';
import { createPublishedJsonMirror } from './publishedCatalogMirror.ts';
import {
  createMemoryJsonStore,
  createSplitJsonStore,
  type CmsJsonStore,
} from './store.ts';

describe('createPublishedJsonMirror', () => {
  beforeEach(() => {
    setCatalogMirrorState('down');
  });

  it('writes published JSON to the mirror after primary success', async () => {
    const primary = createMemoryJsonStore();
    const mirror = createMemoryJsonStore();
    const store = createPublishedJsonMirror(primary, mirror);
    await store.putJson('published/tours.json', { schemaVersion: 1, tours: [] });
    expect(await primary.getJson('published/tours.json')).toEqual({ schemaVersion: 1, tours: [] });
    expect(await mirror.getJson('published/tours.json')).toEqual({ schemaVersion: 1, tours: [] });
  });

  it('does not fail publish when the mirror throws', async () => {
    const primary = createMemoryJsonStore();
    const mirror: CmsJsonStore = {
      ...createMemoryJsonStore(),
      putJson: async () => {
        throw new Error('UserSuspended');
      },
    };
    const store = createPublishedJsonMirror(primary, mirror);
    await expect(
      store.putJson('published/tours.json', { schemaVersion: 1, tours: [] }),
    ).resolves.toBeUndefined();
    expect(await primary.getJson('published/tours.json')).toEqual({ schemaVersion: 1, tours: [] });
  });

  it('does not mirror draft keys', async () => {
    const primary = createMemoryJsonStore();
    const mirror = createMemoryJsonStore();
    const store = createPublishedJsonMirror(primary, mirror);
    await store.putJson('draft/tours/fall-1/document.json', { id: 'fall-1' });
    expect(await mirror.getJson('draft/tours/fall-1/document.json')).toBeNull();
  });

  it('mirrors deleteJson for published keys', async () => {
    const primary = createMemoryJsonStore({ 'published/tours.json': { schemaVersion: 1 } });
    const mirror = createMemoryJsonStore({ 'published/tours.json': { schemaVersion: 1 } });
    const store = createPublishedJsonMirror(primary, mirror);
    await store.deleteJson('published/tours.json');
    expect(await primary.getJson('published/tours.json')).toBeNull();
    expect(await mirror.getJson('published/tours.json')).toBeNull();
  });

  it('does not mirror deleteJson for draft keys', async () => {
    const primary = createMemoryJsonStore({ 'draft/tours/fall-1/document.json': { id: 'fall-1' } });
    const mirror = createMemoryJsonStore({ 'draft/tours/fall-1/document.json': { id: 'fall-1' } });
    const store = createPublishedJsonMirror(primary, mirror);
    await store.deleteJson('draft/tours/fall-1/document.json');
    expect(await primary.getJson('draft/tours/fall-1/document.json')).toBeNull();
    expect(await mirror.getJson('draft/tours/fall-1/document.json')).toEqual({ id: 'fall-1' });
  });

  it('getJson always reads from primary', async () => {
    const primary = createMemoryJsonStore({ 'published/tours.json': { from: 'primary' } });
    const mirror = createMemoryJsonStore({ 'published/tours.json': { from: 'mirror' } });
    const store = createPublishedJsonMirror(primary, mirror);
    expect(await store.getJson('published/tours.json')).toEqual({ from: 'primary' });
  });

  it('passes getBytes and putBytes through to primary unchanged', async () => {
    const primary = createMemoryJsonStore();
    const mirror = createMemoryJsonStore();
    const store = createPublishedJsonMirror(primary, mirror);
    await store.putBytes('media/site-content/team/x.webp', new Uint8Array([1, 2]), 'image/webp');
    expect(await primary.getBytes('media/site-content/team/x.webp')).toEqual({
      body: new Uint8Array([1, 2]),
      contentType: null,
    });
    expect(await mirror.getBytes('media/site-content/team/x.webp')).toBeNull();
  });

  it('invokes onMirrorFailure when mirror putJson throws', async () => {
    const primary = createMemoryJsonStore();
    const mirror: CmsJsonStore = {
      ...createMemoryJsonStore(),
      putJson: async () => {
        throw new Error('UserSuspended');
      },
    };
    const onMirrorFailure = vi.fn();
    const store = createPublishedJsonMirror(primary, mirror, { onMirrorFailure });
    await store.putJson('published/tours.json', { schemaVersion: 1, tours: [] });
    expect(onMirrorFailure).toHaveBeenCalledOnce();
    expect(onMirrorFailure.mock.calls[0]?.[0]).toBeInstanceOf(Error);
  });

  it('sets catalogMirrorState to up after successful published put', async () => {
    const primary = createMemoryJsonStore();
    const mirror = createMemoryJsonStore();
    const store = createPublishedJsonMirror(primary, mirror);
    expect(getCatalogMirrorState()).toBe('down');
    await store.putJson('published/tours.json', { schemaVersion: 1, tours: [] });
    expect(getCatalogMirrorState()).toBe('up');
  });

  it('sets catalogMirrorState to down on mirror failure', async () => {
    const primary = createMemoryJsonStore();
    const mirror: CmsJsonStore = {
      ...createMemoryJsonStore(),
      putJson: async () => {
        throw new Error('UserSuspended');
      },
    };
    const store = createPublishedJsonMirror(primary, mirror);
    await store.putJson('published/tours.json', { schemaVersion: 1, tours: [] });
    expect(getCatalogMirrorState()).toBe('down');
  });

  it('with createSplitJsonStore mirrors published JSON to the shared byte backend', async () => {
    const json = createMemoryJsonStore();
    const bytes = createMemoryJsonStore();
    const store = createSplitJsonStore(createPublishedJsonMirror(json, bytes), bytes);
    await store.putJson('published/tours.json', { schemaVersion: 1 });
    expect(await json.getJson('published/tours.json')).toEqual({ schemaVersion: 1 });
    expect(await bytes.getJson('published/tours.json')).toEqual({ schemaVersion: 1 });
    await store.putBytes('media/tours/fall-1/cover.webp', new Uint8Array([9]), 'image/webp');
    expect(await store.getBytes('media/tours/fall-1/cover.webp')).toEqual({
      body: new Uint8Array([9]),
      contentType: null,
    });
  });
});
