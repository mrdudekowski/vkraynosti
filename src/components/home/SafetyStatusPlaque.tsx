import { HOME_SAFETY_STATUS_ICONS } from '../../constants/images';
import {
  SAFETY_STATUS_PLAQUE_ROW_CLASS,
  SAFETY_STATUS_PLAQUE_SHELL_CLASS,
  SAFETY_STATUS_PLAQUE_TEXT_CLASS,
  SAFETY_STATUS_PLAQUE_TEXT_SIZE_CLASS,
} from '../../constants/safetyStatusLayout';
import type { SafetyStatusCheckboxPhase } from '../../constants/safetyStatusRotation';
import {
  SAFETY_STATUS_PLAQUE_ENTER_HIDDEN_CLASS,
  SAFETY_STATUS_PLAQUE_ENTER_TRANSITION_CLASS,
  SAFETY_STATUS_PLAQUE_ENTER_VISIBLE_CLASS,
  type SafetyStatusFadePhase,
} from '../../constants/safetyStatusRotation';
import type { Season } from '../../types';
import SafetyStatusPlaqueCheckbox from './SafetyStatusPlaqueCheckbox';
import SafetyStatusSeasonIcon from './SafetyStatusSeasonIcon';

type SafetyStatusPlaqueProps = {
  index: number;
  text: string;
  season: Season;
  isActive: boolean;
  checkboxPhase: SafetyStatusCheckboxPhase;
  enteringFadePhase: SafetyStatusFadePhase;
};

const SafetyStatusPlaque = ({
  index,
  text,
  season,
  isActive,
  checkboxPhase,
  enteringFadePhase,
}: SafetyStatusPlaqueProps) => {
  const iconSrc = HOME_SAFETY_STATUS_ICONS[index] ?? HOME_SAFETY_STATUS_ICONS[0];

  const enterStateClass = isActive
    ? enteringFadePhase === 'hidden'
      ? SAFETY_STATUS_PLAQUE_ENTER_HIDDEN_CLASS
      : SAFETY_STATUS_PLAQUE_ENTER_VISIBLE_CLASS
    : SAFETY_STATUS_PLAQUE_ENTER_VISIBLE_CLASS;

  const plaqueCheckboxPhase: SafetyStatusCheckboxPhase = isActive
    ? checkboxPhase
    : 'checked';

  return (
    <div
      className={[
        SAFETY_STATUS_PLAQUE_SHELL_CLASS,
        isActive ? SAFETY_STATUS_PLAQUE_ENTER_TRANSITION_CLASS : '',
        enterStateClass,
      ].join(' ')}
    >
      <div className={SAFETY_STATUS_PLAQUE_ROW_CLASS}>
        <SafetyStatusSeasonIcon src={iconSrc} season={season} fadePhase="visible" />
        <p
          className={[
            'font-heading font-normal text-text-primary text-left',
            SAFETY_STATUS_PLAQUE_TEXT_SIZE_CLASS,
            SAFETY_STATUS_PLAQUE_TEXT_CLASS,
          ].join(' ')}
        >
          {text}
        </p>
        <SafetyStatusPlaqueCheckbox season={season} phase={plaqueCheckboxPhase} />
      </div>
    </div>
  );
};

export default SafetyStatusPlaque;
