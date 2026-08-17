import { z } from 'zod';

export const CMS_EXPORT_EDITOR = 'cms:export' as const;

export const cmsTourMetaSchema = z.object({
  rev: z.number().int().positive(),
  updatedAt: z.string().min(1),
  editor: z.string().min(1),
});

export type CmsTourMeta = z.infer<typeof cmsTourMetaSchema>;

export function parseCmsTourMeta(input: unknown): CmsTourMeta {
  return cmsTourMetaSchema.parse(input);
}

export function createCmsTourMeta(
  overrides: Partial<CmsTourMeta> = {}
): CmsTourMeta {
  return parseCmsTourMeta({
    rev: 1,
    updatedAt: new Date().toISOString(),
    editor: CMS_EXPORT_EDITOR,
    ...overrides,
  });
}
