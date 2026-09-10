import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CROSSFADE_VIDEO_INTERSECTION_ROOT_MARGIN } from '../../constants/crossfadeVideoIntersection';
import { useDocumentVisibility } from '../../hooks/useDocumentVisibility';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface CrossfadeVideoProps {
  src: string;
  poster: string;
  className?: string;
}

const CrossfadeVideo = ({ src, poster, className }: CrossfadeVideoProps) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isPageVisible = useDocumentVisibility();
  const [inView, setInView] = useState(
    () => typeof IntersectionObserver === 'undefined'
  );
  const [slotSrcs, setSlotSrcs] = useState<[string, string]>([src, src]);
  const [activeSlot, setActiveSlot] = useState<0 | 1>(0);
  const [pendingSlot, setPendingSlot] = useState<0 | 1 | null>(null);
  const slotZeroRef = useRef<HTMLVideoElement | null>(null);
  const slotOneRef = useRef<HTMLVideoElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const reducedMotionVideoRef = useRef<HTMLVideoElement | null>(null);

  useLayoutEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      queueMicrotask(() => {
        setInView(true);
      });
      return;
    }
    const el = viewportRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      entries => {
        setInView(entries[0]?.isIntersecting === true);
      },
      { root: null, rootMargin: CROSSFADE_VIDEO_INTERSECTION_ROOT_MARGIN, threshold: 0.01 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    if (pendingSlot != null) return;
    if (slotSrcs[activeSlot] === src) return;

    const nextSlot: 0 | 1 = activeSlot === 0 ? 1 : 0;

    const setupFrameId = window.requestAnimationFrame(() => {
      setSlotSrcs(currentSlotSrcs =>
        nextSlot === 0 ? [src, currentSlotSrcs[1]] : [currentSlotSrcs[0], src]
      );
      setPendingSlot(nextSlot);
    });

    return () => {
      window.cancelAnimationFrame(setupFrameId);
    };
  }, [activeSlot, pendingSlot, prefersReducedMotion, slotSrcs, src]);

  const handleCanPlay = (slotIndex: 0 | 1) => {
    if (pendingSlot !== slotIndex) return;
    setActiveSlot(slotIndex);
    setPendingSlot(null);
  };

  useEffect(() => {
    const v0 = slotZeroRef.current;
    const v1 = slotOneRef.current;
    if (!v0 && !v1) return;
    const pauseSlot = (idx: 0 | 1) => {
      (idx === 0 ? v0 : v1)?.pause();
    };
    const playSlot = (idx: 0 | 1) => {
      const v = idx === 0 ? v0 : v1;
      if (v) void v.play().catch(() => {});
    };
    if (!isPageVisible || !inView) {
      pauseSlot(0);
      pauseSlot(1);
      return;
    }
    const shouldPlay0 = activeSlot === 0 || pendingSlot === 0;
    const shouldPlay1 = activeSlot === 1 || pendingSlot === 1;
    if (shouldPlay0) playSlot(0);
    else pauseSlot(0);
    if (shouldPlay1) playSlot(1);
    else pauseSlot(1);
  }, [isPageVisible, inView, activeSlot, pendingSlot, slotSrcs]);

  useEffect(() => {
    if (!prefersReducedMotion) return;
    const v = reducedMotionVideoRef.current;
    if (!v) return;
    if (!isPageVisible || !inView) {
      v.pause();
      return;
    }
    void v.play().catch(() => {});
  }, [prefersReducedMotion, isPageVisible, inView, src]);

  if (prefersReducedMotion) {
    return (
      <div ref={viewportRef} className="relative h-full w-full">
        <video
          ref={reducedMotionVideoRef}
          key={src}
          className={className}
          poster={poster}
          autoPlay={false}
          muted
          playsInline
          preload="metadata"
          loop
        >
          <source src={src} />
        </video>
      </div>
    );
  }

  return (
    <div ref={viewportRef} className="relative h-full w-full">
      <div
        className={`absolute inset-0 transition-opacity duration-carousel ease-standard motion-reduce:transition-none ${
          activeSlot === 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <video
          ref={slotZeroRef}
          key={`slot-0-${slotSrcs[0]}`}
          className={className}
          poster={poster}
          autoPlay={activeSlot === 0 || pendingSlot === 0}
          muted
          playsInline
          preload={activeSlot === 0 || pendingSlot === 0 ? 'metadata' : 'none'}
          loop
          onCanPlay={() => handleCanPlay(0)}
        >
          <source src={slotSrcs[0]} />
        </video>
      </div>

      <div
        className={`absolute inset-0 transition-opacity duration-carousel ease-standard motion-reduce:transition-none ${
          activeSlot === 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <video
          ref={slotOneRef}
          key={`slot-1-${slotSrcs[1]}`}
          className={className}
          poster={poster}
          autoPlay={activeSlot === 1 || pendingSlot === 1}
          muted
          playsInline
          preload={activeSlot === 1 || pendingSlot === 1 ? 'metadata' : 'none'}
          loop
          onCanPlay={() => handleCanPlay(1)}
        >
          <source src={slotSrcs[1]} />
        </video>
      </div>
    </div>
  );
};

export default CrossfadeVideo;
