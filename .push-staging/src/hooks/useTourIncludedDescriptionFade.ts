import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type TransitionEvent,
} from "react";
import { TOUR_INCLUDED_DESCRIPTION_FADE_MS } from "../constants/tourIncludedHover";

/**
 * Запас после полного цикла fade out + fade in, если `transitionend` не пришёл (отмена перехода при частом hover).
 * Синхронно с длительностью CSS `duration-tour-included-description-fade`.
 */
const FADE_RECOVERY_MS =
  TOUR_INCLUDED_DESCRIPTION_FADE_MS * 2 + 120;

/**
 * Плавная смена подписи «Что включено»: fade out → смена строки → fade in.
 * При `prefers-reduced-motion` — мгновенная подстановка без анимации.
 * Failsafe: таймер синхронизации с `targetText`, если событие перехода потеряно.
 */
export function useTourIncludedDescriptionFade(
  targetText: string | null,
  prefersReducedMotion: boolean
) {
  const [displayText, setDisplayText] = useState<string | null>(targetText);
  const [isVisible, setIsVisible] = useState(() => targetText !== null);
  const targetRef = useRef(targetText);
  const isVisibleRef = useRef(isVisible);

  useEffect(() => {
    targetRef.current = targetText;
  }, [targetText]);

  useEffect(() => {
    isVisibleRef.current = isVisible;
  }, [isVisible]);

  useEffect(() => {
    if (prefersReducedMotion) {
      queueMicrotask(() => {
        setDisplayText(targetText);
        setIsVisible(targetText !== null);
      });
      return;
    }
    if (targetText === displayText) return;

    if (displayText === null && targetText !== null) {
      queueMicrotask(() => {
        setDisplayText(targetText);
        setIsVisible(false);
      });
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setDisplayText(targetRef.current);
          setIsVisible(true);
        });
      });
      return () => cancelAnimationFrame(id);
    }

    queueMicrotask(() => {
      setIsVisible(false);
    });
  }, [targetText, displayText, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const id = window.setTimeout(() => {
      const t = targetRef.current;
      setDisplayText((d) => (d === t ? d : t));
      setIsVisible((prev) => {
        const want = t !== null;
        return prev === want ? prev : want;
      });
    }, FADE_RECOVERY_MS);
    return () => clearTimeout(id);
  }, [targetText, prefersReducedMotion]);

  const handleTransitionEnd = useCallback(
    (event: TransitionEvent<HTMLParagraphElement>) => {
      if (prefersReducedMotion) return;
      if (event.propertyName !== "opacity") return;
      if (isVisibleRef.current) return;

      const next = targetRef.current;
      setDisplayText(next);
      if (next !== null) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setIsVisible(true));
        });
      }
    },
    [prefersReducedMotion]
  );

  return {
    displayText,
    isVisible,
    handleTransitionEnd,
  };
}
