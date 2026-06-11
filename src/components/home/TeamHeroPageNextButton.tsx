import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight';
import { UI } from '../../constants/ui';

interface TeamHeroPageNextButtonProps {
  onNext: () => void;
}

const TeamHeroPageNextButton = ({ onNext }: TeamHeroPageNextButtonProps) => (
  <button
    type="button"
    onClick={onNext}
    aria-controls={UI.team.membersContainerId}
    className={[
      'self-end inline-flex min-h-12 items-center gap-2 px-1 py-2',
      'text-tour-detail-meta text-text-inverse/80 team-hero-desktop:text-tour-detail-hero-subtitle',
      'transition-opacity duration-hover hover:text-text-inverse',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
    ].join(' ')}
  >
    <span>{UI.team.nextTeamPageLabel}</span>
    <FontAwesomeIcon icon={faChevronRight} aria-hidden className="h-6 w-6 shrink-0 text-text-inverse" />
  </button>
);

export default TeamHeroPageNextButton;
