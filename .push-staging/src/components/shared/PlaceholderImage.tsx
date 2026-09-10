import { useCallback, useEffect, useRef, useState } from 'react';

import { TOUR_GALLERY_TILE_IMAGE_ROOT_MARGIN } from '../../constants/reveal';



type PlaceholderImageLayout = 'fill' | 'intrinsic';



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

  /** `fill` — absolute inset-0 (карточки туров); `intrinsic` — img в normal flow, контейнер = фото. */

  layout?: PlaceholderImageLayout;

}



const placeholderClassName = 'tour-card-skeleton-media min-h-0 h-full w-full object-cover';



const intrinsicLoadingClassName = 'min-h-[8rem] min-w-[5rem]';



interface ImageWithLoadPlaceholderProps extends Omit<PlaceholderImageProps, 'deferSrcUntilVisible'> {

  layout: PlaceholderImageLayout;

}



const ImageWithLoadPlaceholder = ({

  src,

  alt,

  className = '',

  imgClassName = '',

  loading = 'lazy',

  fetchPriority,

  srcSet,

  sizes,

  layout,

}: ImageWithLoadPlaceholderProps) => {

  const [isLoaded, setIsLoaded] = useState(false);

  const [hasError, setHasError] = useState(false);

  const handleImageRef = useCallback((node: HTMLImageElement | null) => {
    if (node?.complete && node.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, []);



  const imageStateClassName = isLoaded && !hasError ? 'opacity-100' : 'opacity-0';

  const showPlaceholder = !isLoaded || hasError;



  if (layout === 'intrinsic') {

    const wrapperClassName = [

      'relative block w-fit max-w-full',

      showPlaceholder ? intrinsicLoadingClassName : '',

      className,

    ]

      .filter(Boolean)

      .join(' ');



    return (

      <div className={wrapperClassName}>

        {showPlaceholder ? (

          <div

            className="tour-card-skeleton-media pointer-events-none absolute inset-0"

            aria-hidden

          />

        ) : null}

        <img

          ref={handleImageRef}

          src={src}

          srcSet={srcSet}

          sizes={sizes}

          alt={alt}

          className={`block h-auto w-auto max-w-full transition-opacity duration-hover motion-reduce:transition-none ${imageStateClassName} ${imgClassName}`.trim()}

          loading={loading}

          fetchPriority={fetchPriority}

          decoding="async"

          onLoad={() => setIsLoaded(true)}

          onError={() => setHasError(true)}

        />

      </div>

    );

  }



  return (

    <div className={`relative overflow-hidden ${className}`.trim()}>

      {showPlaceholder && (

        <div
          className="tour-card-skeleton-media absolute inset-0 min-h-0 h-full w-full"
          aria-hidden
        />

      )}

      <img

        ref={handleImageRef}

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

  layout = 'fill',

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

      layout={layout}

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

  layout = 'fill',

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

        layout={layout}

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

      layout={layout}

    />

  );

};



export default PlaceholderImage;


