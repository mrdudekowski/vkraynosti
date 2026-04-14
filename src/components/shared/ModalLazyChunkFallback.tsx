import { UI } from '../../constants/ui';

/**
 * Полноэкранный плейсхолдер на время подгрузки ленивого чанка модалки.
 * Визуально близок к оверлею существующих модалок (`bg-black/50`, `z-modal`).
 */
const ModalLazyChunkFallback = () => (
  <div
    className="fixed inset-0 z-modal flex flex-col items-center justify-center gap-4 p-4 bg-black/50 backdrop-blur-sm"
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <div className="relative h-21 w-21 shrink-0" aria-hidden>
      <span className="absolute bottom-0 left-1/2 block h-16 w-16 rounded-full bg-text-inverse animate-modal-chunk-loader-bubble" />
      <span className="absolute bottom-0 left-1/2 block h-16 w-16 rounded-full bg-text-inverse animate-modal-chunk-loader-bubble delay-modal-chunk-stagger" />
    </div>
    <p className="max-w-md text-center text-sm font-medium text-text-inverse/90">
      {UI.modal.lazyChunkLoadingLabel}
    </p>
  </div>
);

export default ModalLazyChunkFallback;
