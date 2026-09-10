import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type TouchEvent as ReactTouchEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons/faChevronLeft';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight';
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';
import PlaceholderImage from '../shared/PlaceholderImage';
import { UI } from '../../constants/ui';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useCarousel } from '../../hooks/useCarousel';
import { useModalFocusTrap } from '../../hooks/useModalFocusTrap';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface TelegramTourGalleryProps {
  urls: string[];
  tourTitle: string;
}

const SWIPE_THRESHOLD_PX = 48;
const STRIP_DRAG_THRESHOLD_PX = 8;

const useStripTapGuard = () => {
  const dragRef = useRef(false);
  const startXRef = useRef(0);

  const onPointerDown = (event: ReactPointerEvent) => {
    dragRef.current = false;
    startXRef.current = event.clientX;
  };

  const onPointerMove = (event: ReactPointerEvent) => {
    if (Math.abs(event.clientX - startXRef.current) > STRIP_DRAG_THRESHOLD_PX) {
      dragRef.current = true;
    }
  };

  const shouldIgnoreClick = () => {
    const ignore = dragRef.current;
    dragRef.current = false;
    return ignore;
  };

  return { onPointerDown, onPointerMove, shouldIgnoreClick };
};

const TelegramGalleryLightbox = ({
  urls,
  initialIndex,
  tourTitle,
  onClose,
}: {
  urls: string[];
  initialIndex: number;
  tourTitle: string;
  onClose: () => void;
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const prefersReducedMotion = usePrefersReducedMotion();
  const { current, next, prev, goTo } = useCarousel({ total: urls.length });
  const hasMultiple = urls.length > 1;

  useBodyScrollLock(true);
  useModalFocusTrap(panelRef, onClose);

  useEffect(() => {
    goTo(initialIndex);
  }, [goTo, initialIndex]);

  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    if (webApp == null) {
      return;
    }
    webApp.BackButton?.show();
    webApp.BackButton?.onClick(onClose);
    return () => {
      webApp.BackButton?.offClick(onClose);
      webApp.BackButton?.hide();
    };
  }, [onClose]);

  const finishSwipe = useCallback(
    (deltaX: number) => {
      if (!hasMultiple || Math.abs(deltaX) < SWIPE_THRESHOLD_PX) {
        return;
      }
      if (deltaX < 0) {
        next();
      } else {
        prev();
      }
    },
    [hasMultiple, next, prev],
  );

  const handleTouchStart = (event: ReactTouchEvent) => {
    const touch = event.touches[0];
    if (touch == null) {
      return;
    }
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: ReactTouchEvent) => {
    const touch = event.changedTouches[0];
    if (touch == null) {
      return;
    }
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      return;
    }
    finishSwipe(deltaX);
  };

  const slideTransition = prefersReducedMotion
    ? 'transition-none'
    : 'transition-opacity duration-300 ease-out';

  return createPortal(
    <div
      className="fixed inset-0 z-modal flex items-center justify-center bg-black/95"
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        className="relative flex h-full w-full flex-col touch-none overscroll-none"
        role="dialog"
        aria-modal="true"
        aria-label={UI.telegramMiniApp.galleryViewerAria}
        onClick={event => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-text-inverse transition-colors duration-hover hover:bg-black/70"
          aria-label={UI.modal.close}
        >
          <FontAwesomeIcon icon={faTimes} aria-hidden />
        </button>

        <div
          className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-16 pt-14"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={() => undefined}
        >
          {urls.map((url, index) => {
            const isActive = index === current;
            return (
              <div
                key={`${index}-${url}`}
                className={`absolute inset-x-4 bottom-16 top-14 flex items-center justify-center ${slideTransition} ${
                  isActive ? 'z-10 opacity-100' : 'pointer-events-none z-0 opacity-0'
                }`}
                aria-hidden={!isActive}
              >
                <img
                  src={url}
                  alt={`${tourTitle} — ${index + 1}`}
                  className="max-h-[calc(100dvh-8rem)] max-w-full object-contain pointer-events-none select-none"
                  draggable={false}
                  loading={isActive ? 'eager' : 'lazy'}
                  fetchPriority={isActive ? 'high' : 'auto'}
                  decoding="async"
                />
              </div>
            );
          })}
        </div>

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-2 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-text-inverse transition-colors duration-hover hover:bg-black/70 sm:flex"
              aria-label={UI.telegramMiniApp.carouselPrevious}
            >
              <FontAwesomeIcon icon={faChevronLeft} aria-hidden />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-2 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-text-inverse transition-colors duration-hover hover:bg-black/70 sm:flex"
              aria-label={UI.telegramMiniApp.carouselNext}
            >
              <FontAwesomeIcon icon={faChevronRight} aria-hidden />
            </button>
            <p
              className="pointer-events-none absolute inset-x-0 bottom-6 z-20 text-center font-body text-sm text-text-inverse/80"
              aria-live="polite"
            >
              {current + 1} / {urls.length}
            </p>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
};

const TelegramTourGallery = ({ urls, tourTitle }: TelegramTourGalleryProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const stripTapGuard = useStripTapGuard();

  if (urls.length === 0) {
    return null;
  }

  return (
    <>
      <div
        className="scrollbar-none mt-6 flex snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain pb-1 touch-pan-x"
        onPointerDown={stripTapGuard.onPointerDown}
        onPointerMove={stripTapGuard.onPointerMove}
      >
        {urls.map((url, index) => (
          <button
            key={`${index}-${url}`}
            type="button"
            className="relative h-20 w-24 shrink-0 snap-start overflow-hidden rounded-card focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary"
            aria-label={`${UI.telegramMiniApp.openGalleryPhoto} ${index + 1}`}
            onClick={() => {
              if (stripTapGuard.shouldIgnoreClick()) {
                return;
              }
              setOpenIndex(index);
            }}
          >
            <PlaceholderImage
              src={url}
              alt=""
              className="h-full w-full"
              imgClassName="pointer-events-none h-full w-full select-none object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {openIndex != null && (
        <TelegramGalleryLightbox
          urls={urls}
          initialIndex={openIndex}
          tourTitle={tourTitle}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </>
  );
};

export default TelegramTourGallery;
