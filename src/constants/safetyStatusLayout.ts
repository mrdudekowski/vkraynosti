import type { Season } from '../types';

/**
 * Компактные размеры одной плашки в стеке #safety (6 шт. в фиксированной колонке).
 */
export const SAFETY_STATUS_PLAQUE_ICON_SIZE_CLASS = 'size-8 shrink-0 sm:size-9' as const;

export const SAFETY_STATUS_PLAQUE_TEXT_SIZE_CLASS =
  'text-safety-status-plaque-mobile sm:text-safety-status-plaque' as const;

/** Перенос в фиксированной высоте плашки (без роста контейнера). */
export const SAFETY_STATUS_PLAQUE_TEXT_CLASS =
  'min-w-0 flex-1 break-words text-pretty line-clamp-2' as const;

export const SAFETY_STATUS_PLAQUE_ROW_CLASS =
  'flex h-full min-h-0 flex-row items-center justify-start gap-3' as const;

/** Цвет чекбокса плашки по сезону (`colors.season.*`). */
export const SAFETY_STATUS_CHECKBOX_SEASON_TEXT_CLASS: Record<Season, string> = {
  winter: 'text-season-winter',
  spring: 'text-season-spring',
  summer: 'text-season-summer',
  fall: 'text-season-fall',
};

export const SAFETY_STATUS_PLAQUE_CHECKBOX_WRAPPER_CLASS =
  'safety-status-plaque-checkbox shrink-0' as const;

/** Маленький чекбокс в фазе `pulsing` (размеры в `tailwind` → `safety-status-checkbox-sm`). */
export const SAFETY_STATUS_PLAQUE_CHECKBOX_MODIFIER_SMALL =
  'safety-status-plaque-checkbox--small' as const;

/** Полный размер: `committing` / `checked` (рост + галочка). */
export const SAFETY_STATUS_PLAQUE_CHECKBOX_MODIFIER_FULL =
  'safety-status-plaque-checkbox--full' as const;

/**
 * Стек плашек: mobile — `max-h` по `visibleCount` + плавный рост (`getSafetyStatusStackMaxHeightClass`);
 * `sm+` — фикс. слот под 6 (`h-safety-status-stack`).
 */
export const SAFETY_STATUS_STACK_CLASS =
  'flex min-h-0 flex-col justify-start gap-safety-status-stack overflow-hidden transition-[max-height] duration-safety-stack-expand ease-reveal-out motion-reduce:transition-none sm:h-safety-status-stack sm:min-h-safety-status-stack sm:overflow-visible sm:max-h-none sm:transition-none' as const;

/** Оболочка одной плашки (фиксированная высота, без растягивания). */
export const SAFETY_STATUS_PLAQUE_SHELL_CLASS =
  'h-safety-status-plaque w-full shrink-0 overflow-hidden rounded-card border border-divider bg-white/60 px-3 py-2 sm:px-card-p sm:py-2.5' as const;

/** Сетка #safety: mobile — колонки друг под другом; `sm+` — две колонки одной высоты. */
export const SAFETY_SECTION_GRID_CLASS =
  'grid grid-cols-1 items-start gap-6 sm:grid-cols-2 sm:items-stretch' as const;

/** Колонка hero: в DOM ниже стека (mobile); `sm:order-1` — слева на desktop (`max-sm:order` в теме не работает). */
export const SAFETY_SECTION_HERO_COLUMN_CLASS =
  'flex h-auto min-h-0 w-full flex-col items-center sm:order-1 sm:h-safety-status-stack sm:min-h-safety-status-stack sm:items-stretch' as const;

/** Overlay с текстом hero; каскад как в `TeamMemberHeroSlide` (`teamHeroAnimation.ts`). */
export const SAFETY_TEASER_HERO_OVERLAY_CLASS =
  'absolute inset-0 z-10 flex flex-col items-center justify-center' as const;

/** Ссылка-карточка teaser #safety (`SafetyTeaserHeroCard`). */
export const SAFETY_TEASER_HERO_CARD_CLASS =
  'card-base relative block w-full max-w-tour-card mx-auto overflow-hidden text-center no-underline text-inherit focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary sm:mx-0 sm:h-full sm:h-safety-status-stack sm:w-full sm:max-w-none' as const;

/** Колонка плашек: в DOM первая (mobile); `sm:order-2` — справа на desktop. */
export const SAFETY_SECTION_STACK_COLUMN_CLASS =
  'flex h-auto min-h-0 w-full flex-col sm:order-2 sm:h-safety-status-stack sm:min-h-safety-status-stack' as const;
