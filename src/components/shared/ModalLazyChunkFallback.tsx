import { UI } from '../../constants/ui';

/**
 * Полноэкранный лёгкий плейсхолдер на время подгрузки ленивого чанка модалки.
 * Визуально близок к оверлею существующих модалок (`bg-black/50`, `z-modal`).
 */
const ModalLazyChunkFallback = () => (
  <div
    className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    role="status"
    aria-live="polite"
    aria-busy="true"
    aria-label={UI.modal.lazyChunkLoadingLabel}
  >
    <div
      className="flex min-h-modal-lazy-placeholder w-full max-w-lg flex-col items-center justify-center gap-4 rounded-modal bg-white p-8 shadow-xl"
      aria-hidden
    >
      <div className="h-1.5 w-28 animate-pulse rounded-full bg-brand-primary/35" />
      <div className="h-1.5 w-20 animate-pulse rounded-full bg-brand-primary/20" />
    </div>
  </div>
);

export default ModalLazyChunkFallback;
