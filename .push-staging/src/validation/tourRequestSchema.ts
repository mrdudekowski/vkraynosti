import { z } from 'zod';
import { TOUR_REQUEST_MAX_PARTY_SIZE } from '../data/tourRequestFormFields';
import { UI } from '../constants/ui';

const e = UI.tourRequestModal.errors;
const namePattern = /^[\p{L}\p{M}\s'-]+$/u;
const phonePattern = /^\+?[0-9()\-\s]{7,20}$/;
const isoDepartureDatePattern = /^\d{4}-\d{2}-\d{2}$/;

const preferredDepartureDateField = z
  .string()
  .trim()
  .regex(isoDepartureDatePattern, { message: e.departureDateRequired });

/**
 * Поля формы заявки (без данных тура — они подставляются при отправке).
 */
export const tourRequestFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: e.nameRequired })
    .max(80, { message: e.nameRequired })
    .refine(value => namePattern.test(value), { message: e.nameRequired }),
  preferredMessenger: z
    .union([z.literal(''), z.enum(['whatsapp', 'telegram', 'max'])])
    .refine((v): v is 'whatsapp' | 'telegram' | 'max' => v !== '', {
      message: e.messengerRequired,
    }),
  email: z
    .string()
    .transform(s => s.trim())
    .pipe(
      z.union([
        z.literal(''),
        z.string().email({ message: e.emailInvalid }),
      ])
    ),
  phone: z
    .string()
    .trim()
    .min(1, { message: e.phoneRequired })
    .max(24, { message: e.phoneRequired })
    .refine(value => phonePattern.test(value), { message: e.phoneRequired }),
  partySize: z
    .string()
    .trim()
    .min(1, { message: e.partySizeRequired })
    .refine(
      value => {
        if (!/^[1-9]\d*$/.test(value)) return false;
        const n = parseInt(value, 10);
        return n >= 1 && n <= TOUR_REQUEST_MAX_PARTY_SIZE;
      },
      { message: e.partySizeInvalid }
    )
    .transform(value => parseInt(value, 10)),
  withChildren: z.boolean(),
  question: z
    .string()
    .transform(s => s.trim())
    .pipe(
      z.union([
        z.literal(''),
        z.string().min(1, { message: e.questionRequired }).max(1200, { message: e.questionTooLong }),
      ])
    ),
  privacyAccepted: z.boolean().refine((v): v is true => v === true, {
    message: e.privacyRequired,
  }),
  preferredDepartureDate: z.string().optional(),
});

export type TourRequestFormValues = z.infer<typeof tourRequestFormSchema>;
export type TourRequestFormInput = z.input<typeof tourRequestFormSchema>;

export const createTourRequestFormSchema = (requiresDepartureDate: boolean) => {
  if (!requiresDepartureDate) {
    return tourRequestFormSchema;
  }
  return tourRequestFormSchema.extend({
    preferredDepartureDate: preferredDepartureDateField,
  });
};

export const defaultTourRequestFormValues: TourRequestFormInput = {
  name: '',
  preferredMessenger: '',
  email: '',
  phone: '',
  partySize: '',
  withChildren: false,
  question: '',
  privacyAccepted: false,
  preferredDepartureDate: '',
};
