import type { Season } from '../../types';
import SeasonIconButtons from '../shared/SeasonIconButtons';

interface SeasonTabsProps {
  activeSeason: Season;
  onSeasonChange: (season: Season) => void;
}

const SeasonTabs = ({ activeSeason, onSeasonChange }: SeasonTabsProps) => (
  <SeasonIconButtons
    activeSeason={activeSeason}
    onSeasonChange={onSeasonChange}
    variant="section"
    rowLayout
    className="mx-auto w-full max-w-lg"
  />
);

export default SeasonTabs;
