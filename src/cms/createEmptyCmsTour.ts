import type { Season } from '../types';
import { cmsTourDocumentSchema, type CmsTourDocument } from './cmsTourDocument';

export function createEmptyCmsTour(input: {
  id: string;
  slug: string;
  season: Season;
  title: string;
}): CmsTourDocument {
  return cmsTourDocumentSchema.parse({
    id: input.id,
    slug: input.slug,
    season: input.season,
    title: input.title,
    status: 'draft',
    coverAssetId: null,
    prefaceAssetId: null,
    assets: [],
    bento: { blocks: [] },
    legacyGalleryVariant: null,
  });
}
