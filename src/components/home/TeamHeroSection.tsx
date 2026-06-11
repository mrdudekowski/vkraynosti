import { forwardRef, useLayoutEffect, useRef } from 'react';
import { useLenis } from 'lenis/react';
import { HOME_SECTION_TEAM } from '../../constants/routes';
import { TEAM_SECTION_DIVIDER_CLASS } from '../../constants/seasonTheme';
import { scrollHomeTeamTopImmediate } from '../../constants/smoothScroll';
import { UI } from '../../constants/ui';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { useTeamHeroPage } from '../../hooks/useTeamHeroPage';
import { useSeason } from '../../context/useSeason';
import { isTeamSectionDebugOpaqueBg } from '../../utils/teamBackdropDebug';
import RevealBox from '../shared/RevealBox';
import BrandWordmark from '../shared/BrandWordmark';
import TeamMemberHeroSlide from './TeamMemberHeroSlide';
import TeamHeroPageNextButton from './TeamHeroPageNextButton';

const TEAM_MEMBER_LAYOUT_VARIANTS = ['photo-start', 'photo-end'] as const;

const TeamHeroSection = forwardRef<HTMLElement>(function TeamHeroSection(_, ref) {
  const lenis = useLenis();
  const { activeSeason } = useSeason();
  const prefersReducedMotion = usePrefersReducedMotion();
  const { pageIndex, goToNextPage, currentPair } = useTeamHeroPage();
  const isInitialMountRef = useRef(true);

  useLayoutEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }
    scrollHomeTeamTopImmediate(lenis);
  }, [pageIndex, lenis]);

  return (
    <section
      ref={ref}
      id={HOME_SECTION_TEAM}
      aria-labelledby="team-heading"
      className={[
        'pt-home-section-top pb-section-y text-text-inverse',
        isTeamSectionDebugOpaqueBg() ? 'bg-home-gate-start-screen' : '',
      ].join(' ')}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex w-full justify-center">
          <div
            className={[
              'h-px w-full max-w-team-section-divider shrink-0 rounded-full',
              TEAM_SECTION_DIVIDER_CLASS[activeSeason],
              'mb-team-section-divider-to-heading',
            ].join(' ')}
            aria-hidden
          />
        </div>
        <RevealBox as="div" className="mb-10 text-center lg:mb-12">
          <h2 id="team-heading" className="section-title">
            {UI.sections.teamHeadingPrefix}
            <BrandWordmark season={activeSeason} size="inherit" />
          </h2>
          <div className="mt-3">
            <p className="text-text-inverse/75">{UI.sections.teamSub}</p>
          </div>
        </RevealBox>

        <div
          id={UI.team.membersContainerId}
          key={pageIndex}
          className="relative overflow-visible flex flex-col gap-team-hero-members-stack-mobile team-hero-desktop:gap-team-hero-members lg:gap-team-hero-members-lg"
        >
          {currentPair.map((member, index) => {
            const layoutVariant = TEAM_MEMBER_LAYOUT_VARIANTS[index] ?? 'photo-start';

            return (
              <TeamMemberHeroSlide
                key={member.id}
                member={member}
                layoutVariant={layoutVariant}
                prefersReducedMotion={prefersReducedMotion}
                articleClassName={
                  index === 0
                    ? 'md:pb-team-hero-first-member-bottom-md lg:pb-team-hero-first-member-bottom-lg'
                    : undefined
                }
                desktopTextAlign={layoutVariant === 'photo-end' ? 'end' : undefined}
              />
            );
          })}
          <TeamHeroPageNextButton onNext={goToNextPage} />
        </div>
      </div>
    </section>
  );
});

export default TeamHeroSection;
