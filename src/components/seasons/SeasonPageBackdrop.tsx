import { memo } from 'react';
import type { Season } from '../../types';
import {
  SEASON_PAGE_ATMOSPHERE_BG_CLASS,
  SEASON_PAGE_BG_CLASS,
} from '../../constants/seasonTheme';

interface SeasonPageBackdropProps {
  season: Season;
  /** По умолчанию: абсолютное заполнение родителя, под контентом. */
  className?: string;
}

const SeasonPageBackdropComponent = ({
  season,
  className = 'absolute inset-0 -z-10 overflow-hidden',
}: SeasonPageBackdropProps) => (
  <div className={className} aria-hidden>
    <div className={`absolute inset-0 ${SEASON_PAGE_BG_CLASS[season]}`} />
    <div
      className={`absolute -inset-[18%] bg-cover bg-center bg-no-repeat ${SEASON_PAGE_ATMOSPHERE_BG_CLASS[season]} blur-season-page-soft opacity-season-page-atmosphere pointer-events-none`}
    />
  </div>
);

const SeasonPageBackdrop = memo(SeasonPageBackdropComponent);

export default SeasonPageBackdrop;
