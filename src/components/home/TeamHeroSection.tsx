import { forwardRef, useRef, type KeyboardEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons/faChevronLeft';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight';
import { TEAM } from '../../data/teamData';
import { HOME_SECTION_TEAM } from '../../constants/routes';
import { TEAM_SECTION_DIVIDER_CLASS } from '../../constants/seasonTheme';
import {
  TEAM_HERO_PAGINATION_ACTIVE_DOT_CLASS,
  TEAM_HERO_PAGINATION_INACTIVE_DOT_HOVER_CLASS,
} from '../../constants/teamHero';
import { getTeamSectionHeading, UI } from '../../constants/ui';
import { BREAKPOINT_LG_PX } from '../../constants/reveal';
import { useCarousel } from '../../hooks/useCarousel';
import { useHeroCarouselSwipe } from '../../hooks/useHeroCarouselSwipe';
import { useMatchMinWidth } from '../../hooks/useMatchMinWidth';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { useSeason } from '../../context/useSeason';
import RevealBox from '../shared/RevealBox';
import BrandWordmark from '../shared/BrandWordmark';
import TeamMemberHeroSlide from './TeamMemberHeroSlide';

const TeamHeroSection = forwardRef<HTMLElement>(function TeamHeroSection(_, ref) {
  const { activeSeason } = useSeason();
  const { current, next, prev, goTo } = useCarousel({ total: TEAM.length });
  const showDesktopArrows = useMatchMinWidth(BREAKPOINT_LG_PX);
  const prefersReducedMotion = usePrefersReducedMotion();
  const slideSwipeRef = useRef<HTMLDivElement>(null);

  const member = TEAM[current];

  useHeroCarouselSwipe(slideSwipeRef, {
    enabled: !prefersReducedMotion,
    onSwipeNext: next,
    onSwipePrev: prev,
  });

  const handleCarouselKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      prev();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      next();
    }
  };

  return (
    <section ref={ref} id={HOME_SECTION_TEAM} className="pt-home-section-top pb-section-y text-text-inverse">
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
          <h2 className="section-title">
            {UI.sections.teamHeadingPrefix}
            <BrandWordmark season={activeSeason} size="inherit" />
          </h2>
          <div className="mt-3">
            <p className="text-text-inverse/75">{UI.sections.teamSub}</p>
          </div>
        </RevealBox>

        <div
          className="relative"
          role="region"
          aria-roledescription="carousel"
          aria-label={getTeamSectionHeading()}
        >
          <div className="outline-none" tabIndex={0} onKeyDown={handleCarouselKeyDown}>
            <TeamMemberHeroSlide
              ref={slideSwipeRef}
              key={member.id}
              member={member}
              prefersReducedMotion={prefersReducedMotion}
            />
          </div>

          {showDesktopArrows ? (
            <>
              <button
                type="button"
                onClick={prev}
                className="absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white transition-all duration-hover hover:bg-black/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                aria-label={UI.team.carouselPrevious}
              >
                <FontAwesomeIcon icon={faChevronLeft} aria-hidden />
              </button>
              <button
                type="button"
                onClick={next}
                className="absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white transition-all duration-hover hover:bg-black/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                aria-label={UI.team.carouselNext}
              >
                <FontAwesomeIcon icon={faChevronRight} aria-hidden />
              </button>
            </>
          ) : null}

          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2">
              {TEAM.map((teamMember, idx) => (
                <button
                  key={teamMember.id}
                  type="button"
                  onClick={() => goTo(idx)}
                  className={`h-2.5 w-2.5 rounded-full transition-all duration-hover ${
                    idx === current
                      ? `${TEAM_HERO_PAGINATION_ACTIVE_DOT_CLASS[activeSeason]} scale-125`
                      : `bg-white/50 ${TEAM_HERO_PAGINATION_INACTIVE_DOT_HOVER_CLASS[activeSeason]}`
                  }`}
                  aria-label={UI.team.carouselPaginationGoToSlide.replace(
                    '{n}',
                    String(idx + 1)
                  )}
                  aria-current={idx === current ? 'true' : undefined}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default TeamHeroSection;
