import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Season } from '../types';
import { getCurrentSeason } from '../utils/getCurrentSeason';

interface SeasonContextValue {
  activeSeason: Season;
  setActiveSeason: (season: Season) => void;
}

const SeasonContext = createContext<SeasonContextValue | null>(null);

export const SeasonProvider = ({ children }: { children: ReactNode }) => {
  const [activeSeason, setActiveSeason] = useState<Season>(getCurrentSeason());

  return (
    <SeasonContext.Provider value={{ activeSeason, setActiveSeason }}>
      {children}
    </SeasonContext.Provider>
  );
};

export const useSeason = (): SeasonContextValue => {
  const ctx = useContext(SeasonContext);
  if (!ctx) {
    throw new Error('useSeason must be used within SeasonProvider');
  }
  return ctx;
};

