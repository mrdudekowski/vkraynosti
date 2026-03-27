import { useEffect, useRef, useState } from 'react';
import { TOUR_GALLERY_TILE_IMAGE_ROOT_MARGIN } from '../../constants/reveal';

interface PlaceholderImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Доп. классы для `object-position` и т.п. (токены темы). */
  imgClassName?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  /** Не задавать `src`, пока узел не приблизится к вьюпорту (IntersectionObserver). */
  deferSrcUntilVisible?: boolean;
}

const PlaceholderImage = ({
  src,
  alt,
  className = '',
  imgClassName = '',
  loading = 'lazy',
  fetchPriority,
  deferSrcUntilVisible = false,
}: PlaceholderImageProps) => {
  const [showSrc, setShowSrc] = useState(!deferSrcUntilVisible);
  const observerTargetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!deferSrcUntilVisible) {
      setShowSrc(true);
      return;
    }
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShowSrc(true);
      return;
    }
    setShowSrc(false);
  }, [src, deferSrcUntilVisible]);

  useEffect(() => {
    if (!deferSrcUntilVisible || showSrc) return;
    if (typeof IntersectionObserver === 'undefined') {
      setShowSrc(true);
      return;
    }
    const el = observerTargetRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          setShowSrc(true);
          observer.disconnect();
        }
      },
      { rootMargin: TOUR_GALLERY_TILE_IMAGE_ROOT_MARGIN, threshold: 0.01 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [deferSrcUntilVisible, showSrc, src]);

  if (deferSrcUntilVisible && !showSrc) {
    return (
      <div
        ref={observerTargetRef}
        className={`min-h-0 h-full w-full object-cover bg-surface-light ${imgClassName} ${className}`.trim()}
        aria-hidden
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`object-cover ${imgClassName} ${className}`.trim()}
      loading={loading}
      fetchPriority={fetchPriority}
    />
  );
};

export default PlaceholderImage;
