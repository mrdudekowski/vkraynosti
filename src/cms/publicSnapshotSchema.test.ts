import { describe, expect, it } from 'vitest';
import { publicSnapshotSchema, publicSnapshotManifestSchema } from './publicSnapshotSchema';

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

describe('public snapshot contract', () => {
  it('accepts a complete CMS tour snapshot and a schedule without a base price', () => {
    expect(
      publicSnapshotSchema.parse({
        schemaVersion: 1,
        releaseId: 'release-2026-09-04-1',
        publishedAt: '2026-09-04T00:00:00.000Z',
        tours: [tour],
        schedule: [
          {
            date: '2026-09-20',
            tourId: 'summer-1',
            seats: 8,
            status: 'open',
            comment: null,
          },
        ],
      }),
    ).toMatchObject({ releaseId: 'release-2026-09-04-1' });
  });

  it('rejects a schedule row that carries the old catalog price field', () => {
    expect(() =>
      publicSnapshotSchema.parse({
        schemaVersion: 1,
        releaseId: 'release-1',
        publishedAt: '2026-09-04T00:00:00.000Z',
        tours: [tour],
        schedule: [
          {
            date: '2026-09-20',
            tourId: 'summer-1',
            seats: 8,
            status: 'open',
            comment: null,
            priceRub: 15000,
          },
        ],
      }),
    ).toThrow();
  });

  it('requires a manifest hash and the snapshot key', () => {
    expect(() =>
      publicSnapshotManifestSchema.parse({
        schemaVersion: 1,
        releaseId: 'release-1',
        publishedAt: '2026-09-04T00:00:00.000Z',
      }),
    ).toThrow();
  });
});
