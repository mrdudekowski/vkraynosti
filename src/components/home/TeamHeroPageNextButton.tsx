import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight';
import { UI } from '../../constants/ui';

interface TeamHeroPageNextButtonProps {
  onNext: () => void;
}

const TeamHeroPageNextButton = ({ onNext }: TeamHeroPageNextButtonProps) => (
  <div className="flex w-full justify-end pt-team-hero-members-stack-mobile team-hero-desktop:pt-team-hero-members lg:pt-team-hero-members-lg">
    <button
      type="button"
      onClick={onNext}
      aria-label={UI.team.nextTeamPageAriaLabel}
      aria-controls={UI.team.membersContainerId}
      className={[
        'inline-flex h-12 w-12 items-center justify-center',
        'text-text-inverse',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
      ].join(' ')}
    >
      <FontAwesomeIcon icon={faChevronRight} aria-hidden className="h-6 w-6" />
    </button>
  </div>
);

export default TeamHeroPageNextButton;
