import { useCallback, useMemo, useState, type ReactNode } from 'react';
import {
  HOME_NAVBAR_CHROME_LAYOUT_DEFAULT,
  readInitialHomeNavbarChromeSnap,
  type HomeNavbarChromeSnap,
} from '../constants/homeNavbarChrome';
import { HomeNavbarChromeContext } from './homeNavbarChromeReactContext';

export type { HomeNavbarChromeSnap };

export function HomeNavbarChromeProvider({ children }: { children: ReactNode }) {
  const [snap, setSnap] = useState<HomeNavbarChromeSnap>(() => readInitialHomeNavbarChromeSnap());

  const publishHomeNavbarChrome = useCallback((next: HomeNavbarChromeSnap) => {
    setSnap((prev) => {
      if (
        prev.topChromeOpacity === next.topChromeOpacity &&
        prev.topChromeSurfaceOpacity === next.topChromeSurfaceOpacity &&
        prev.mainUsesNavbarTopPadding === next.mainUsesNavbarTopPadding &&
        prev.gateStageFullBleedMinHeight === next.gateStageFullBleedMinHeight &&
        prev.disableTopChromeTransition === next.disableTopChromeTransition
      ) {
        return prev;
      }
      return next;
    });
  }, []);

  const resetHomeNavbarChrome = useCallback(() => {
    setSnap(HOME_NAVBAR_CHROME_LAYOUT_DEFAULT);
  }, []);

  const value = useMemo(
    () => ({ snap, publishHomeNavbarChrome, resetHomeNavbarChrome }),
    [snap, publishHomeNavbarChrome, resetHomeNavbarChrome]
  );

  return (
    <HomeNavbarChromeContext.Provider value={value}>{children}</HomeNavbarChromeContext.Provider>
  );
}
