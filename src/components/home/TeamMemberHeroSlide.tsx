import type { TeamMember } from '../../types';
import { getTeamHeroTextStaggerPresentation } from '../../constants/teamHeroAnimation';
import { UI } from '../../constants/ui';
import { useRevealOnScroll } from '../../hooks/useRevealOnScroll';
import PlaceholderImage from '../shared/PlaceholderImage';
import { splitTeamBioParagraphs } from '../../utils/team/splitTeamBioParagraphs';

export type TeamMemberHeroLayoutVariant = 'photo-start' | 'photo-end';

interface TeamMemberHeroSlideProps {
  member: TeamMember;
  prefersReducedMotion: boolean;
  layoutVariant?: TeamMemberHeroLayoutVariant;
  articleClassName?: string;
}

const portraitFrameClassName =
  'relative mx-auto w-fit max-w-full overflow-hidden rounded-card';

const portraitImageClassName =
  'mx-auto block h-auto w-auto max-w-full max-h-team-hero-portrait-mobile sm:max-h-team-hero-portrait-desktop';

const TeamMemberHeroSlide = ({
  member,
  prefersReducedMotion,
  layoutVariant = 'photo-start',
  articleClassName,
}: TeamMemberHeroSlideProps) => {
  const { ref: textRevealRef, isRevealed } = useRevealOnScroll({
    once: true,
    disabled: prefersReducedMotion,
  });

  const bioParagraphs = splitTeamBioParagraphs(member.bio);
  const showExperienceLine = member.showExperienceLine !== false && member.experience != null;
  const isPhotoEnd = layoutVariant === 'photo-end';
  const isTextRevealed = prefersReducedMotion || isRevealed;

  let cascadeIndex = 0;
  const nextStagger = () =>
    getTeamHeroTextStaggerPresentation(cascadeIndex++, prefersReducedMotion, isTextRevealed);

  const nameStagger = nextStagger();
  const roleStagger = nextStagger();
  const experienceStagger = showExperienceLine ? nextStagger() : null;
  const bioStaggers = bioParagraphs.map(() => nextStagger());

  const photoColumnClassName = [
    'flex min-h-0 min-w-0 w-full max-w-full justify-center',
    isPhotoEnd
      ? [
          'sm:col-start-2 sm:row-start-1 sm:relative sm:z-10',
          'sm:-mt-team-hero-staircase-offset-sm md:-mt-team-hero-staircase-offset-md lg:-mt-team-hero-staircase-offset-lg',
        ].join(' ')
      : 'sm:col-start-1 sm:row-start-1',
  ].join(' ');

  return (
    <article
      aria-labelledby={`${member.id}-name`}
      className={[isPhotoEnd ? 'sm:relative' : '', articleClassName].filter(Boolean).join(' ')}
    >
      <div
        className={[
          'grid min-h-0 w-full grid-cols-1 gap-y-team-hero-slide-mobile-row-gap',
          'sm:mx-auto sm:w-full sm:max-w-team-hero-slide',
          isPhotoEnd
            ? 'sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-x-team-hero-desktop sm:gap-y-0 sm:overflow-visible'
            : 'sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start sm:gap-x-team-hero-desktop sm:gap-y-0',
        ].join(' ')}
      >
        <div className={photoColumnClassName}>
          <div className={portraitFrameClassName}>
            <PlaceholderImage
              src={member.imageUrl}
              alt={member.name}
              layout="intrinsic"
              className="max-w-full"
              imgClassName={portraitImageClassName}
              loading="eager"
              fetchPriority="high"
            />
          </div>
        </div>

        <div
          ref={textRevealRef}
          className={[
            'min-h-0 min-w-0 w-full px-1 sm:px-0 sm:pb-8 sm:pt-0',
            isPhotoEnd ? 'sm:col-start-1 sm:row-start-1' : 'sm:col-start-2 sm:row-start-1',
          ].join(' ')}
        >
          <div className="max-w-prose space-y-4">
            <h3
              id={`${member.id}-name`}
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
    </article>
  );
};

export default TeamMemberHeroSlide;
