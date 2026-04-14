import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons/faChevronLeft';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight';
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';
import { UI } from '../../constants/ui';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { isVideoAssetUrl } from '../../utils/isVideoAssetUrl';

interface TourPhotoViewerProps {
  images: string[];
  initialIndex: number;
  tourTitle: string;
  onClose: () => void;
}

const TourPhotoViewer = ({
  images,
  initialIndex,
  tourTitle,
  onClose,
}: TourPhotoViewerProps) => {
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.min(Math.max(0, initialIndex), Math.max(0, images.length - 1))
  );

  useBodyScrollLock(true);

  const goPrev = useCallback(() => {
    setActiveIndex(i => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex(i => Math.min(images.length - 1, i + 1));
  }, [images.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (images.length <= 1) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, images.length, goPrev, goNext]);

  const gp = UI.tourDetail.galleryPhoto;
  const activeSrc = images[activeIndex];
  const humanN = activeIndex + 1;
  const alt = `${tourTitle} — фото ${humanN}`;
  const canPrev = activeIndex > 0;
  const canNext = activeIndex < images.length - 1;
  const hasNav = images.length > 1;

  const counterText = gp.viewerCounter
    .replace('{current}', String(humanN))
    .replace('{total}', String(images.length));

  const navBtnClass =
    'flex h-12 w-12 shrink-0 items-center justify-center self-center rounded-full bg-photo-viewer-nav text-text-inverse transition-colors duration-hover hover:bg-photo-viewer-nav-hover disabled:pointer-events-none disabled:opacity-40 md:h-14 md:w-14';

  const content = (
    <div
      className="fixed inset-0 z-modal flex flex-col bg-surface-dark/95"
      role="dialog"
      aria-modal="true"
      aria-label={gp.viewerDialogAria}
    >
      <div className="flex shrink-0 items-start justify-between gap-4 p-4">
        <p
          className="min-w-0 flex-1 pt-2 text-center text-tooltip text-text-inverse opacity-80 md:text-left md:pt-3"
          aria-live="polite"
        >
          {counterText}
        </p>
        <button
          type="button"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black/40 text-text-inverse transition-colors duration-hover hover:bg-black/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          aria-label={UI.modal.close}
          onClick={onClose}
        >
          <FontAwesomeIcon icon={faTimes} className="text-xl" aria-hidden />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-row items-stretch gap-photo-viewer-nav-gap px-2 pb-4 md:px-4 md:pb-6">
        {hasNav && (
          <button
            type="button"
            className={`${navBtnClass} hidden md:flex`}
            aria-label={gp.viewerPrevAria}
            disabled={!canPrev}
            onClick={e => {
              e.stopPropagation();
              goPrev();
            }}
          >
            <FontAwesomeIcon
              icon={faChevronLeft}
              className="text-lg md:text-xl"
              aria-hidden
            />
          </button>
        )}

        <div
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overflow-x-auto overscroll-contain md:overflow-hidden md:items-center md:justify-center"
          onClick={onClose}
        >
          <div
            className="flex w-full shrink-0 justify-center p-4 md:max-h-full md:max-w-full md:items-center"
            onClick={e => e.stopPropagation()}
          >
            {isVideoAssetUrl(activeSrc) ? (
              <video
                key={activeSrc}
                className="h-auto w-auto max-w-none object-contain md:max-h-photo-viewer md:max-w-full"
                src={activeSrc}
                controls
                playsInline
                preload="metadata"
              >
                {alt}
              </video>
            ) : (
              <img
                key={activeSrc}
                src={activeSrc}
                alt={alt}
                className="h-auto w-auto max-w-none object-contain md:max-h-photo-viewer md:max-w-full"
                loading="eager"
                decoding="async"
              />
            )}
          </div>
        </div>

        {hasNav && (
          <button
            type="button"
            className={`${navBtnClass} hidden md:flex`}
            aria-label={gp.viewerNextAria}
            disabled={!canNext}
            onClick={e => {
              e.stopPropagation();
              goNext();
            }}
          >
            <FontAwesomeIcon
              icon={faChevronRight}
              className="text-lg md:text-xl"
              aria-hidden
            />
          </button>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default TourPhotoViewer;
