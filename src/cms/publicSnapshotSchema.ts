import { z } from 'zod';
import { cmsTourDocumentSchema } from './cmsTourDocument';

const publicSnapshotScheduleEventSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    tourId: z.string().min(1),
    seats: z.number().int().nonnegative().nullable(),
    status: z.enum(['planned', 'open', 'full', 'cancelled', 'completed']),
    comment: z.string().nullable(),
  })
  .strict();

export const publicSnapshotSchema = z.object({
  schemaVersion: z.literal(1),
  releaseId: z.string().min(1),
  publishedAt: z.string().datetime(),
  tours: z.array(cmsTourDocumentSchema),
  schedule: z.array(publicSnapshotScheduleEventSchema),
});

export const publicSnapshotManifestSchema = z.object({
  schemaVersion: z.literal(1),
  releaseId: z.string().min(1),
  publishedAt: z.string().datetime(),
  snapshotKey: z.string().min(1),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
});

export type PublicSnapshot = z.infer<typeof publicSnapshotSchema>;
export type PublicSnapshotManifest = z.infer<typeof publicSnapshotManifestSchema>;
