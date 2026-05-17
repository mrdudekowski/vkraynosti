import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type TransitionEvent,
  type TransitionEventHandler,
} from 'react';
import {
  GALLERY_GRID_VIDEO_LOOP_CROSSFADE_LEAD_MAX_FRACTION_OF_DURATION,
  GALLERY_GRID_VIDEO_LOOP_CROSSFADE_LEAD_MIN_SECONDS,
  GALLERY_GRID_VIDEO_LOOP_CROSSFADE_MS,
  GALLERY_GRID_VIDEO_POSTER_REVEAL_END_SLACK_MS,
  GALLERY_GRID_VIDEO_POSTER_REVEAL_MS,
} from '../../constants/galleryGridVideoLoop';
import { TOUR_GALLERY_TILE_IMAGE_ROOT_MARGIN } from '../../constants/reveal';
import { useActiveMediaSlot } from '../../hooks/useActiveMediaSlot';
import { useDocumentVisibility } from '../../hooks/useDocumentVisibility';

export interface GalleryGridVideoProps {
  gridSrc: string;
  /** Если не задан — до появления во viewport показывается нейтральный плейсхолдер. */
  posterSrc?: string;
  className: string;
  /** Доп. классы `object-position` для `<video>` и постера (токены темы). */
  videoObjectClassName?: string;
  prefersReducedMotion: boolean;
}

const crossfadeLeadSeconds = GALLERY_GRID_VIDEO_LOOP_CROSSFADE_MS / 1000;

const videoBaseClass =
  'absolute inset-0 min-h-0 h-full w-full object-cover pointer-events-none';

const overTransitionClass =
  'transition-opacity duration-gallery-grid-video-loop-crossfade ease-in-out';
const GALLERY_GRID_VIDEO_UNMOUNT_GRACE_MS = 1400;

/**
 * Два экземпляра одного клипа: нижний всегда непрозрачен, верхний только гаснет (`opacity` 1→0),
 * чтобы не просвечивал фон — визуально ближе к seamless, чем взаимный fade двух слоёв.
 */
