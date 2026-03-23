import { useMemo, useState, type ReactNode } from 'react';
import { SeasonNavMenuContext } from './seasonNavMenuContextDefinition';

export function SeasonNavMenuProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const value = useMemo(
    () => ({
      open,
      setOpen,
      toggle: () => setOpen(o => !o),
    }),
    [open],
  );

  return <SeasonNavMenuContext.Provider value={value}>{children}</SeasonNavMenuContext.Provider>;
}
