import { BREAKPOINT_MD_PX } from '../constants/smoothScroll';
import { useMatchMinWidth } from './useMatchMinWidth';

/**
 * Планшет и десктоп (Tailwind `md`, ≥768px): полноэкранные ворота и потолок у hero.
 * Ниже `md` — мобильный поток без gate-stage и без виртуального потолка Lenis.
 */
export function useHomeGateDesktopLayout(): boolean {
  return useMatchMinWidth(BREAKPOINT_MD_PX);
}
