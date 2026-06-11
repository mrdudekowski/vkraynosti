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
  const hoverFadeClass =
    'transition-opacity duration-hover motion-reduce:transition-none';
  const restHoverClass = interactive
    ? `text-text-inverse transition-colors duration-hover group-hover:text-brand-secondary`
    : 'text-text-inverse';

  const firstLetterNode = interactive ? (
    <span className="relative inline-block align-baseline">
      <span className={`opacity-100 group-hover:opacity-0 ${hoverFadeClass} ${SEASON_TEXT_CLASS[season]}`}>
        {firstLetter}
      </span>
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 text-brand-secondary opacity-0 group-hover:opacity-100 ${hoverFadeClass}`}
      >
        {firstLetter}
      </span>
    </span>
  ) : (
    <span className={`transition-all duration-season-change ${SEASON_TEXT_CLASS[season]}`}>
      {firstLetter}
    </span>
  );

  return (
    <span className={['font-brand-wordmark', sizeClass, className].filter(Boolean).join(' ')}>
      {firstLetterNode}
      <span className={restHoverClass}>{rest}</span>
    </span>
  );
};

export default BrandWordmark;
