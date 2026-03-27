import { z } from 'zod';
import { UI } from '../constants/ui';

const e = UI.tourRequestModal.errors;

/**
 * Поля формы заявки (без данных тура — они подставляются при отправке).
 */
export const tourRequestFormSchema = z.object({
  name: z.string().trim().min(1, { message: e.nameRequired }),
  email: z
    .string()
    .transform(s => s.trim())
    .pipe(
      z.union([
        z.literal(''),
        z.string().email({ message: e.emailInvalid }),
      ])
    ),
  phone: z.string().trim().min(1, { message: e.phoneRequired }),
  question: z.string().trim().min(1, { message: e.questionRequired }),
  privacyAccepted: z.boolean().refine((v): v is true => v === true, {
    message: e.privacyRequired,
  }),
});

export type TourRequestFormValues = z.infer<typeof tourRequestFormSchema>;
export type TourRequestFormInput = z.input<typeof tourRequestFormSchema>;

export const defaultTourRequestFormValues: TourRequestFormInput = {
  name: '',
  email: '',
  phone: '',
  question: '',
  privacyAccepted: false,
};
