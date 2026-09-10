import { useEffect, useState } from 'react';
import { ADMIN_BREAKPOINT_DESKTOP_PX } from '../../constants/adminUiTokens';
import { BREAKPOINT_MD_PX } from '../../constants/breakpoints';

export type AdminViewport = 'mobile' | 'tablet' | 'desktop';

export function readAdminViewport(): AdminViewport {
  if (typeof window.matchMedia !== 'function') {
    return 'desktop';
  }
  if (window.matchMedia(`(min-width: ${ADMIN_BREAKPOINT_DESKTOP_PX}px)`).matches) {
    return 'desktop';
  }
  if (window.matchMedia(`(min-width: ${BREAKPOINT_MD_PX}px)`).matches) {
    return 'tablet';
  }
  return 'mobile';
}

export function useAdminViewport(): AdminViewport {
  const [viewport, setViewport] = useState<AdminViewport>(readAdminViewport);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      return;
    }
    const desktop = window.matchMedia(`(min-width: ${ADMIN_BREAKPOINT_DESKTOP_PX}px)`);
    const tablet = window.matchMedia(`(min-width: ${BREAKPOINT_MD_PX}px)`);
    const sync = () => {
      setViewport(readAdminViewport());
    };
    sync();
    desktop.addEventListener('change', sync);
    tablet.addEventListener('change', sync);
    return () => {
      desktop.removeEventListener('change', sync);
      tablet.removeEventListener('change', sync);
    };
  }, []);

  return viewport;
}
