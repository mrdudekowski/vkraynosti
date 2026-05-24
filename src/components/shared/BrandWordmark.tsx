import { SEASON_TEXT_CLASS } from '../../constants/seasonNavbarAppearance';
import { UI } from '../../constants/ui';
import type { Season } from '../../types';
import { splitBrandWordmark } from '../../utils/brand/splitBrandWordmark';

type BrandWordmarkProps = {
  season: Season;
  /** `nav` — фиксированный размер navbar; `inherit` — размер от родителя. */
  size?: 'nav' | 'inherit';
  /** Hover как у ссылки navbar (`group` на родителе). */
  interactive?: boolean;
  wordmark?: string;
  className?: string;
};

const BrandWordmark = ({
  season,
  size = 'inherit',
  interactive = false,
  wordmark = UI.nav.brand,
  className = '',
}: BrandWordmarkProps) => {
  const { firstLetter, rest } = splitBrandWordmark(wordmark);
  const sizeClass = size === 'nav' ? 'text-brand-wordmark-nav' : '';
  const firstLetterHoverClass = interactive
    ? ' group-hover:!bg-none group-hover:!text-brand-secondary'
    : '';
  const restHoverClass = interactive
    ? ' transition-colors duration-hover group-hover:text-brand-secondary'
    : '';

  return (
    <span className={['font-brand-wordmark', sizeClass, className].filter(Boolean).join(' ')}>
      <span
        className={`transition-all duration-season-change ${SEASON_TEXT_CLASS[season]}${firstLetterHoverClass}`}
      >
        {firstLetter}
      </span>
      <span className={`text-text-inverse${restHoverClass}`}>{rest}</span>
    </span>
  );
};

export default BrandWordmark;
