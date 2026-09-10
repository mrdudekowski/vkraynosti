import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SEASON_ICON, SEASON_STYLE } from '../../constants/seasonNavbarAppearance';
import { UI } from '../../constants/ui';
import type { Season } from '../../types';

interface SeasonLinkLabelProps {
  season: Season;
  iconClassName?: string;
}

const SeasonLinkLabel = ({
  season,
  iconClassName = 'w-3.5 h-3.5 shrink-0',
}: SeasonLinkLabelProps) => (
  <>
    <FontAwesomeIcon
      icon={SEASON_ICON[season]}
      className={[iconClassName, SEASON_STYLE[season].iconColor].join(' ')}
      aria-hidden
    />
    {UI.seasons[season].label}
  </>
);

export default SeasonLinkLabel;
