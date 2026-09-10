import { createContext } from 'react';

export type SeasonNavMenuContextValue = {
  open: boolean;
  setOpen: (value: boolean) => void;
  toggle: () => void;
};

export const SeasonNavMenuContext = createContext<SeasonNavMenuContextValue | null>(null);
