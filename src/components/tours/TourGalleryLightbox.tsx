import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faTimes } from '@fortawesome/free-solid-svg-icons';
import { UI } from '../../constants/ui';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useModalFocusTrap } from '../../hooks/useModalFocusTrap';

interface TourGalleryLightboxProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
  /** Подпись тура для alt и aria. */
  tourTitle: string;
}

const TourGalleryLightbox = ({
  images,
  initialIndex,
  onClose,
  tourTitle,
}: TourGalleryLightboxProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const startIndex = useMemo(
    () => Math.min(Math.max(0, initialIndex), Math.max(0, images.length - 1)),
    [initialIndex, images.length]
  );

  const [activeIndex, setActiveIndex] = useState(startIndex);

  useEffect(() => {
    setActiveIndex(startIndex);
  }, [startIndex]);

  useBodyScrollLock(true);
  useModalFocusTrap(panelRef, onClose);

  useLayoutEffect(() => {
    closeBtnRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setActiveIndex(i => Math.max(0, i - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setActiveIndex(i => Math.min(images.length - 1, i + 1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [images.length]);

  if (images.length === 0) return null;

  const lb = UI.tourDetail.galleryLightbox;
  const activeSrc = images[activeIndex];
  const canPrev = activeIndex > 0;
  const canNext = activeIndex < images.length - 1;

  const content = (
    <div
      className="fixed inset-0 z-modal flex flex-col bg-surface-dark/95 md:items-center md:justify-center md:p-8"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={lb.dialogAriaLabel}
        className="flex min-h-0 flex-1 flex-col overflow-hidden md:max-h-lightbox-panel md:w-full md:max-w-5xl md:rounded-card"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative flex shrink-0 justify-end p-4">
          <button
            ref={closeBtnRef}
            type="button"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-text-inverse transition-colors duration-hover hover:bg-black/60"
            aria-label={lb.closeAria}
            onClick={onClose}
          >
            <FontAwesomeIcon icon={faTimes} className="text-xl" />
          </button>
        </div>

        <p
          className="shrink-0 px-4 pt-1 text-center text-tooltip text-text-inverse opacity-80"
          aria-live="polite"
        >
          {lb.slideCounter
            .replace('{current}', String(activeIndex + 1))
            .replace('{total}', String(images.length))}
        </p>

        <div className="flex min-h-0 flex-1 items-stretch gap-lightbox-nav-gap px-2 pb-2 pt-2 md:px-4 md:pb-4 md:pt-2">
          {images.length > 1 && (
            <button
              type="button"
              className="flex h-12 w-12 shrink-0 items-center justify-center self-center rounded-full bg-lightbox-nav-arrow text-text-inverse transition-colors duration-hover hover:bg-lightbox-nav-arrow-hover disabled:pointer-events-none disabled:opacity-40 md:h-14 md:w-14"
              aria-label={lb.prevSlideAria}
              disabled={!canPrev}
              onClick={() => setActiveIndex(i => Math.max(0, i - 1))}
            >
              <FontAwesomeIcon icon={faChevronLeft} className="text-lg md:text-xl" aria-hidden />
            </button>
          )}

          <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center">
            <div className="flex h-full w-full max-h-lightbox-stage max-w-full items-center justify-center overflow-hidden">
              <img
                src={activeSrc}
                alt={`${tourTitle} — фото ${activeIndex + 1}`}
                className="max-h-full max-w-full object-contain"
                loading="eager"
                decoding="async"
              />
            </div>
          </div>

          {images.length > 1 && (
            <button
              type="button"
              className="flex h-12 w-12 shrink-0 items-center justify-center self-center rounded-full bg-lightbox-nav-arrow text-text-inverse transition-colors duration-hover hover:bg-lightbox-nav-arrow-hover disabled:pointer-events-none disabled:opacity-40 md:h-14 md:w-14"
              aria-label={lb.nextSlideAria}
              disabled={!canNext}
              onClick={() => setActiveIndex(i => Math.min(images.length - 1, i + 1))}
            >
              <FontAwesomeIcon icon={faChevronRight} className="text-lg md:text-xl" aria-hidden />
            </button>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex shrink-0 justify-center gap-2 px-4 pb-6 pt-2">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`h-2.5 w-2.5 rounded-full transition-all duration-hover ${
                  idx === activeIndex ? 'scale-125 bg-brand-secondary' : 'bg-white/40 hover:bg-white/70'
                }`}
                aria-label={lb.slideDotAria.replace('{n}', String(idx + 1))}
                onClick={() => setActiveIndex(idx)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default TourGalleryLightbox;
