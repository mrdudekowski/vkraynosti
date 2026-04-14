import { useLayoutEffect, useRef, useState } from 'react';
import { TOUR_GALLERY_TILE_IMAGE_ROOT_MARGIN } from '../../constants/reveal';

export interface GalleryGridVideoProps {
  gridSrc: string;
  /** Если не задан — до появления во viewport показывается нейтральный плейсхолдер. */
  posterSrc?: string;
  className: string;
  prefersReducedMotion: boolean;
}

/**
 * Видео в сетке: до появления во viewport — постер; после — `<video>` с `preload="none"`.
 * При `prefers-reduced-motion` — только постер.
 */
const GalleryGridVideo = ({
  gridSrc,
  posterSrc,
  className,
  prefersReducedMotion,
}: GalleryGridVideoProps) => {
  const [inView, setInView] = useState(
    () => typeof IntersectionObserver === 'undefined'
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: TOUR_GALLERY_TILE_IMAGE_ROOT_MARGIN, threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  const hasPoster = posterSrc != null && posterSrc.length > 0;

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden rounded-card border-0 bg-transparent ${className}`}
      aria-hidden
    >
      {inView ? (
        <video
          className="min-h-0 h-full w-full object-cover pointer-events-none"
          src={gridSrc}
          muted
          loop
          autoPlay={!prefersReducedMotion}
          playsInline
          preload="none"
        />
      ) : hasPoster ? (
        <img
          src={posterSrc}
          alt=""
          className="min-h-0 h-full w-full object-cover pointer-events-none"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="h-full min-h-gallery-grid-video w-full bg-surface-light" />
      )}
    </div>
  );
};

export default GalleryGridVideo;
