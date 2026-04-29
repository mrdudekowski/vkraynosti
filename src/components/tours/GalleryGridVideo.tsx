import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type TransitionEvent,
} from 'react';
import { GALLERY_GRID_VIDEO_LOOP_CROSSFADE_MS } from '../../constants/galleryGridVideoLoop';
import { TOUR_GALLERY_TILE_IMAGE_ROOT_MARGIN } from '../../constants/reveal';
import { useDocumentVisibility } from '../../hooks/useDocumentVisibility';

export interface GalleryGridVideoProps {
  gridSrc: string;
  /** Если не задан — до появления во viewport показывается нейтральный плейсхолдер. */
  posterSrc?: string;
  className: string;
  prefersReducedMotion: boolean;
}

const crossfadeLeadSeconds = GALLERY_GRID_VIDEO_LOOP_CROSSFADE_MS / 1000;

const videoBaseClass =
  'absolute inset-0 min-h-0 h-full w-full object-cover pointer-events-none';

const overTransitionClass =
  'transition-opacity duration-gallery-grid-video-loop-crossfade ease-in-out';

/**
 * Два экземпляра одного клипа: нижний всегда непрозрачен, верхний только гаснет (`opacity` 1→0),
 * чтобы не просвечивал фон — визуально ближе к seamless, чем взаимный fade двух слоёв.
 */
const GalleryGridVideoLoopCrossfade = ({
  gridSrc,
  inView,
  isPageVisible,
}: {
  gridSrc: string;
  inView: boolean;
  isPageVisible: boolean;
}) => {
  const [overIndex, setOverIndex] = useState<0 | 1>(0);
  const [fadeOutOver, setFadeOutOver] = useState(false);
  const overIndexRef = useRef<0 | 1>(0);
  const fadeOutOverRef = useRef(false);
  const crossfadeBusyRef = useRef(false);
  const v0Ref = useRef<HTMLVideoElement>(null);
  const v1Ref = useRef<HTMLVideoElement>(null);

  useLayoutEffect(() => {
    overIndexRef.current = overIndex;
  }, [overIndex]);

  useLayoutEffect(() => {
    fadeOutOverRef.current = fadeOutOver;
  }, [fadeOutOver]);

  useLayoutEffect(() => {
    setOverIndex(0);
    overIndexRef.current = 0;
    setFadeOutOver(false);
    fadeOutOverRef.current = false;
    crossfadeBusyRef.current = false;
    const a = v0Ref.current;
    const b = v1Ref.current;
    a?.pause();
    b?.pause();
    if (a) a.currentTime = 0;
    if (b) b.currentTime = 0;
  }, [gridSrc]);

  const tryBeginLoopCrossfade = useCallback(() => {
    if (crossfadeBusyRef.current || fadeOutOverRef.current) return;
    const over = overIndexRef.current;
    const active = over === 0 ? v0Ref.current : v1Ref.current;
    const passive = over === 0 ? v1Ref.current : v0Ref.current;
    if (!active || !passive) return;

    const duration = active.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;

    const lead = Math.min(crossfadeLeadSeconds, Math.max(0.08, duration * 0.2));
    if (duration <= lead * 2) return;

    const remaining = duration - active.currentTime;
    const nearEnd = active.ended || remaining <= lead;
    if (!nearEnd) return;

    crossfadeBusyRef.current = true;
    passive.currentTime = 0;
    void passive
      .play()
      .then(() => {
        setFadeOutOver(true);
        fadeOutOverRef.current = true;
      })
      .catch(() => {
        crossfadeBusyRef.current = false;
      });
  }, []);

  const handleOverLayerTransitionEnd = useCallback(
    (layer: 0 | 1) => (e: TransitionEvent<HTMLVideoElement>) => {
      if (e.propertyName !== 'opacity') return;
      if (layer !== overIndexRef.current) return;
      if (!fadeOutOverRef.current) return;

      const oldOverEl = layer === 0 ? v0Ref.current : v1Ref.current;
      oldOverEl?.pause();
      if (oldOverEl) oldOverEl.currentTime = 0;

      setFadeOutOver(false);
      fadeOutOverRef.current = false;

      const newOver = (1 - layer) as 0 | 1;
      overIndexRef.current = newOver;
      setOverIndex(newOver);
      crossfadeBusyRef.current = false;
    },
    []
  );

  useLayoutEffect(() => {
    const v0 = v0Ref.current;
    const v1 = v1Ref.current;
    if (!v0 || !v1) return;

    if (!inView || !isPageVisible) {
      v0.pause();
      v1.pause();
      return;
    }

    const over = overIndex === 0 ? v0 : v1;
    void over.play().catch(() => {});
  }, [overIndex, inView, isPageVisible]);

  useEffect(() => {
    const over = overIndex === 0 ? v0Ref.current : v1Ref.current;
    if (!over) return;
    const onTimeUpdate = () => tryBeginLoopCrossfade();
    const onEnded = () => tryBeginLoopCrossfade();
    over.addEventListener('timeupdate', onTimeUpdate);
    over.addEventListener('ended', onEnded);
    return () => {
      over.removeEventListener('timeupdate', onTimeUpdate);
      over.removeEventListener('ended', onEnded);
    };
  }, [overIndex, tryBeginLoopCrossfade]);

  const layerClass = (idx: 0 | 1) => {
    const isOver = idx === overIndex;
    const z = isOver ? 'z-gallery-grid-video-loop-over' : 'z-gallery-grid-video-loop-under';
    const opacity =
      isOver && fadeOutOver ? 'opacity-0' : 'opacity-100';
    const transition = isOver ? overTransitionClass : '';
    return `${videoBaseClass} ${z} ${opacity} ${transition}`.trim();
  };

  return (
    <div className="relative min-h-0 h-full w-full bg-surface-dark">
      <video
        ref={v0Ref}
        className={layerClass(0)}
        src={gridSrc}
        muted
        playsInline
        preload="none"
        onTransitionEnd={handleOverLayerTransitionEnd(0)}
      />
      <video
        ref={v1Ref}
        className={layerClass(1)}
        src={gridSrc}
        muted
        playsInline
        preload="none"
        onTransitionEnd={handleOverLayerTransitionEnd(1)}
      />
    </div>
  );
};

