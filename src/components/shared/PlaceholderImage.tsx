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
  /** Responsive-кандидаты для `<img srcSet>` (например, mobile + desktop cover). */
  srcSet?: string;
  /** Правила выбора из `srcSet` в текущем лейауте. */
  sizes?: string;
  /** Не задавать `src`, пока узел не приблизится к вьюпорту (IntersectionObserver). */
  deferSrcUntilVisible?: boolean;
}

/** `key={src}` на уровне вызывающего не обязателен — сброс при смене `src` через remount здесь. */
const DeferredPlaceholderImage = ({
  src,
  alt,
  className = '',
  imgClassName = '',
  loading = 'lazy',
  fetchPriority,
  srcSet,
  sizes,
}: Omit<PlaceholderImageProps, 'deferSrcUntilVisible'>) => {
  const [showSrc, setShowSrc] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const observerTargetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (showSrc) return;
    if (typeof IntersectionObserver === 'undefined') {
      queueMicrotask(() => {
        setShowSrc(true);
      });
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
  }, [showSrc, src]);

  if (!showSrc) {
    return (
      <div
        ref={observerTargetRef}
        className={`min-h-0 h-full w-full object-cover bg-surface-light motion-safe:animate-media-placeholder-shimmer motion-reduce:opacity-100 ${imgClassName} ${className}`.trim()}
        aria-hidden
      />
    );
  }

  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      className={`object-cover ${imgClassName} ${className}`.trim()}
      loading={loading}
      fetchPriority={fetchPriority}
      decoding="async"
    />
  );
};

const PlaceholderImage = ({
  src,
  alt,
  className = '',
  imgClassName = '',
  loading = 'lazy',
  fetchPriority,
  srcSet,
  sizes,
  deferSrcUntilVisible = false,
}: PlaceholderImageProps) => {
  if (!deferSrcUntilVisible) {
    return (
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        className={`object-cover ${imgClassName} ${className}`.trim()}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
      />
    );
  }

  return (
    <DeferredPlaceholderImage
      key={src}
      src={src}
      alt={alt}
      className={className}
      imgClassName={imgClassName}
      loading={loading}
      fetchPriority={fetchPriority}
      srcSet={srcSet}
      sizes={sizes}
    />
  );
};

export default PlaceholderImage;
