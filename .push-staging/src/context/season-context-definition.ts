import { createContext } from 'react';
import type { Season } from '../types';

export interface SeasonContextValue {
  activeSeason: Season;
  setActiveSeason: (season: Season) => void;
}

export const SeasonContext = createContext<SeasonContextValue | null>(null);
