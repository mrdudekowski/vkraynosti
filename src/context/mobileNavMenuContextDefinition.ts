import { createContext } from 'react';

/** Burger drawer mounted or open — скрыть `HomeHeroContactRail` под navbar. */
export type MobileNavMenuContextValue = {
  isBurgerMenuActive: boolean;
  setBurgerMenuActive: (active: boolean) => void;
};

export const MobileNavMenuContext = createContext<MobileNavMenuContextValue | null>(
  null
);
