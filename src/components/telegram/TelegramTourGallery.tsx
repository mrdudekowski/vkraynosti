import {
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
  const viewportRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const draggingRef = useRef(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
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

  useEffect(() => {
    const viewport = viewportRef.current;
    if (viewport == null) {
      return;
    }

    const onTouchMove = (event: globalThis.TouchEvent) => {
      if (!draggingRef.current || !hasMultiple) {
        return;
      }
      const touch = event.touches[0];
      if (touch == null) {
        return;
      }
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > STRIP_DRAG_THRESHOLD_PX) {
        draggingRef.current = false;
        setDragX(0);
        return;
      }
      event.preventDefault();
      setDragX(deltaX);
    };

    viewport.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => viewport.removeEventListener('touchmove', onTouchMove);
  }, [hasMultiple]);

  const finishSwipe = (deltaX: number) => {
    draggingRef.current = false;
    setIsDragging(false);
    setDragX(0);
    if (!hasMultiple || Math.abs(deltaX) < SWIPE_THRESHOLD_PX) {
      return;
    }
    if (deltaX < 0) {
      next();
    } else {
      prev();
    }
  };

  const handleTouchStart = (event: ReactTouchEvent) => {
    const touch = event.touches[0];
    if (touch == null) {
      return;
    }
    draggingRef.current = true;
    setIsDragging(true);
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    setDragX(0);
  };

  const handleTouchEnd = (event: ReactTouchEvent) => {
    const touch = event.changedTouches[0];
    if (touch == null) {
      finishSwipe(0);
      return;
    }
    finishSwipe(touch.clientX - touchStartRef.current.x);
  };

  const handleTouchCancel = () => {
    finishSwipe(0);
  };

  const slideTransition =
    prefersReducedMotion || isDragging
      ? 'transition-none'
      : 'transition-transform duration-300 ease-out';

  return createPortal(
    <div
      className="fixed inset-0 z-modal flex items-center justify-center bg-black/95"
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        className="relative flex h-full w-full max-w-lg flex-col touch-pan-y"
        role="dialog"
        aria-modal="true"
        aria-label={UI.telegramMiniApp.galleryViewerAria}
        onClick={event => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-text-inverse transition-colors duration-hover hover:bg-black/70"
          aria-label={UI.modal.close}
        >
          <FontAwesomeIcon icon={faTimes} aria-hidden />
        </button>

        <div
          ref={viewportRef}
          className="flex flex-1 touch-pan-y overflow-hidden px-0 pb-16 pt-14"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
        >
          <div
            className={`flex h-full w-full ${slideTransition}`}
            style={{
              transform: `translateX(calc(-${current * 100}% + ${dragX}px))`,
            }}
          >
            {urls.map(url => (
              <div
                key={url}
                className="flex h-full w-full shrink-0 items-center justify-center px-4"
              >
                <PlaceholderImage
                  src={url}
                  alt={tourTitle}
                  className="max-h-full max-w-full"
                  imgClassName="max-h-[calc(100dvh-8rem)] w-full select-none object-contain"
                  loading="eager"
                  fetchPriority="high"
                />
              </div>
            ))}
          </div>
        </div>

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-text-inverse transition-colors duration-hover hover:bg-black/70 sm:flex"
              aria-label={UI.telegramMiniApp.carouselPrevious}
            >
              <FontAwesomeIcon icon={faChevronLeft} aria-hidden />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-text-inverse transition-colors duration-hover hover:bg-black/70 sm:flex"
              aria-label={UI.telegramMiniApp.carouselNext}
            >
              <FontAwesomeIcon icon={faChevronRight} aria-hidden />
            </button>
            <p
              className="pointer-events-none absolute inset-x-0 bottom-6 text-center font-body text-sm text-text-inverse/80"
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
            key={url}
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
