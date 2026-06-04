export const SITE_URL = 'https://mrdudekowski.github.io/vkraynosti';

export const CONTACTS = {
  PHONE_NUMBER:    '8 (914) 066-80-99',
  /** Только цифры после `tel:` — иначе `toSafePhoneHref` вернёт `#`. */
  PHONE_HREF:      'tel:+79140668099',
  TELEGRAM_HANDLE: '@vkraynosti',
  TELEGRAM_HREF:   'https://t.me/vkraynosti',
  MAX_HREF:        'https://max.ru/vkraynosti',
  /** Email для связи и обращений по персональным данным (152-ФЗ). */
  PERSONAL_DATA_EMAIL: 'vkraynosti.prim@yandex.ru',
} as const;
