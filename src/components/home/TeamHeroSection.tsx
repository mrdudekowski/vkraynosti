import { forwardRef } from 'react';
import { TEAM } from '../../data/teamData';
import { HOME_SECTION_TEAM } from '../../constants/routes';
import { TEAM_SECTION_DIVIDER_CLASS } from '../../constants/seasonTheme';
import { UI } from '../../constants/ui';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { useSeason } from '../../context/useSeason';
import RevealBox from '../shared/RevealBox';
import BrandWordmark from '../shared/BrandWordmark';
import TeamMemberHeroSlide from './TeamMemberHeroSlide';

const TEAM_MEMBER_LAYOUT_VARIANTS = ['photo-start', 'photo-end'] as const;

/** Порядок на странице: Элина → Ярослав (массив `TEAM` в data — канон id/контента). */
const TEAM_SECTION_DISPLAY_ORDER = [TEAM[1], TEAM[0]] as const;

const TeamHeroSection = forwardRef<HTMLElement>(function TeamHeroSection(_, ref) {
  const { activeSeason } = useSeason();
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <section
      ref={ref}
      id={HOME_SECTION_TEAM}
      aria-labelledby="team-heading"
      className="pt-home-section-top pb-section-y text-text-inverse"
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

        <div className="relative overflow-visible flex flex-col max-sm:gap-team-hero-members-stack-mobile sm:gap-team-hero-members lg:gap-team-hero-members-lg">
          {TEAM_SECTION_DISPLAY_ORDER.map((member, index) => (
            <TeamMemberHeroSlide
              key={member.id}
              member={member}
              layoutVariant={TEAM_MEMBER_LAYOUT_VARIANTS[index] ?? 'photo-start'}
              prefersReducedMotion={prefersReducedMotion}
              articleClassName={
                index === 0 ? 'sm:pb-team-hero-first-member-bottom-sm' : undefined
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
});

export default TeamHeroSection;
