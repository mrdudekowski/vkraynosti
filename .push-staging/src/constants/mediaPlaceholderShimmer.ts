/**
 * Мягкий пульс плитки до появления `src` (`PlaceholderImage`, класс `.tour-card-skeleton-media`).
 * Не смешивать с `tour-card-skeleton-sheen` на линиях карточки — см. `tourCardSkeletonShimmer.ts`.
 * Синхронно с `keyframes.media-placeholder-shimmer` и `animation.media-placeholder-shimmer` в `tailwind.config.ts`.
 */
export const MEDIA_PLACEHOLDER_SHIMMER_MS = 1400 as const;
