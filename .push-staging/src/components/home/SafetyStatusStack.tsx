import { useEffect, useRef, useState } from 'react';
import { UI } from '../../constants/ui';
import { SAFETY_STATUS_STACK_CLASS } from '../../constants/safetyStatusLayout';
import { getSafetyStatusStackMaxHeightClass } from '../../constants/safetyStatusStackHeight';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { useSafetyStackExpandLenisSync } from '../../hooks/useSafetyStackExpandLenisSync';
import { useSafetyStatusStack } from '../../hooks/useSafetyStatusStack';
import { useSeason } from '../../context/useSeason';
import { prefetchSafetyStatusIcons } from '../../utils/fetchSafetyStatusIconSvg';
import SafetyStatusPlaque from './SafetyStatusPlaque';

const STATUS_LINES = UI.sections.safetyStatusLines;

const SafetyStatusStack = () => {
  const { activeSeason } = useSeason();
  const prefersReducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(true);

  useEffect(() => {
    prefetchSafetyStatusIcons();
  }, []);

  useEffect(() => {
    const element = containerRef.current;
    if (element == null || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry?.isIntersecting ?? false);
      },
      { threshold: 0.2 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const animationEnabled = !prefersReducedMotion;
  const { visibleCount, enteringFadePhase, activeCheckboxPhase } = useSafetyStatusStack({
    lineCount: STATUS_LINES.length,
    enabled: animationEnabled,
    paused: !isInView,
  });

  const activeIndex = Math.max(0, visibleCount - 1);
  const { onStackMaxHeightTransitionEnd } = useSafetyStackExpandLenisSync({
    visibleCount,
    prefersReducedMotion,
  });

  return (
    <div
      ref={containerRef}
      className={[
        SAFETY_STATUS_STACK_CLASS,
        getSafetyStatusStackMaxHeightClass(visibleCount),
      ].join(' ')}
      onTransitionEnd={onStackMaxHeightTransitionEnd}
      aria-live="polite"
      aria-atomic={false}
    >
      {STATUS_LINES.slice(0, visibleCount).map((line, index) => (
        <SafetyStatusPlaque
          key={`${line}-${index}`}
          index={index}
          text={line}
          season={activeSeason}
          isActive={index === activeIndex}
          checkboxPhase={activeCheckboxPhase}
          enteringFadePhase={enteringFadePhase}
        />
      ))}
    </div>
  );
};

export default SafetyStatusStack;
