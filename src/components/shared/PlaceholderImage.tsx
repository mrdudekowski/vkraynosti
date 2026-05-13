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

const placeholderClassName = 'tour-card-skeleton-media min-h-0 h-full w-full object-cover';

const ImageWithLoadPlaceholder = ({
  src,
  alt,
  className = '',
  imgClassName = '',
  loading = 'lazy',
  fetchPriority,
  srcSet,
  sizes,
}: Omit<PlaceholderImageProps, 'deferSrcUntilVisible'>) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const imageStateClassName = isLoaded && !hasError ? 'opacity-100' : 'opacity-0';

  return (
    <div className={`relative overflow-hidden ${className}`.trim()}>
      {(!isLoaded || hasError) && (
        <div
          className="tour-card-skeleton-media absolute inset-0 min-h-0 h-full w-full"
          aria-hidden
        />
      )}
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        className={`absolute inset-0 min-h-0 h-full w-full object-cover transition-opacity duration-hover motion-reduce:transition-none ${imageStateClassName} ${imgClassName}`.trim()}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
      />
    </div>
  );
};

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
        className={`${placeholderClassName} ${imgClassName} ${className}`.trim()}
        aria-hidden
      />
    );
  }

  return (
    <ImageWithLoadPlaceholder
      key={`${src}\0${srcSet ?? ''}`}
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      className={className}
      imgClassName={imgClassName}
      loading={loading}
      fetchPriority={fetchPriority}
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
      <ImageWithLoadPlaceholder
        key={`${src}\0${srcSet ?? ''}`}
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        className={className}
        imgClassName={imgClassName}
        loading={loading}
        fetchPriority={fetchPriority}
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
