import type { TeamMember } from '../../types';
import { getTeamHeroTextStaggerPresentation } from '../../constants/teamHeroAnimation';
import type { TeamHeroDesktopTextAlign } from '../../constants/teamHeroPortraitLayout';
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
  /** Нижняя граница текстовой колонки на team-hero-desktop (передаётся только для team-1 из секции). */
  desktopTextAlign?: TeamHeroDesktopTextAlign;
}

const portraitFrameClassName =
  'relative mx-auto w-fit max-w-full overflow-hidden rounded-card';

const portraitImageClassName =
  'mx-auto block h-auto w-auto max-w-full max-h-team-hero-portrait-mobile team-hero-desktop:max-h-team-hero-portrait-desktop';

const TeamMemberHeroSlide = ({
  member,
  prefersReducedMotion,
  layoutVariant = 'photo-start',
  articleClassName,
  desktopTextAlign,
}: TeamMemberHeroSlideProps) => {
  const { ref: textRevealRef, isRevealed } = useRevealOnScroll({
    once: true,
    disabled: prefersReducedMotion,
  });

  const bioParagraphs = splitTeamBioParagraphs(member.bio);
  const showExperienceLine = member.showExperienceLine !== false && member.experience != null;
  const isPhotoEnd = layoutVariant === 'photo-end';
  const isDesktopTextAlignEnd = desktopTextAlign === 'end';
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
          'team-hero-desktop:col-start-2 team-hero-desktop:row-start-1 team-hero-desktop:relative team-hero-desktop:z-10',
          'team-hero-desktop:-mt-team-hero-staircase-offset-sm md:-mt-team-hero-staircase-offset-md lg:-mt-team-hero-staircase-offset-lg',
        ].join(' ')
      : 'team-hero-desktop:col-start-1 team-hero-desktop:row-start-1',
  ].join(' ');

  return (
    <article
      aria-labelledby={`${member.id}-name`}
      className={[isPhotoEnd ? 'team-hero-desktop:relative' : '', articleClassName]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className={[
          'grid min-h-0 w-full grid-cols-1 gap-y-team-hero-slide-mobile-row-gap',
          'team-hero-desktop:mx-auto team-hero-desktop:w-full team-hero-desktop:max-w-team-hero-slide',
          isPhotoEnd
            ? [
                'team-hero-desktop:grid-cols-[minmax(0,1fr)_auto] team-hero-desktop:gap-x-team-hero-desktop team-hero-desktop:gap-y-0 team-hero-desktop:overflow-visible',
                isDesktopTextAlignEnd
                  ? 'team-hero-desktop:items-end'
                  : 'team-hero-desktop:items-start',
              ].join(' ')
            : [
                'team-hero-desktop:grid-cols-[auto_minmax(0,1fr)] team-hero-desktop:gap-x-team-hero-desktop team-hero-desktop:gap-y-0',
                isDesktopTextAlignEnd
                  ? 'team-hero-desktop:items-end'
                  : 'team-hero-desktop:items-start',
              ].join(' '),
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
            'min-h-0 min-w-0 w-full px-4 py-4 team-hero-desktop:px-0 team-hero-desktop:pt-0',
            isDesktopTextAlignEnd ? 'team-hero-desktop:pb-0' : 'team-hero-desktop:pb-8',
            isPhotoEnd
              ? 'team-hero-desktop:col-start-1 team-hero-desktop:row-start-1'
              : 'team-hero-desktop:col-start-2 team-hero-desktop:row-start-1',
          ].join(' ')}
        >
          <div className="max-w-prose space-y-4 team-hero-desktop:space-y-3">
            <h3
              id={`${member.id}-name`}
              className={`font-heading text-tour-detail-program-heading font-normal text-text-inverse team-hero-desktop:text-tour-detail-program-heading lg:text-tour-detail-section ${nameStagger.className}`.trim()}
              style={nameStagger.style}
            >
              {member.name}
            </h3>
            <p
              className={`break-words text-tour-detail-meta text-text-inverse/80 team-hero-desktop:text-tour-detail-hero-subtitle ${roleStagger.className}`.trim()}
              style={roleStagger.style}
            >
              {member.role}
            </p>
            {showExperienceLine && experienceStagger ? (
              <p
                className={`hidden text-tour-detail-meta text-text-inverse/80 team-hero-desktop:block team-hero-desktop:text-tour-detail-hero-subtitle ${experienceStagger.className}`.trim()}
                style={experienceStagger.style}
              >
                {member.experience} {UI.team.experienceSuffix}
              </p>
            ) : null}
            {bioParagraphs.map((paragraph, index) => (
              <p
                key={`${member.id}-bio-${index}`}
                className={`text-tour-detail-hero-subtitle leading-team-hero-bio text-text-inverse team-hero-desktop:text-tour-detail-prose team-hero-desktop:leading-team-hero-bio md:leading-team-hero-bio lg:leading-team-hero-bio ${bioStaggers[index].className}`.trim()}
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
