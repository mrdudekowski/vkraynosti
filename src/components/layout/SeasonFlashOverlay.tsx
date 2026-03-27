/**
 * Полноэкранная вспышка при смене сезона (`animation.season-flash` в `tailwind.config.ts`).
 * Монтируется с уникальным `key`, чтобы каждая смена перезапускала keyframes.
 */
const SeasonFlashOverlay = () => (
  <div
    aria-hidden
    className={[
      'fixed inset-0 z-season-flash pointer-events-none bg-surface-light',
      'animate-season-flash motion-reduce:animate-none motion-reduce:opacity-0',
    ].join(' ')}
  />
);

export default SeasonFlashOverlay;
