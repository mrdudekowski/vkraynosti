import { useContext } from 'react';
import {
  HomeNavbarChromeContext,
  type HomeNavbarChromeContextValue,
} from './homeNavbarChromeReactContext';

export function useHomeNavbarChrome(): HomeNavbarChromeContextValue {
  const ctx = useContext(HomeNavbarChromeContext);
  if (ctx == null) {
    throw new Error('useHomeNavbarChrome must be used within HomeNavbarChromeProvider');
  }
  return ctx;
}
