import { describe, expect, it } from 'vitest';
import { publicSnapshotManifestSchema, publicSnapshotSchema } from './publicSnapshotSchema';

const tour = {
  id: 'summer-1',
  slug: 'zapovednaya-ta-chingouza',
  season: 'summer',
  status: 'active',
  title: 'Заповедная Та-Чингоуза',
  subtitle: '',
  heroPhrase: '',
  description: 'Описание',
  duration: '2 дня / 1 ночь',
  durationDays: 2,
  difficulty: 'Easy',
  price: '18 000 ₽',
  priceFootnote: 'группа от 4 человек',
  program: [],
  included: [],
  coverAssetId: null,
  prefaceAssetId: null,
  assets: [],
  bento: { blocks: [] },
  legacyGalleryVariant: null,
};

function validSnapshot() {
  return {
    schemaVersion: 1,
    tours: { schemaVersion: 1, tours: [tour] },
    toursList: {
      schemaVersion: 1,
      generatedAt: '2026-11-11T00:00:00.000Z',
      tours: [{ id: tour.id, title: tour.title, priceRub: 18000, durationType: 'многодневный', publicationStatus: 'active' }],
    },
    schedule: {
      schemaVersion: 1,
      generatedAt: '2026-11-11T00:00:00.000Z',
      events: [{ date: '2026-11-20', tourId: tour.id, seats: 8, status: 'open', comment: null }],
    },
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
      'policy-personal-data-policy': null,
    },
    stills: [],
  };
}

describe('public snapshot contract', () => {
  it('accepts the complete route, schedule and page SEO snapshot, including Privacy', () => {
    expect(publicSnapshotSchema.parse(validSnapshot())).toMatchObject({
      siteContent: { seo: { pages: expect.arrayContaining([expect.objectContaining({ key: 'privacy' })]) } },
    });
  });

  it('rejects a snapshot that is missing Privacy SEO', () => {
    const snapshot = validSnapshot();
    snapshot.siteContent.seo.pages = snapshot.siteContent.seo.pages.filter((page) => page.key !== 'privacy');
    expect(publicSnapshotSchema.safeParse(snapshot).success).toBe(false);
  });

  it('rejects a schedule row that carries the old catalog price field', () => {
    const snapshot = validSnapshot();
    snapshot.schedule.events = [{
      ...snapshot.schedule.events[0],
      priceRub: 15000,
    } as typeof snapshot.schedule.events[number]];
    expect(publicSnapshotSchema.safeParse(snapshot).success).toBe(false);
  });

  it('requires a manifest hash, release identity and source marker', () => {
    expect(() => publicSnapshotManifestSchema.parse({
      schemaVersion: 1,
      releaseId: 'release-1',
      generatedAt: '2026-11-11T00:00:00.000Z',
      snapshotKey: 'published/releases/release-1.json',
      sha256: 'a'.repeat(64),
      seoRevision: 'b'.repeat(64),
      sourceKind: 'test',
    })).toThrow();
  });
});
