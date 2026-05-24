import { forwardRef } from 'react';
import type { TeamMember } from '../../types';
import { getTeamHeroTextStaggerPresentation } from '../../constants/teamHeroAnimation';
import { UI } from '../../constants/ui';
import PlaceholderImage from '../shared/PlaceholderImage';
import { splitTeamBioParagraphs } from '../../utils/team/splitTeamBioParagraphs';

interface TeamMemberHeroSlideProps {
  member: TeamMember;
  prefersReducedMotion: boolean;
}

const TeamMemberHeroSlide = forwardRef<HTMLDivElement, TeamMemberHeroSlideProps>(
  function TeamMemberHeroSlide({ member, prefersReducedMotion }, ref) {
    const bioParagraphs = splitTeamBioParagraphs(member.bio);
    const showExperienceLine = member.showExperienceLine !== false && member.experience != null;

    let cascadeIndex = 0;
    const nextStagger = () =>
      getTeamHeroTextStaggerPresentation(cascadeIndex++, prefersReducedMotion);

    const nameStagger = nextStagger();
    const roleStagger = nextStagger();
    const experienceStagger = showExperienceLine ? nextStagger() : null;
    const bioStaggers = bioParagraphs.map(() => nextStagger());

    return (
      <div
        ref={ref}
        className={[
          'grid min-h-0 w-full grid-cols-1 gap-y-4',
          'sm:mx-auto sm:w-full sm:max-w-team-hero-slide',
          'sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start sm:gap-x-team-hero-desktop sm:gap-y-0',
        ].join(' ')}
        aria-live="polite"
      >
        <div className="flex min-h-0 min-w-0 w-full max-w-full justify-center sm:col-start-1 sm:row-start-1">
          <div className="relative mx-auto w-fit max-w-full overflow-hidden rounded-card">
            <PlaceholderImage
              src={member.imageUrl}
              alt={member.name}
              layout="intrinsic"
              className="max-w-full"
              imgClassName="mx-auto block h-auto w-auto max-w-full max-h-team-hero-portrait-mobile sm:max-h-team-hero-portrait-desktop"
              loading="eager"
              fetchPriority="high"
            />
          </div>
        </div>

        <div className="min-h-0 min-w-0 w-full px-1 sm:col-start-2 sm:row-start-1 sm:px-0 sm:pb-8 sm:pt-0">
          <div className="max-w-prose space-y-4">
            <h3
              className={`font-heading text-lg font-normal text-text-inverse sm:text-xl lg:text-2xl ${nameStagger.className}`.trim()}
              style={nameStagger.style}
            >
              {member.name}
            </h3>
            <p
              className={`break-words text-xs text-text-inverse/80 sm:text-sm ${roleStagger.className}`.trim()}
              style={roleStagger.style}
            >
              {member.role}
            </p>
            {showExperienceLine && experienceStagger ? (
              <p
                className={`hidden text-sm text-text-inverse/80 sm:block ${experienceStagger.className}`.trim()}
                style={experienceStagger.style}
              >
                {member.experience} {UI.team.experienceSuffix}
              </p>
            ) : null}
            {bioParagraphs.map((paragraph, index) => (
              <p
                key={`${member.id}-bio-${index}`}
                className={`text-sm leading-relaxed text-text-inverse sm:text-base ${bioStaggers[index].className}`.trim()}
                style={bioStaggers[index].style}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

export default TeamMemberHeroSlide;
