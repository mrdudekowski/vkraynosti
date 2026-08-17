import {
  BENTO_SLOT_PLACEMENTS,
  getBentoSlotTileClassName,
  type BentoBlockType,
} from '../../constants/tourBento';
import { ADMIN_UI } from '../constants/ui';

type BentoLayoutChipProps = {
  type: BentoBlockType;
  selected?: boolean;
  onClick: () => void;
};

const BentoLayoutChip = ({ type, selected = false, onClick }: BentoLayoutChipProps) => {
  const placements = BENTO_SLOT_PLACEMENTS[type];
  const gridClassName =
    type === 'bento-single' || type === 'bento-wide-square'
      ? 'grid h-full grid-cols-2 gap-0.5'
      : 'grid h-full grid-cols-2 grid-rows-2 gap-0.5';
  const label = ADMIN_UI.blockTypes[type];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={label}
      className={`flex w-20 flex-col items-center gap-1 rounded-card border p-1 ${
        selected ? 'border-brand-primary ring-2 ring-brand-primary/30' : 'border-divider'
      }`}
    >
      <span className="h-12 w-12 overflow-hidden rounded-card p-0.5">
        <span className={`${gridClassName} block h-full gap-0.5`}>
          {placements.map((placement, index) => (
            <span
              key={`${type}-${index}`}
              className={`${getBentoSlotTileClassName(placement)} bg-text-muted`}
            />
          ))}
        </span>
      </span>
      <span className="text-center text-tooltip leading-tight text-text-primary">{label}</span>
    </button>
  );
};

export default BentoLayoutChip;
