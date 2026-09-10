import { useEffect, useState } from 'react';

/**
 * До первого измерения — соотношение из `aspect-home-season-banner-inner` (10 / 3.25).
 */
const DEFAULT_HEIGHT_OVER_WIDTH = 3.25 / 10;

/**
 * Высота/ширина контейнера `[data-hsb-clip-root]` для расчёта clip-path (угол ребра — в `homeSeasonBannerDiagonalGrid.ts`).
 */
export function useHomeSeasonBannerDiagonalAspect(clipRootEl: HTMLElement | null): number {
  const [heightOverWidth, setHeightOverWidth] = useState(DEFAULT_HEIGHT_OVER_WIDTH);

  useEffect(() => {
    if (!clipRootEl) return;

    const update = () => {
      const w = clipRootEl.clientWidth;
      const h = clipRootEl.clientHeight;
      if (w > 0 && h > 0) {
        setHeightOverWidth(h / w);
      }
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(clipRootEl);
    return () => ro.disconnect();
  }, [clipRootEl]);

  return heightOverWidth;
}
