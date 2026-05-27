/** Фон секции `#contact` на главной — `colors.home-contact-section` в `tailwind.config.ts`. */
export const HOME_CONTACT_SECTION_BG_HEX = '#f3eee8' as const;

/** Масштаб кнопок секции относительно `HomeHeroContactRail` (rail не меняется). */
export const HOME_CONTACT_SECTION_MESSENGER_SIZE_SCALE = 1.3 as const;

/** База rail: `home-hero-contact-rail-button` 2.75rem, icon 1.5rem — см. `tailwind.config.ts`. */
export const HOME_CONTACT_SECTION_BUTTON_REM = 3.575 as const;
export const HOME_CONTACT_SECTION_ICON_REM = 1.95 as const;
export const HOME_CONTACT_SECTION_GAP_REM = 0.325 as const;

/** Строки rem для `theme.extend` в `tailwind.config.ts`. */
export const HOME_CONTACT_SECTION_BUTTON_SIZE = `${HOME_CONTACT_SECTION_BUTTON_REM}rem` as const;
export const HOME_CONTACT_SECTION_ICON_SIZE = `${HOME_CONTACT_SECTION_ICON_REM}rem` as const;
export const HOME_CONTACT_SECTION_GAP_SIZE = `${HOME_CONTACT_SECTION_GAP_REM}rem` as const;

const HOME_CONTACT_MESSENGER_BTN = 'home-contact-messenger-btn';

/** Icon-only ссылки в `#contact` (+30% к rail); hover — общий `.home-contact-messenger-btn` в `index.css`. */
export const HOME_CONTACT_SECTION_MESSENGER_LINK_BASE = `${HOME_CONTACT_MESSENGER_BTN} flex h-home-contact-section-button w-home-contact-section-button shrink-0 items-center justify-center rounded-full transition-colors duration-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary`;

export const HOME_CONTACT_SECTION_MESSENGER_LINK_PHONE = `${HOME_CONTACT_SECTION_MESSENGER_LINK_BASE} home-contact-messenger-btn--phone`;

export const HOME_CONTACT_SECTION_MESSENGER_LINK_TELEGRAM = `${HOME_CONTACT_SECTION_MESSENGER_LINK_BASE} home-contact-messenger-btn--telegram`;

export const HOME_CONTACT_SECTION_MESSENGER_LINK_MAX = `${HOME_CONTACT_SECTION_MESSENGER_LINK_BASE} home-contact-messenger-btn--max`;

/** Обёртка иконки в `#contact`; чёрная «чаша» и заливка — только на hover в `index.css`. */
export const HOME_CONTACT_SECTION_ICON_WELL_CLASS =
  'home-contact-messenger-icon-well relative z-stack-base flex h-home-contact-section-icon w-home-contact-section-icon shrink-0 items-center justify-center rounded-full';

export const HOME_CONTACT_SECTION_ICON_BASE =
  'relative z-10 h-home-contact-section-icon w-home-contact-section-icon';

/** Корневая секция `#contact` на главной (без watermark — знак в `HomeTeamContactBrandBridge`). */
export const HOME_CONTACT_SECTION_CLASS =
  'relative isolate overflow-hidden bg-home-contact-section py-section-y text-text-primary' as const;
export const HOME_CONTACT_SECTION_INNER_CLASS =
  'relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8' as const;

export const HOME_CONTACT_SECTION_SUBTITLE_CLASS =
  'text-lg text-text-primary/85' as const;

/** Горизонтальный ряд icon-only кнопок в `#contact` (размеры секции, не rail). */
export const HOME_CONTACT_MESSENGER_ROW_CLASS =
  'flex flex-row flex-wrap items-center justify-center gap-home-contact-section overflow-visible' as const;
