/**
 * Crossfade между двумя экземплярами одного клипа в `GalleryGridVideo`, чтобы смягчить
 * визуальный рывок на стыке зацикливания (вместо нативного `loop`).
 */
export const GALLERY_GRID_VIDEO_LOOP_CROSSFADE_MS = 480 as const;

/**
 * Плавное исчезновение постера поверх сеточного видео после готовности активного слоя.
 * Синхронно с `transitionDuration.gallery-grid-video-poster-reveal` в `tailwind.config.ts`.
 */
export const GALLERY_GRID_VIDEO_POSTER_REVEAL_MS = 360 as const;

/**
 * Запас после длительности reveal, если `transitionend` не пришёл (например `motion-reduce:transition-none`).
 * Снимает оверлей постера с `pointer-events-none`, чтобы не держать лишний слой без толку.
 */
export const GALLERY_GRID_VIDEO_POSTER_REVEAL_END_SLACK_MS = 80 as const;

/** Минимальный lead (сек.) перед концом клипа при расчёте окна crossfade. */
export const GALLERY_GRID_VIDEO_LOOP_CROSSFADE_LEAD_MIN_SECONDS = 0.08 as const;

/** Верхняя граница lead как доля длительности клипа (`Math.min` с фактическим lead). */
export const GALLERY_GRID_VIDEO_LOOP_CROSSFADE_LEAD_MAX_FRACTION_OF_DURATION = 0.2 as const;
