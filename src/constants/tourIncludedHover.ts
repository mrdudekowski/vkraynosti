import type { Season } from "../types";

/**
 * Длительность «моторики» иконки/текста и обводки строки «Что включено».
 * Синхронно с `transitionDuration.tour-included` в `tailwind.config.ts`.
 */
export const TOUR_INCLUDED_MOTOR_DURATION_MS = 480 as const;

/**
 * Fade in/out подписи под иконками «Что включено» (`useTourIncludedDescriptionFade`).
 * Короче моторики иконки — быстрее смена строки. Синхронно с `transitionDuration.tour-included-description-fade`.
 */
export const TOUR_INCLUDED_DESCRIPTION_FADE_MS = 240 as const;

/**
 * Задержка перед снятием «активной» строки при уходе курсора — меньше «плясок» между пунктами.
 * Вход на другой пункт отменяет таймер (см. `useTourIncludedActiveItem`).
 */
export const TOUR_INCLUDED_POINTER_EXIT_DELAY_MS = 420 as const;

/**
 * Интервал автосмены активной строки «Что включено» на десктопе с fine pointer (см. `useTourIncludedActiveItem`).
 */
export const TOUR_INCLUDED_AUTO_ROTATE_MS = 3000 as const;

/**
 * Пауза автосмены после ручного тапа по иконке на устройствах без hover.
 * После паузы автопрокрутка продолжается с текущего активного пункта.
 */
export const TOUR_INCLUDED_MOBILE_MANUAL_PAUSE_MS = 5000 as const;

/**
 * Классы `drop-shadow-*` для нижней тени иконки при активации (фон страницы зависит от сезона).
 */
export const TOUR_INCLUDED_HOVER_DROP_SHADOW_CLASS: Record<Season, string> = {
  winter: "drop-shadow-tour-included-hover-winter",
  spring: "drop-shadow-tour-included-hover-spring",
  summer: "drop-shadow-tour-included-hover-summer",
  fall: "drop-shadow-tour-included-hover-fall",
};

/**
 * Классы `text-tourIncludedIcon-active-*` для иконки в активной строке (контраст к `seasonBg` сезона).
 */
export const TOUR_INCLUDED_ICON_ACTIVE_TEXT_CLASS: Record<Season, string> = {
  winter: "text-tourIncludedIcon-active-winter",
  spring: "text-tourIncludedIcon-active-spring",
  summer: "text-tourIncludedIcon-active-summer",
  fall: "text-tourIncludedIcon-active-fall",
};
