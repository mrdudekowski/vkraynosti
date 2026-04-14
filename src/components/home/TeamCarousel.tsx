import { forwardRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons/faChevronLeft';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight';
import { useCarousel } from '../../hooks/useCarousel';
import { useModal } from '../../context/useModal';
import PlaceholderImage from '../shared/PlaceholderImage';
import { TEAM } from '../../data/teamData';
import { TEAM_SECTION_DIVIDER_CLASS } from '../../constants/seasonTheme';
import RevealBox from '../shared/RevealBox';
import ScrollScrubFade from '../shared/ScrollScrubFade';
import { UI } from '../../constants/ui';
import { useSeason } from '../../context/useSeason';
import type { TeamMember } from '../../types';

const VISIBLE_COUNT = 3;

const TeamCard = ({ member, onClick }: { member: TeamMember; onClick: () => void }) => (
  <div
    className="card-base cursor-pointer flex-shrink-0 w-full sm:w-72"
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={e => e.key === 'Enter' && onClick()}
  >
    <div className="h-64">
      <PlaceholderImage src={member.imageUrl} alt={member.name} className="w-full h-full" />
    </div>
    <div className="p-card-p">
      <h3 className="font-heading font-normal text-text-primary">{member.name}</h3>
      <p className="text-text-muted text-sm mt-1">{member.role}</p>
      <p className="text-text-muted text-xs mt-2">
        {member.experience} {UI.team.experienceSuffix}
      </p>
    </div>
  </div>
);

const TeamCarousel = forwardRef<HTMLElement>(function TeamCarousel(_, ref) {
  const { activeSeason } = useSeason();
  const { current, next, prev } = useCarousel({ total: TEAM.length });
  const { openTeamModal } = useModal();

  const visibleMembers = Array.from({ length: VISIBLE_COUNT }, (_, i) =>
    TEAM[(current + i) % TEAM.length]
  );

  return (
    <section ref={ref} id="team" className="pt-home-section-top pb-section-y">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex w-full justify-center">
          <div
            className={[
              'h-px w-full max-w-team-section-divider shrink-0 rounded-full',
              TEAM_SECTION_DIVIDER_CLASS[activeSeason],
              'mb-team-section-divider-to-heading',
            ].join(' ')}
            aria-hidden={true}
          />
        </div>
        <div className="text-center mb-12">
          <ScrollScrubFade as="h2" className="section-title text-text-primary">
            {UI.sections.team}
          </ScrollScrubFade>
          <RevealBox as="div" className="mt-3">
            <p className="text-text-muted">{UI.sections.teamSub}</p>
          </RevealBox>
        </div>

        <RevealBox as="div" className="relative">
          <div className="flex gap-6 justify-center overflow-hidden">
            {visibleMembers.map(member => (
              <TeamCard
                key={member.id}
                member={member}
                onClick={() => openTeamModal(member)}
              />
            ))}
          </div>

          <button
            onClick={prev}
            className="absolute -left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-md hover:shadow-lg rounded-full flex items-center justify-center text-text-primary transition-all duration-hover hover:-translate-y-1"
            aria-label="Предыдущий"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <button
            onClick={next}
            className="absolute -right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-md hover:shadow-lg rounded-full flex items-center justify-center text-text-primary transition-all duration-hover hover:-translate-y-1"
            aria-label="Следующий"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </RevealBox>
      </div>
    </section>
  );
});

export default TeamCarousel;
