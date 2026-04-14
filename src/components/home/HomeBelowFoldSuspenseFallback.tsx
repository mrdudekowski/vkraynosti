/**
 * Плейсхолдер на время подгрузки ленивых секций под сеткой туров на главной.
 * Высота — `minHeight.home-below-fold-suspense` в `tailwind.config.ts`.
 */
const HomeBelowFoldSuspenseFallback = () => (
  <div
    className="min-h-home-below-fold-suspense w-full animate-pulse bg-surface-light/80"
    aria-hidden
  />
);

export default HomeBelowFoldSuspenseFallback;
