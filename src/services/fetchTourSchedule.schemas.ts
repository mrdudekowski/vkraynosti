import { z } from 'zod';

const tourScheduleStatusSchema = z.enum(['planned', 'open', 'full', 'cancelled', 'completed']);

const tourScheduleDurationTypeSchema = z.enum(['однодневный', 'многодневный']);

export const tourScheduleEventSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tourId: z.string().min(1),
  durationType: tourScheduleDurationTypeSchema,
  priceRub: z.number().nullable(),
  seats: z.number().nullable(),
  status: tourScheduleStatusSchema,
  comment: z.string().nullable(),
});

const tourSchedulePricesSchema = z.record(z.string(), z.number());
const tourScheduleDurationTypesSchema = z.record(z.string(), tourScheduleDurationTypeSchema);

const tourPublicationStatusSchema = z.enum(['active', 'hidden', 'in_development']);
const tourSchedulePublicationStatusesSchema = z.record(z.string(), tourPublicationStatusSchema);

const tourScheduleWrappedResponseSchema = z
  .object({
    events: z.array(tourScheduleEventSchema),
    prices: tourSchedulePricesSchema.optional(),
    durationTypes: tourScheduleDurationTypesSchema.optional(),
    publicationStatuses: tourSchedulePublicationStatusesSchema,
  })
  .strict();

export const tourScheduleResponseSchema = tourScheduleWrappedResponseSchema;
