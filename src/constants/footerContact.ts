/**
 * Контакты в футере: те же `ContactMessengerLogo`, что в rail и `#contact`.
 * Размер иконок — `home-hero-contact-rail-icon` (1.5rem).
 */
export const FOOTER_CONTACT_LINK_CLASS =
  'flex items-center gap-3 text-text-inverse/60 hover:text-brand-secondary transition-colors duration-hover text-sm' as const;

/** Чёрный круг + белая иконка — см. `.footer-contact-messenger-icon-well` в `index.css`. */
export const FOOTER_CONTACT_MESSENGER_ICON_WELL_CLASS =
  'footer-contact-messenger-icon-well' as const;

export const FOOTER_CONTACT_MESSENGER_ICON_CLASS = 'footer-contact-messenger-icon' as const;
