/**
 * Передаётся в `navigate(..., { state })`, чтобы Layout не делал scroll-to-top
 * (переключение сезона в navbar — позиция скролла сохраняется).
 */
export const NAV_STATE_SKIP_SCROLL_TO_TOP = { skipScrollToTop: true } as const;

export function locationStateSkipsScrollToTop(state: unknown): boolean {
  return (
    typeof state === 'object' &&
    state !== null &&
    'skipScrollToTop' in state &&
    (state as { skipScrollToTop?: boolean }).skipScrollToTop === true
  );
}
