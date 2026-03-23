import { useState } from 'react';
import type { ReactNode } from 'react';
import type { Season } from '../types';
import { getCurrentSeason } from '../utils/getCurrentSeason';
import { SeasonContext } from './season-context-definition';

export const SeasonProvider = ({ children }: { children: ReactNode }) => {
  const [activeSeason, setActiveSeason] = useState<Season>(getCurrentSeason());

  return (
    <SeasonContext.Provider value={{ activeSeason, setActiveSeason }}>
      {children}
    </SeasonContext.Provider>
  );
};
