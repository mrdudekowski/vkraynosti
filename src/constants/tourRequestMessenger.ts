import {
  HOME_CONTACT_MESSENGER_ICON_BASE,
  HOME_CONTACT_MESSENGER_ICON_WELL_CLASS,
} from './homeContactMessenger';

const HOME_CONTACT_MESSENGER_BTN = 'home-contact-messenger-btn';

/** Radio-label в модалке заявки: rail-размер, без hover glow — см. `--selectable` в `index.css`. */
export const TOUR_REQUEST_MESSENGER_LABEL_BASE = `${HOME_CONTACT_MESSENGER_BTN} home-contact-messenger-btn--selectable flex h-home-hero-contact-rail-button w-home-hero-contact-rail-button shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-hover`;

/** Скрытый radio; без outline при клике — фокус-кольцо только у label через `:focus-visible` в `index.css`. */
export const TOUR_REQUEST_MESSENGER_RADIO_CLASS = 'sr-only focus:outline-none' as const;

export const TOUR_REQUEST_MESSENGER_LABEL_WHATSAPP = `${TOUR_REQUEST_MESSENGER_LABEL_BASE} home-contact-messenger-btn--whatsapp`;

export const TOUR_REQUEST_MESSENGER_LABEL_TELEGRAM = `${TOUR_REQUEST_MESSENGER_LABEL_BASE} home-contact-messenger-btn--telegram`;

export const TOUR_REQUEST_MESSENGER_LABEL_MAX = `${TOUR_REQUEST_MESSENGER_LABEL_BASE} home-contact-messenger-btn--max`;

export { HOME_CONTACT_MESSENGER_ICON_WELL_CLASS as TOUR_REQUEST_MESSENGER_ICON_WELL_CLASS };

export const TOUR_REQUEST_MESSENGER_ICON_BASE = HOME_CONTACT_MESSENGER_ICON_BASE;

export const TOUR_REQUEST_MESSENGER_ICON_CLASS = `${TOUR_REQUEST_MESSENGER_ICON_BASE} object-contain`;

/** Горизонтальный ряд radio-кнопок мессенджеров в модалке заявки. */
export const TOUR_REQUEST_MESSENGER_ROW_CLASS =
  'flex flex-row flex-wrap items-center gap-home-hero-contact-rail overflow-visible' as const;
