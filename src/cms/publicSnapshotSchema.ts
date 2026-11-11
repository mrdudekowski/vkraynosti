import { z } from 'zod';
import { cmsToursFileSchema } from './cmsTourDocument';
import { siteSeoDocumentSchema } from './siteSeoDocument';

export const publicSnapshotScheduleEventSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tourId: z.string().min(1),
  seats: z.number().int().nonnegative().nullable(),
  status: z.enum(['planned', 'open', 'full', 'cancelled', 'completed']),
  comment: z.string().nullable(),
  durationType: z.enum(['однодневный', 'многодневный']).optional(),
}).strict();

const publicToursListSchema = z.object({
  schemaVersion: z.literal(1),
  generatedAt: z.string().datetime(),
  tours: z.array(z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    priceRub: z.number().nonnegative().nullable(),
    durationType: z.enum(['однодневный', 'многодневный']),
    publicationStatus: z.enum(['active', 'in_development']),
  }).strict()),
}).strict();

const publicScheduleSchema = z.object({
  schemaVersion: z.literal(1),
  generatedAt: z.string().datetime(),
  events: z.array(publicSnapshotScheduleEventSchema),
}).strict();

const publicSiteContentSchema = z.record(z.string(), z.unknown()).superRefine((siteContent, ctx) => {
  const seo = siteSeoDocumentSchema.safeParse(siteContent.seo);
  if (!seo.success) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Snapshot must include complete site SEO, including Privacy', path: ['seo'] });
  }
});

export const publicSnapshotSchema = z.object({
  schemaVersion: z.literal(1),
  tours: cmsToursFileSchema,
  toursList: publicToursListSchema,
  schedule: publicScheduleSchema,
  siteContent: publicSiteContentSchema,
  stills: z.array(z.object({ key: z.string().min(1), url: z.string().min(1) }).strict()),
}).strict();

export const publicSnapshotManifestSchema = z.object({
  schemaVersion: z.literal(1),
  releaseId: z.string().regex(/^seo-[a-f0-9]{24}$/),
  generatedAt: z.string().datetime(),
  snapshotKey: z.string().min(1),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  seoRevision: z.string().regex(/^[a-f0-9]{64}$/),
  sourceKind: z.string().min(1),
}).strict();

export const publicSnapshotReleaseSchema = z.object({
  payload: publicSnapshotSchema,
  manifest: publicSnapshotManifestSchema,
}).strict();

export type PublicSnapshot = z.infer<typeof publicSnapshotSchema>;
export type PublicSnapshotManifest = z.infer<typeof publicSnapshotManifestSchema>;
export type PublicSnapshotRelease = z.infer<typeof publicSnapshotReleaseSchema>;
