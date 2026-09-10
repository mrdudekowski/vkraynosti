import { useMemo, useState, type ReactNode } from 'react';
import { MobileNavMenuContext } from './mobileNavMenuContextDefinition';

export function MobileNavMenuProvider({ children }: { children: ReactNode }) {
  const [isBurgerMenuActive, setBurgerMenuActive] = useState(false);

  const value = useMemo(
    () => ({
      isBurgerMenuActive,
      setBurgerMenuActive,
    }),
    [isBurgerMenuActive]
  );

  return (
    <MobileNavMenuContext.Provider value={value}>{children}</MobileNavMenuContext.Provider>
  );
}
