/**
 * Плейсхолдер на время подгрузки ленивого чанка маршрута.
 * Высота согласована с `minHeight.route-fallback` в `tailwind.config.ts`.
 */
const RouteFallback = () => (
  <div
    className="min-h-route-fallback w-full animate-pulse bg-surface-light/80"
    aria-hidden
  />
);

export default RouteFallback;
