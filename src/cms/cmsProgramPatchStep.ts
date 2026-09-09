import { z } from 'zod';

export const cmsProgramPatchStepSchema = z.object({
  day: z.number().int().min(1).optional(),
  timeLabel: z.string(),
  description: z.string(),
});

export type CmsProgramPatchStep = z.infer<typeof cmsProgramPatchStepSchema>;
