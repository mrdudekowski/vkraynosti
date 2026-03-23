import { useContext } from 'react';
import { SeasonContext, type SeasonContextValue } from './season-context-definition';

export const useSeason = (): SeasonContextValue => {
  const ctx = useContext(SeasonContext);
  if (!ctx) {
    throw new Error('useSeason must be used within SeasonProvider');
  }
  return ctx;
};
