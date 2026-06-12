/**
 * Метаданные полей формы заявки — единый контракт для будущего headless CMS / JSON.
 * Тексты подписей и ошибок остаются в `src/constants/ui.ts`.
 */
export const TOUR_REQUEST_FORM_FIELD_KEYS = [
  'name',
  'preferredMessenger',
  'email',
  'phone',
  'partySize',
  'withChildren',
  'question',
  'privacyAccepted',
] as const;

/** Верхняя граница размера группы в форме заявки (синхрон с GAS validatePayload_). */
export const TOUR_REQUEST_MAX_PARTY_SIZE = 99;

export type TourRequestFormFieldKey = (typeof TOUR_REQUEST_FORM_FIELD_KEYS)[number];
