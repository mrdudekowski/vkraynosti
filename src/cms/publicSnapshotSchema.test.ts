import { describe, expect, it } from 'vitest';
import { publicSnapshotSchema } from './publicSnapshotSchema';

function validSnapshot() {
  return {
    schemaVersion: 1,
    tours: {
      schemaVersion: 1,
      tours: [] as unknown[],
    },
    toursList: {
      schemaVersion: 1,
      generatedAt: '2026-11-11T00:00:00.000Z',
      tours: [] as unknown[],
    },
    schedule: {
      schemaVersion: 1,
      generatedAt: '2026-11-11T00:00:00.000Z',
      events: [] as unknown[],
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
    },
    stills: [],
  };
}

describe('publicSnapshotSchema', () => {
  it('accepts one complete CMS snapshot with Privacy SEO', () => {
    expect(publicSnapshotSchema.parse(validSnapshot())).toMatchObject({
      schemaVersion: 1,
      siteContent: { seo: { pages: expect.arrayContaining([expect.objectContaining({ key: 'privacy' })]) } },
    });
  });

  it('rejects a release missing Privacy SEO', () => {
    const input = validSnapshot();
    input.siteContent.seo.pages = input.siteContent.seo.pages.filter((page) => page.key !== 'privacy');

    expect(publicSnapshotSchema.safeParse(input).success).toBe(false);
  });

  it('rejects invalid public schedule fields', () => {
    const input = validSnapshot();
    input.schedule.events = [{ date: 'not-a-date', tourId: 'tour-a', seats: -1, status: 'unknown', comment: null }];

    expect(publicSnapshotSchema.safeParse(input).success).toBe(false);
  });
});
