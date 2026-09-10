import { useContext } from 'react';
import {
  MobileNavMenuContext,
  type MobileNavMenuContextValue,
} from './mobileNavMenuContextDefinition';

export function useMobileNavMenu(): MobileNavMenuContextValue {
  const ctx = useContext(MobileNavMenuContext);
  if (ctx == null) {
    throw new Error('useMobileNavMenu must be used within MobileNavMenuProvider');
  }
  return ctx;
}
