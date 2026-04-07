/**
 * Канонические цвета `colors.text.*` в tailwind.config.ts (импорт отсюда).
 */

export const THEME_TEXT_PRIMARY_HEX = '#1A1A1A' as const;
export const THEME_TEXT_INVERSE_HEX = '#F7F5F0' as const;

/**
 * Цвет подписи «В другой сезон» на главной: плавная смесь primary → inverse с ростом `veilOpacity`
 * (синхронно с чёрной вуалью `useHomeSeasonBannerWhiteVeil`).
 */
export function homeSeasonStripLabelColor(veilOpacity: number): string {
  const o = Math.max(0, Math.min(1, veilOpacity));
  const primaryPct = (1 - o) * 100;
  const inversePct = o * 100;
  return `color-mix(in srgb, ${THEME_TEXT_PRIMARY_HEX} ${primaryPct}%, ${THEME_TEXT_INVERSE_HEX} ${inversePct}%)`;
}
