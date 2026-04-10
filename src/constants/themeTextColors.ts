/**
 * Канонические цвета `colors.text.*` в tailwind.config.ts (импорт отсюда).
 */

export const THEME_TEXT_PRIMARY_HEX = '#1A1A1A' as const;
export const THEME_TEXT_INVERSE_HEX = '#F7F5F0' as const;

/**
 * Плавная смесь `text.primary` → `text.inverse` по параметру 0…1 (резерв для динамических подписей).
 */
export function homeSeasonStripLabelColor(veilOpacity: number): string {
  const o = Math.max(0, Math.min(1, veilOpacity));
  const primaryPct = (1 - o) * 100;
  const inversePct = o * 100;
  return `color-mix(in srgb, ${THEME_TEXT_PRIMARY_HEX} ${primaryPct}%, ${THEME_TEXT_INVERSE_HEX} ${inversePct}%)`;
}
