import { useEffect, useRef, useState } from 'react';
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
  const [slotSrcs, setSlotSrcs] = useState<[string, string]>([src, src]);
  const [activeSlot, setActiveSlot] = useState<0 | 1>(0);
  const [pendingSlot, setPendingSlot] = useState<0 | 1 | null>(null);
  const slotZeroRef = useRef<HTMLVideoElement | null>(null);
  const slotOneRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (prefersReducedMotion) return;
    if (pendingSlot != null) return;
    if (slotSrcs[activeSlot] === src) return;

    const nextSlot: 0 | 1 = activeSlot === 0 ? 1 : 0;
    if (prefersReducedMotion) return;

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
    const videos = [slotZeroRef.current, slotOneRef.current].filter(
      (video): video is HTMLVideoElement => video != null
    );
    if (videos.length === 0) return;
    if (!isPageVisible) {
      videos.forEach(video => video.pause());
      return;
    }
    videos.forEach(video => {
      void video.play().catch(() => {});
    });
  }, [isPageVisible, slotSrcs]);

  if (prefersReducedMotion) {
    return (
      <div className="relative h-full w-full">
        <video
          key={src}
          className={className}
          poster={poster}
          autoPlay
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
    <div className="relative h-full w-full">
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
          autoPlay
          muted
          playsInline
          preload="metadata"
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
          autoPlay
          muted
          playsInline
          preload="metadata"
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
