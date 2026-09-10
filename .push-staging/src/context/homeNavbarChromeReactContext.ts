import { createContext } from 'react';
import type { HomeNavbarChromeSnap } from '../constants/homeNavbarChrome';

export interface HomeNavbarChromeContextValue {
  snap: HomeNavbarChromeSnap;
  publishHomeNavbarChrome: (next: HomeNavbarChromeSnap) => void;
  resetHomeNavbarChrome: () => void;
}

export const HomeNavbarChromeContext = createContext<HomeNavbarChromeContextValue | null>(null);
