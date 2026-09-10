/**
 * Radial hover-свечение под icon-only кнопками контактов (`HomeHeroContactRail`, `ContactSection`).
 * Hex синхронны с `colors.messenger.*` в `tailwind.config.ts`.
 */
const MESSENGER_PHONE_HEX = '#E53935';
const MESSENGER_TELEGRAM_HEX = '#229ED9';
const MESSENGER_WHATSAPP_HEX = '#25D366';
const MESSENGER_MAX_HEX = '#6BAEF7';
const MESSENGER_MAX_GLOW_HEX = '#6366F1';

/** Центр круга чуть ниже геометрического центра кнопки — свечение «под» иконкой. */
const GLOW_RADIAL_POSITION = '50% 58%';

/** Центр заливки внутри чёрной «чаши» иконки. */
const ICON_FILL_RADIAL_POSITION = '50% 50%';

/**
 * Расширение `::before` относительно кнопки: −7.5% с каждой стороны → диаметр свечения 115% кнопки.
 * Синхронно с `inset` в `.home-contact-messenger-btn::before` (`index.css`).
 */
export const HOME_CONTACT_MESSENGER_GLOW_INSET_PERCENT = 7.5 as const;

export const HOME_CONTACT_MESSENGER_GLOW_PHONE = `radial-gradient(circle at ${GLOW_RADIAL_POSITION}, color-mix(in srgb, ${MESSENGER_PHONE_HEX} 62%, transparent) 0%, color-mix(in srgb, ${MESSENGER_PHONE_HEX} 24%, transparent) 42%, transparent 58%)` as const;

export const HOME_CONTACT_MESSENGER_GLOW_TELEGRAM = `radial-gradient(circle at ${GLOW_RADIAL_POSITION}, color-mix(in srgb, ${MESSENGER_TELEGRAM_HEX} 62%, transparent) 0%, color-mix(in srgb, ${MESSENGER_TELEGRAM_HEX} 24%, transparent) 42%, transparent 58%)` as const;

export const HOME_CONTACT_MESSENGER_GLOW_WHATSAPP = `radial-gradient(circle at ${GLOW_RADIAL_POSITION}, color-mix(in srgb, ${MESSENGER_WHATSAPP_HEX} 62%, transparent) 0%, color-mix(in srgb, ${MESSENGER_WHATSAPP_HEX} 24%, transparent) 42%, transparent 58%)` as const;

export const HOME_CONTACT_MESSENGER_GLOW_MAX = `radial-gradient(circle at ${GLOW_RADIAL_POSITION}, color-mix(in srgb, ${MESSENGER_MAX_GLOW_HEX} 58%, transparent) 0%, color-mix(in srgb, ${MESSENGER_MAX_HEX} 34%, transparent) 38%, transparent 58%)` as const;

/** Внутренняя заливка «чаши» иконки на hover — те же цвета, плотнее к центру. */
export const HOME_CONTACT_MESSENGER_ICON_FILL_PHONE = `radial-gradient(circle at ${ICON_FILL_RADIAL_POSITION}, color-mix(in srgb, ${MESSENGER_PHONE_HEX} 88%, transparent) 0%, color-mix(in srgb, ${MESSENGER_PHONE_HEX} 55%, transparent) 65%, transparent 100%)` as const;

export const HOME_CONTACT_MESSENGER_ICON_FILL_TELEGRAM = `radial-gradient(circle at ${ICON_FILL_RADIAL_POSITION}, color-mix(in srgb, ${MESSENGER_TELEGRAM_HEX} 88%, transparent) 0%, color-mix(in srgb, ${MESSENGER_TELEGRAM_HEX} 55%, transparent) 65%, transparent 100%)` as const;

export const HOME_CONTACT_MESSENGER_ICON_FILL_WHATSAPP = `radial-gradient(circle at ${ICON_FILL_RADIAL_POSITION}, color-mix(in srgb, ${MESSENGER_WHATSAPP_HEX} 88%, transparent) 0%, color-mix(in srgb, ${MESSENGER_WHATSAPP_HEX} 55%, transparent) 65%, transparent 100%)` as const;

export const HOME_CONTACT_MESSENGER_ICON_FILL_MAX = `radial-gradient(circle at ${ICON_FILL_RADIAL_POSITION}, color-mix(in srgb, ${MESSENGER_MAX_GLOW_HEX} 82%, transparent) 0%, color-mix(in srgb, ${MESSENGER_MAX_HEX} 58%, transparent) 60%, transparent 100%)` as const;
