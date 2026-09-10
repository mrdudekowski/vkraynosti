import { useEffect, useRef, type RefObject } from 'react'
import {
  HOME_HERO_CAROUSEL_SWIPE_AXIS_RATIO,
  HOME_HERO_CAROUSEL_SWIPE_THRESHOLD_PX,
} from '../constants/homeHeroCarouselSwipe'

export interface UseHeroCarouselSwipeOptions {
  /** Только активный слайд и только когда не `prefers-reduced-motion`. */
  enabled: boolean
  /** Свайп влево (finger dx &lt; 0) — следующий слайд. */
  onSwipeNext: () => void
  /** Свайп вправо — предыдущий слайд. */
  onSwipePrev: () => void
}

/**
 * Обработка горизонтального свайпа на touch-устройствах без `preventDefault` на `touchmove`,
 * чтобы не конфликтовать со скроллом страницы (в т.ч. Lenis): решение только по `touchend`.
 */
export function useHeroCarouselSwipe(
  targetRef: RefObject<HTMLElement | null>,
  {
    enabled,
    onSwipeNext,
    onSwipePrev,
  }: UseHeroCarouselSwipeOptions
): void {
  const startRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const el = targetRef.current
    if (el == null || !enabled) return

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        startRef.current = null
        return
      }
      const t = e.touches[0]
      startRef.current = { x: t.clientX, y: t.clientY }
    }

    const onTouchEnd = (e: TouchEvent) => {
      const start = startRef.current
      startRef.current = null
      if (start == null || e.changedTouches.length !== 1) return

      const t = e.changedTouches[0]
      const dx = t.clientX - start.x
      const dy = t.clientY - start.y
      const ax = Math.abs(dx)
      const ay = Math.abs(dy)

      if (
        ax < HOME_HERO_CAROUSEL_SWIPE_THRESHOLD_PX ||
        ax < ay * HOME_HERO_CAROUSEL_SWIPE_AXIS_RATIO
      ) {
        return
      }

      if (dx < 0) {
        onSwipeNext()
      } else {
        onSwipePrev()
      }
      e.preventDefault()
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchend', onTouchEnd, { passive: false })

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [enabled, onSwipeNext, onSwipePrev, targetRef])
}
