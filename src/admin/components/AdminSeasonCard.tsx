import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import { SEASON_ICON, SEASON_STYLE } from '../../constants/seasonNavbarAppearance';
import { IMAGES } from '../../constants/images';
import type { Season } from '../../types';
import PlaceholderImage from '../../components/shared/PlaceholderImage';
import { ADMIN_PATHS } from '../constants/routes';
import { ADMIN_UI } from '../constants/ui';

type AdminSeasonCardProps = {
  season: Season;
  tourCount: number;
};

const AdminSeasonCard = ({ season, tourCount }: AdminSeasonCardProps) => {
  const style = SEASON_STYLE[season];
  return (
    <Link
      to={ADMIN_PATHS.season(season)}
      className={`card-base group relative flex h-48 w-full flex-col justify-end no-underline ${style.border} ${style.hoverShadow}`}
    >
      <PlaceholderImage
        src={IMAGES.seasonSection[season]}
        alt=""
        className="absolute inset-0 h-full w-full"
        imgClassName="h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-surface-dark/45" />
      <div className="relative z-stack-base flex items-center gap-2 p-card-p">
        <FontAwesomeIcon icon={SEASON_ICON[season]} className={style.iconColor} aria-hidden />
        <h2 className="font-heading text-card text-text-inverse">{ADMIN_UI.seasons[season]}</h2>
        <span className="ml-auto text-sm text-text-inverse/80">({tourCount})</span>
      </div>
    </Link>
  );
};

export default AdminSeasonCard;
