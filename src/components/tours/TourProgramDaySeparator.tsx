import type { Season, TourProgramStep } from '../../types';
import { getTourProgramDayLabel } from '../../utils/tourProgram/getTourProgramDayLabel';

const DAY_SEPARATOR_BG: Record<Season, string> = {
  winter: 'bg-season-accent-bar-winter',
  spring: 'bg-season-accent-bar-spring',
  summer: 'bg-season-accent-bar-summer',
  fall: 'bg-season-accent-bar-fall',
};

type TourProgramDaySeparatorProps = {
  step: TourProgramStep;
  season: Season;
};

const TourProgramDaySeparator = ({ step, season }: TourProgramDaySeparatorProps) => (
  <li className="flex items-center gap-3 py-1" data-tour-program-day-separator>
    <span className="shrink-0 font-heading text-tour-detail-program-body text-text-primary">
      {getTourProgramDayLabel(step)}
    </span>
    <span
      className={`h-px min-w-0 flex-1 ${DAY_SEPARATOR_BG[season]}`}
      data-testid="tour-program-day-divider"
      aria-hidden
    />
  </li>
);

export default TourProgramDaySeparator;