const GalleryGridVideoLoopCrossfade = ({
  gridSrc,
  inView,
  isPageVisible,
  onActiveLayerReady,
  videoObjectClassName,
}: {
  gridSrc: string;
  inView: boolean;
  isPageVisible: boolean;
  /** Один раз, когда активный слой может показать кадр (постер можно гасить поверх). */
  onActiveLayerReady?: () => void;
  videoObjectClassName?: string;
}) => {
  const [overIndex, setOverIndex] = useState<0 | 1>(0);
  const [fadeOutOver, setFadeOutOver] = useState(false);
  const overIndexRef = useRef<0 | 1>(0);
  const fadeOutOverRef = useRef(false);
  const crossfadeBusyRef = useRef(false);
  const v0Ref = useRef<HTMLVideoElement>(null);
  const v1Ref = useRef<HTMLVideoElement>(null);
  const onReadyRef = useRef(onActiveLayerReady);
  const layerReadyNotifiedRef = useRef(false);

  useLayoutEffect(() => {
    onReadyRef.current = onActiveLayerReady;
  }, [onActiveLayerReady]);

  useEffect(() => {
    layerReadyNotifiedRef.current = false;
  }, [gridSrc]);

  useLayoutEffect(() => {
    overIndexRef.current = overIndex;
  }, [overIndex]);

  useLayoutEffect(() => {
    fadeOutOverRef.current = fadeOutOver;
  }, [fadeOutOver]);

  const tryBeginLoopCrossfade = useCallback(() => {
    if (crossfadeBusyRef.current || fadeOutOverRef.current) return;
    const over = overIndexRef.current;
    const active = over === 0 ? v0Ref.current : v1Ref.current;
    const passive = over === 0 ? v1Ref.current : v0Ref.current;
    if (!active || !passive) return;

    const duration = active.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;

    const lead = Math.min(
      crossfadeLeadSeconds,
      Math.max(
        GALLERY_GRID_VIDEO_LOOP_CROSSFADE_LEAD_MIN_SECONDS,
        duration * GALLERY_GRID_VIDEO_LOOP_CROSSFADE_LEAD_MAX_FRACTION_OF_DURATION
      )
    );
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

  useEffect(() => {
    if (!onReadyRef.current) return;
    if (!inView || !isPageVisible) return;

    const over = overIndex === 0 ? v0Ref.current : v1Ref.current;
    if (!over) return;

    const notify = () => {
      if (layerReadyNotifiedRef.current) return;
      layerReadyNotifiedRef.current = true;
      onReadyRef.current?.();
    };

    if (over.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      notify();
      return;
    }

    over.addEventListener('canplay', notify, { once: true });
    return () => {
      over.removeEventListener('canplay', notify);
    };
  }, [gridSrc, inView, isPageVisible, overIndex]);

  const layerClass = (idx: 0 | 1) => {
    const isOver = idx === overIndex;
    const z = isOver ? 'z-gallery-grid-video-loop-over' : 'z-gallery-grid-video-loop-under';
    const opacity =
      isOver && fadeOutOver ? 'opacity-0' : 'opacity-100';
    const transition = isOver ? overTransitionClass : '';
    return `${videoBaseClass}${videoObjectClassName ? ` ${videoObjectClassName}` : ''} ${z} ${opacity} ${transition}`.trim();
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

/** Состояние постера / готовности слоя сбрасывается перемонтированием (`key` у родителя), без `setState` в эффекте. */
const GalleryGridVideoMotionBranch = ({
  gridSrc,
  posterSrc,
  inView,
  isPageVisible,
  videoObjectClassName,
}: {
  gridSrc: string;
  posterSrc: string | undefined;
  inView: boolean;
  isPageVisible: boolean;
  videoObjectClassName?: string;
}) => {
  const hasPoster = posterSrc != null && posterSrc.length > 0;
  const [activeLayerReady, setActiveLayerReady] = useState(() => !hasPoster);
  const [posterDismissed, setPosterDismissed] = useState(false);

  const handlePosterFadeEnd = useCallback<TransitionEventHandler<HTMLImageElement>>(
    event => {
      if (event.propertyName !== 'opacity') return;
      if (!activeLayerReady) return;
      setPosterDismissed(true);
    },
    [activeLayerReady]
  );

  useEffect(() => {
    if (!hasPoster || posterDismissed || !activeLayerReady) return;
    const fallbackMs =
      GALLERY_GRID_VIDEO_POSTER_REVEAL_MS + GALLERY_GRID_VIDEO_POSTER_REVEAL_END_SLACK_MS;
    const id = window.setTimeout(() => {
      setPosterDismissed(true);
    }, fallbackMs);
    return () => window.clearTimeout(id);
  }, [hasPoster, posterDismissed, activeLayerReady]);

  return (
    <div className="relative min-h-0 h-full w-full">
      <div className="relative z-10 min-h-0 h-full w-full">
        <GalleryGridVideoLoopCrossfade
          key={gridSrc}
          gridSrc={gridSrc}
          inView={inView}
          isPageVisible={isPageVisible}
          onActiveLayerReady={hasPoster ? () => setActiveLayerReady(true) : undefined}
          videoObjectClassName={videoObjectClassName}
        />
      </div>
      {hasPoster && !posterDismissed ? (
        <img
          src={posterSrc}
          alt=""
          onTransitionEnd={handlePosterFadeEnd}
          className={`pointer-events-none absolute inset-0 z-20 min-h-0 h-full w-full object-cover${videoObjectClassName ? ` ${videoObjectClassName}` : ''} transition-opacity duration-gallery-grid-video-poster-reveal ease-standard motion-reduce:transition-none ${
            activeLayerReady ? 'opacity-0' : 'opacity-100'
          }`}
          loading="lazy"
          decoding="async"
        />
      ) : null}
    </div>
  );
};

/**
 * Видео в сетке: до появления во viewport — постер; после — `<video>` с `preload="none"`.
 * При `prefers-reduced-motion` — статичный постер (`<img>`), без загрузки webm; иначе loop через crossfade двух экземпляров одного клипа.
 */
const coverMediaClass = (videoObjectClassName?: string) =>
  `min-h-0 h-full w-full object-cover pointer-events-none${videoObjectClassName ? ` ${videoObjectClassName}` : ''}`;

const GalleryGridVideo = ({
  gridSrc,
  posterSrc,
  className,
  videoObjectClassName,
  prefersReducedMotion,
}: GalleryGridVideoProps) => {
  const [inView, setInView] = useState(
    () => typeof IntersectionObserver === 'undefined'
  );
  const [shouldRenderMotionVideo, setShouldRenderMotionVideo] = useState(
    () => typeof IntersectionObserver === 'undefined'
  );
  const isPageVisible = useDocumentVisibility();
  const containerRef = useRef<HTMLDivElement>(null);
  const unmountMotionVideoTimerRef = useRef<number | null>(null);
  const hasPoster = posterSrc != null && posterSrc.length > 0;
  /** Пул слотов `useActiveMediaSlot` (см. `GALLERY_GRID_VIDEO_MAX_CONCURRENT_SLOTS`) ограничивает число одновременных `<video>`. */
  const shouldRequestMotionVideoSlot =
    shouldRenderMotionVideo && inView && isPageVisible && !prefersReducedMotion;
  const activeMediaSlotGranted = useActiveMediaSlot(shouldRequestMotionVideoSlot);
  const canPlayMotionVideo = shouldRenderMotionVideo && activeMediaSlotGranted;

  const clearUnmountMotionVideoTimer = useCallback(() => {
    if (unmountMotionVideoTimerRef.current == null) return;
    window.clearTimeout(unmountMotionVideoTimerRef.current);
    unmountMotionVideoTimerRef.current = null;
  }, []);

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
          setShouldRenderMotionVideo(true);
        }
      },
      { rootMargin: TOUR_GALLERY_TILE_IMAGE_ROOT_MARGIN, threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    if (inView) {
      clearUnmountMotionVideoTimer();
      return;
    }
    clearUnmountMotionVideoTimer();
    unmountMotionVideoTimerRef.current = window.setTimeout(() => {
      setShouldRenderMotionVideo(false);
      unmountMotionVideoTimerRef.current = null;
    }, GALLERY_GRID_VIDEO_UNMOUNT_GRACE_MS);
    return clearUnmountMotionVideoTimer;
  }, [prefersReducedMotion, inView, clearUnmountMotionVideoTimer]);

  useEffect(() => clearUnmountMotionVideoTimer, [clearUnmountMotionVideoTimer]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-card border-0 bg-transparent ${className}`}
      aria-hidden
    >
      {prefersReducedMotion ? (
        hasPoster ? (
          <img
            src={posterSrc}
            alt=""
            className={coverMediaClass(videoObjectClassName)}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="h-full min-h-gallery-grid-video w-full bg-surface-light" />
        )
      ) : canPlayMotionVideo ? (
        <GalleryGridVideoMotionBranch
          key={`${gridSrc}\0${posterSrc ?? ''}`}
          gridSrc={gridSrc}
          posterSrc={posterSrc}
          inView={inView}
          isPageVisible={isPageVisible}
          videoObjectClassName={videoObjectClassName}
        />
      ) : hasPoster ? (
        <img
          src={posterSrc}
          alt=""
          className={coverMediaClass(videoObjectClassName)}
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
