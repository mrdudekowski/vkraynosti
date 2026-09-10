import { useCallback, useState } from 'react';
import { TEAM_HERO_PAGES } from '../data/teamData';
import { useSiteContent } from '../context/SiteContentContext';
import type { TeamMember } from '../types';

export function useTeamHeroPage() {
  const site = useSiteContent();
  const members: TeamMember[] = site.team.members.filter((member) => member.visible).sort((a, b) => a.order - b.order).map((member) => ({ id: member.id, name: member.name, role: member.roleVisible ? member.role : '', experience: member.experienceVisible ? member.experience : '', bio: member.bioVisible ? member.bio : '', imageUrl: member.photo.url, showExperienceLine: member.experienceVisible }));
  const pages = members.length > 0 ? Array.from({ length: Math.ceil(members.length / 2) }, (_, index) => [members[index * 2], members[index * 2 + 1]].filter(Boolean) as [TeamMember, TeamMember?]) : TEAM_HERO_PAGES;
  const [pageIndex, setPageIndex] = useState(0);
  const currentPair = pages[pageIndex] ?? pages[0];

  const goToNextPage = useCallback(() => {
    if (pages.length <= 1) return;
    setPageIndex((previousPageIndex) => (previousPageIndex + 1) % pages.length);
  }, [pages.length]);

  return {
    pageIndex,
    setPageIndex,
    goToNextPage,
    currentPair,
  };
}
