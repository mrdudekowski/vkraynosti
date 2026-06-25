import type { Season } from '../../types';
import { UI } from '../../constants/ui';

const SEASONS: Season[] = ['winter', 'spring', 'summer', 'fall'];

interface SeasonTabsProps {
  activeSeason: Season;
  onSeasonChange: (season: Season) => void;
}

const SeasonTabs = ({ activeSeason, onSeasonChange }: SeasonTabsProps) => (
  <div
    className="mx-auto flex max-w-lg rounded-full bg-brand-accent p-1 shadow-tourIncludedPanel"
    role="tablist"
    aria-label={UI.telegramMiniApp.seasonTabsAria}
  >
    {SEASONS.map(season => {
      const isActive = season === activeSeason;
      return (
        <button
          key={season}
          type="button"
          role="tab"
          aria-selected={isActive}
          className={[
            'flex-1 rounded-full px-2 py-2 text-sm font-semibold transition-colors duration-hover',
            isActive
              ? 'bg-brand-primary text-text-inverse'
              : 'bg-transparent text-brand-primary',
          ].join(' ')}
          onClick={() => onSeasonChange(season)}
        >
          {UI.seasons[season].label}
        </button>
      );
    })}
  </div>
);

export default SeasonTabs;
