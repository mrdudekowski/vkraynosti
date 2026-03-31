/**
 * Метаданные полей формы заявки — единый контракт для будущего headless CMS / JSON.
 * Тексты подписей и ошибок остаются в `src/constants/ui.ts`.
 */
export const TOUR_REQUEST_FORM_FIELD_KEYS = [
  'name',
  'preferredMessenger',
  'email',
  'phone',
  'question',
  'privacyAccepted',
] as const;

export type TourRequestFormFieldKey = (typeof TOUR_REQUEST_FORM_FIELD_KEYS)[number];
