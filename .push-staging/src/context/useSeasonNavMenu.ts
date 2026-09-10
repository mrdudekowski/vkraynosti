import { useContext } from 'react';
import { SeasonNavMenuContext, type SeasonNavMenuContextValue } from './seasonNavMenuContextDefinition';

export function useSeasonNavMenu(): SeasonNavMenuContextValue {
  const ctx = useContext(SeasonNavMenuContext);
  if (!ctx) {
    throw new Error('useSeasonNavMenu must be used within SeasonNavMenuProvider');
  }
  return ctx;
}