/**
 * Видео в сетке: до появления во viewport — постер; после — `<video>` с `preload="none"`.
 * При `prefers-reduced-motion` — только постер; иначе зацикливание через crossfade двух экземпляров одного клипа.
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
  const [hasBeenVisible, setHasBeenVisible] = useState(
    () => typeof IntersectionObserver === 'undefined'
  );
  const isPageVisible = useDocumentVisibility();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useLayoutEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      entries => {
        const isIntersecting = entries[0]?.isIntersecting === true;
        setInView(isIntersecting);
        if (isIntersecting) {
          setHasBeenVisible(true);
        }
      },
      { rootMargin: TOUR_GALLERY_TILE_IMAGE_ROOT_MARGIN, threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  useLayoutEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (prefersReducedMotion || !inView || !isPageVisible) {
      video.pause();
      return;
    }
    void video.play().catch(() => {});
  }, [inView, isPageVisible, prefersReducedMotion]);

  const hasPoster = posterSrc != null && posterSrc.length > 0;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-card border-0 bg-transparent ${className}`}
      aria-hidden
    >
      {hasBeenVisible ? (
        prefersReducedMotion ? (
          <video
            ref={videoRef}
            className="min-h-0 h-full w-full object-cover pointer-events-none"
            src={gridSrc}
            muted
            loop
            autoPlay={!prefersReducedMotion && inView && isPageVisible}
            playsInline
            preload="none"
          />
        ) : (
          <GalleryGridVideoLoopCrossfade
            gridSrc={gridSrc}
            inView={inView}
            isPageVisible={isPageVisible}
          />
        )
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
