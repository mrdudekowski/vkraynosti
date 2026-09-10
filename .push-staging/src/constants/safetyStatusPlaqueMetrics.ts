/** Лёгкое увеличение текста плашек #safety на mobile (`< sm`). Иконки — `size-8` / `sm:size-9`. */
export const SAFETY_STATUS_PLAQUE_MOBILE_SCALE = 1.1 as const;

/** Мин. размер текста (desktop clamp) × scale. */
export const SAFETY_STATUS_PLAQUE_TEXT_MIN_MOBILE_REM = 0.6875 * SAFETY_STATUS_PLAQUE_MOBILE_SCALE;

/** vw в clamp текста × scale. */
export const SAFETY_STATUS_PLAQUE_TEXT_VW_MOBILE = 2.5 * SAFETY_STATUS_PLAQUE_MOBILE_SCALE;

/** Макс. размер текста на mobile × scale. */
export const SAFETY_STATUS_PLAQUE_TEXT_MAX_MOBILE_REM = 1.125 * SAFETY_STATUS_PLAQUE_MOBILE_SCALE;
