/** Базовый класс radial hover — см. `.home-contact-messenger-btn` в `index.css`. */
const HOME_CONTACT_MESSENGER_BTN = 'home-contact-messenger-btn';

export const HOME_CONTACT_MESSENGER_LINK_BASE = `${HOME_CONTACT_MESSENGER_BTN} flex h-home-hero-contact-rail-button w-home-hero-contact-rail-button shrink-0 items-center justify-center rounded-full transition-colors duration-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary`;

export const HOME_CONTACT_MESSENGER_LINK_PHONE = `${HOME_CONTACT_MESSENGER_LINK_BASE} home-contact-messenger-btn--phone`;

export const HOME_CONTACT_MESSENGER_LINK_TELEGRAM = `${HOME_CONTACT_MESSENGER_LINK_BASE} home-contact-messenger-btn--telegram`;

export const HOME_CONTACT_MESSENGER_LINK_MAX = `${HOME_CONTACT_MESSENGER_LINK_BASE} home-contact-messenger-btn--max`;

/** Обёртка иконки; чёрная «чаша» и заливка — только на hover в `index.css`. */
export const HOME_CONTACT_MESSENGER_ICON_WELL_CLASS =
  'home-contact-messenger-icon-well relative z-stack-base flex h-home-hero-contact-rail-icon w-home-hero-contact-rail-icon shrink-0 items-center justify-center rounded-full';

export const HOME_CONTACT_MESSENGER_ICON_BASE =
  'relative z-10 h-home-hero-contact-rail-icon w-home-hero-contact-rail-icon';
