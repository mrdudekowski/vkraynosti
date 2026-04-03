import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type TransitionEvent,
} from "react";

/**
 * Плавная смена подписи «Что включено»: fade out → смена строки → fade in.
 * При `prefers-reduced-motion` — мгновенная подстановка без анимации.
 */
export function useTourIncludedDescriptionFade(
  targetText: string | null,
  prefersReducedMotion: boolean
) {
  const [displayText, setDisplayText] = useState<string | null>(targetText);
  const [isVisible, setIsVisible] = useState(() => targetText !== null);
  const targetRef = useRef(targetText);
  targetRef.current = targetText;

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayText(targetText);
      setIsVisible(targetText !== null);
      return;
    }
    if (targetText === displayText) return;

    if (displayText === null && targetText !== null) {
      setDisplayText(targetText);
      setIsVisible(false);
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setDisplayText(targetRef.current);
          setIsVisible(true);
        });
      });
      return () => cancelAnimationFrame(id);
    }

    setIsVisible(false);
  }, [targetText, displayText, prefersReducedMotion]);

  const handleTransitionEnd = useCallback(
    (event: TransitionEvent<HTMLParagraphElement>) => {
      if (prefersReducedMotion) return;
      if (event.propertyName !== "opacity") return;
      if (isVisible) return;

      const next = targetRef.current;
      setDisplayText(next);
      if (next !== null) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setIsVisible(true));
        });
      }
    },
    [prefersReducedMotion, isVisible]
  );

  return {
    displayText,
    isVisible,
    handleTransitionEnd,
  };
}
