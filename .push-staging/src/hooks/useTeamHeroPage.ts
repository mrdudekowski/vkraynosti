import { useCallback, useState } from 'react';
import { TEAM_HERO_PAGES } from '../data/teamData';

export function useTeamHeroPage() {
  const [pageIndex, setPageIndex] = useState(0);
  const currentPair = TEAM_HERO_PAGES[pageIndex] ?? TEAM_HERO_PAGES[0];

  const goToNextPage = useCallback(() => {
    if (TEAM_HERO_PAGES.length <= 1) return;
    setPageIndex((previousPageIndex) => (previousPageIndex + 1) % TEAM_HERO_PAGES.length);
  }, []);

  return {
    pageIndex,
    setPageIndex,
    goToNextPage,
    currentPair,
  };
}
