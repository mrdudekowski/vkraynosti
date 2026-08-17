import { z } from 'zod';

export const CMS_DRAFT_INDEX_SCHEMA_VERSION = 1 as const;

export const cmsDraftIndexSchema = z.object({
  schemaVersion: z.literal(CMS_DRAFT_INDEX_SCHEMA_VERSION),
  tourIds: z.array(z.string().min(1)),
});

export type CmsDraftIndex = z.infer<typeof cmsDraftIndexSchema>;

export function parseCmsDraftIndex(input: unknown): string[] {
  return cmsDraftIndexSchema.parse(input).tourIds;
}

export function cmsDraftIndexFile(tourIds: string[]): CmsDraftIndex {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const id of tourIds) {
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);
    unique.push(id);
  }
  return { schemaVersion: CMS_DRAFT_INDEX_SCHEMA_VERSION, tourIds: unique };
}
