/** `querySelector` для fade-out шторы team (`teamZoneScroll`). */
export const HOME_TEAM_CONTACT_BRIDGE_DATA_ATTR = 'home-team-contact-bridge' as const;

export const HOME_TEAM_CONTACT_BRIDGE_SELECTOR =
  `[data-${HOME_TEAM_CONTACT_BRIDGE_DATA_ATTR}]` as const;

/**
 * Секция-переход team → contact: прозрачная, z между backdrop и contact.
 * Фон — общее параллаксное небо на `Home` (`HOME_PAGE_SKY_BG_CLASS`); чёрная штора гасится в `teamZoneScroll`.
 */
export const HOME_TEAM_CONTACT_BRIDGE_SECTION_CLASS =
  'relative z-home-team-contact-bridge isolate py-home-team-contact-bridge' as const;

export const HOME_TEAM_CONTACT_BRIDGE_INNER_CLASS =
  'mx-auto flex max-w-7xl flex-col px-4 sm:px-6 lg:px-8' as const;

export const HOME_TEAM_CONTACT_BRIDGE_DIVIDER_CLASS =
  'mx-auto mt-home-team-contact-bridge-divider-gap h-px w-full max-w-team-section-divider shrink-0 rounded-full' as const;

export const HOME_TEAM_CONTACT_BRIDGE_MARK_WRAPPER_CLASS =
  'mx-auto flex w-full max-w-home-team-contact-bridge-mark justify-center' as const;

export const HOME_TEAM_CONTACT_BRIDGE_MARK_CLASS =
  'h-auto max-h-home-team-contact-bridge-mark w-full object-contain opacity-home-team-contact-bridge-mark' as const;
