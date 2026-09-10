import {
  SAFETY_STATUS_CHECKBOX_SEASON_TEXT_CLASS,
  SAFETY_STATUS_PLAQUE_CHECKBOX_MODIFIER_FULL,
  SAFETY_STATUS_PLAQUE_CHECKBOX_MODIFIER_SMALL,
  SAFETY_STATUS_PLAQUE_CHECKBOX_WRAPPER_CLASS,
} from '../../constants/safetyStatusLayout';
import type { SafetyStatusCheckboxPhase } from '../../constants/safetyStatusRotation';
import type { Season } from '../../types';

const CHECKBOX_SVG_PATH =
  'M 1 9 L 1 9 c 0 -5 3 -8 8 -8 L 9 1 C 14 1 17 5 17 9 L 17 9 c 0 4 -4 8 -8 8 L 9 17 C 5 17 1 14 1 9 L 1 9 Z';
const CHECKBOX_SVG_POLYLINE = '1 9 7 14 15 4';

type SafetyStatusPlaqueCheckboxProps = {
  season: Season;
  phase: SafetyStatusCheckboxPhase;
};

const SafetyStatusPlaqueCheckbox = ({ season, phase }: SafetyStatusPlaqueCheckboxProps) => {
  const isChecked = phase === 'committing' || phase === 'checked';
  const isPulsing = phase === 'pulsing';
  const sizeModifier = isPulsing
    ? SAFETY_STATUS_PLAQUE_CHECKBOX_MODIFIER_SMALL
    : SAFETY_STATUS_PLAQUE_CHECKBOX_MODIFIER_FULL;

  return (
    <span
      aria-hidden
      className={[
        SAFETY_STATUS_PLAQUE_CHECKBOX_WRAPPER_CLASS,
        sizeModifier,
        SAFETY_STATUS_CHECKBOX_SEASON_TEXT_CLASS[season],
        isPulsing ? 'motion-safe:animate-safety-status-checkbox-pulse motion-reduce:animate-none' : '',
        isChecked ? 'safety-status-plaque-checkbox--checked' : '',
      ].join(' ')}
    >
      <svg
        className="safety-status-plaque-checkbox-svg"
        viewBox="0 0 18 18"
        aria-hidden
      >
        <path d={CHECKBOX_SVG_PATH} />
        <polyline points={CHECKBOX_SVG_POLYLINE} />
      </svg>
    </span>
  );
};

export default SafetyStatusPlaqueCheckbox;
