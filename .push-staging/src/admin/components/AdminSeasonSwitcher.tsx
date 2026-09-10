import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SEASON_ICON, SEASON_ORDER, SEASON_STYLE } from '../../constants/seasonNavbarAppearance';
import type { Season } from '../../types';
import { ADMIN_UI } from '../constants/ui';

type AdminSeasonSwitcherProps = {
  value: Season;
  onChange: (season: Season) => void;
};

const AdminSeasonSwitcher = ({ value, onChange }: AdminSeasonSwitcherProps) => (
  <div className="flex flex-wrap gap-1" role="tablist" aria-label={ADMIN_UI.seasonSwitcher}>
    {SEASON_ORDER.map((season) => {
      const selected = season === value;
      return (
        <button
          key={season}
          type="button"
          role="tab"
          aria-selected={selected}
          aria-label={ADMIN_UI.seasons[season]}
          title={ADMIN_UI.seasons[season]}
          className={selected ? 'admin-icon-btn border border-divider bg-surface-light text-text-primary' : 'admin-icon-btn'}
          onClick={() => onChange(season)}
        >
          <FontAwesomeIcon
            icon={SEASON_ICON[season]}
            className={`h-4 w-4 ${SEASON_STYLE[season].iconColor}`}
          />
        </button>
      );
    })}
  </div>
);

export default AdminSeasonSwitcher;
