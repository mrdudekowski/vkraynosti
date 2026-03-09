import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { useCarousel } from '../../hooks/useCarousel';
import { useModal } from '../../context/ModalContext';
import PlaceholderImage from '../shared/PlaceholderImage';
import { TEAM } from '../../data/teamData';
import { UI } from '../../constants/ui';
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
      <h3 className="font-display font-semibold text-text-primary">{member.name}</h3>
      <p className="text-text-muted text-sm mt-1">{member.role}</p>
      <p className="text-text-muted text-xs mt-2">{member.experience} опыта</p>
    </div>
  </div>
);

const TeamCarousel = () => {
  const { current, next, prev } = useCarousel({ total: TEAM.length });
  const { openTeamModal } = useModal();

  const visibleMembers = Array.from({ length: VISIBLE_COUNT }, (_, i) =>
    TEAM[(current + i) % TEAM.length]
  );

  return (
    <section id="team" className="py-section-y bg-surface-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="section-title text-text-primary">{UI.sections.team}</h2>
          <p className="text-text-muted mt-3">{UI.sections.teamSub}</p>
        </div>

        <div className="relative">
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
        </div>
      </div>
    </section>
  );
};

export default TeamCarousel;
