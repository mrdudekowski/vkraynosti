import { describe, expect, it } from 'vitest';
import { createPublicSnapshotRelease, parsePublicSnapshotRelease } from './publicSnapshotRelease';

function input() {
  return {
    schemaVersion: 1 as const,
    tours: { schemaVersion: 1 as const, tours: [] as unknown[] },
    toursList: { schemaVersion: 1 as const, generatedAt: '2026-11-11T00:00:00.000Z', tours: [] as unknown[] },
    schedule: { schemaVersion: 1 as const, generatedAt: '2026-11-11T00:00:00.000Z', events: [] as unknown[] },
    siteContent: {
      seo: {
        kind: 'seo',
        schemaVersion: 1,
        pages: ['home', 'winter', 'spring', 'summer', 'fall', 'privacy'].map((key) => ({
          key,
          path: key === 'home' ? '/' : key === 'privacy' ? '/privacy/' : `/tours/${key}/`,
          title: `${key} title`,
          description: `${key} description`,
          h1: `${key} heading`,
          keywords: [],
        })),
      },
    },
    stills: [],
  };
}

describe('createPublicSnapshotRelease', () => {
  it('gives identical content a stable release id and hash despite generation time', async () => {
    const first = await createPublicSnapshotRelease(input(), { generatedAt: '2026-11-11T00:00:00.000Z', sourceKind: 'postgres' });
    const second = await createPublicSnapshotRelease(input(), { generatedAt: '2026-11-12T00:00:00.000Z', sourceKind: 'postgres' });

    expect(second.manifest.releaseId).toBe(first.manifest.releaseId);
    expect(second.manifest.sha256).toBe(first.manifest.sha256);
    expect(second.manifest.generatedAt).not.toBe(first.manifest.generatedAt);
  });

  it('changes the release id when SEO content changes and keeps editorial array order', async () => {
    const ordered = input();
    ordered.toursList.tours = [
      { id: 'tour-b', title: 'B', priceRub: null, durationType: 'однодневный', publicationStatus: 'active' },
      { id: 'tour-a', title: 'A', priceRub: null, durationType: 'однодневный', publicationStatus: 'active' },
    ];
    const first = await createPublicSnapshotRelease(ordered, { generatedAt: '2026-11-11T00:00:00.000Z', sourceKind: 'postgres' });
    const changed = input();
    changed.siteContent.seo.pages[0].title = 'Changed title';
    changed.toursList.tours = ordered.toursList.tours;
    const second = await createPublicSnapshotRelease(changed, { generatedAt: '2026-11-11T00:00:00.000Z', sourceKind: 'postgres' });

    expect(second.manifest.releaseId).not.toBe(first.manifest.releaseId);
    expect(first.payload.toursList.tours.map((tour) => tour.id)).toEqual(['tour-b', 'tour-a']);
  });

  it('rejects a malformed snapshot and returns immutable payload data', async () => {
    await expect(createPublicSnapshotRelease({ ...input(), tours: null }, { generatedAt: '2026-11-11T00:00:00.000Z', sourceKind: 'postgres' })).rejects.toThrow();

    const release = await createPublicSnapshotRelease(input(), { generatedAt: '2026-11-11T00:00:00.000Z', sourceKind: 'postgres' });
    expect(Object.isFrozen(release.payload)).toBe(true);
    expect(Object.isFrozen(release.payload.siteContent)).toBe(true);
  });

  it('rejects a manifest whose identity does not match the payload hash', async () => {
    const release = await createPublicSnapshotRelease(input(), { generatedAt: '2026-11-11T00:00:00.000Z', sourceKind: 'postgres' });
    await expect(parsePublicSnapshotRelease({
      ...release,
      manifest: { ...release.manifest, releaseId: 'seo-000000000000000000000000' },
    })).rejects.toThrow('Public snapshot manifest does not match payload identity');
  });
});
