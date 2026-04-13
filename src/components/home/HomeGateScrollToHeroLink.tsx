import { useCallback, type CSSProperties, type MouseEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLenis } from 'lenis/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAnglesDown } from '@fortawesome/free-solid-svg-icons';

import {
  HOME_SEASON_BANNER_WORDMARK_GRADIENT_BG_CLASS,
  HOME_SEASON_BANNER_WORDMARK_SOLID_TEXT_CLASS,
} from '../../constants/seasonTheme';
import { HOME_GATE_SCROLL_HERO_ICON_MASK_SRC } from '../../constants/homeGateScrollHeroMask';
import { ROUTES } from '../../constants/routes';
import { useHomeGateScrollHintVisible } from '../../hooks/useHomeGateScrollHintVisible';
import { HOME_HERO_SECTION_ELEMENT_ID } from '../../constants/homeHeroSnap';
import {
  NAVBAR_SCROLL_OFFSET_PX,
  scrollElementIntoViewAnchored,
} from '../../constants/smoothScroll';
import { UI } from '../../constants/ui';
import { useSeason } from '../../context/useSeason';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

const maskUrlCss = `url("${HOME_GATE_SCROLL_HERO_ICON_MASK_SRC}")`;

/**
 * Якорь и скролл как у пунктов навбара: `Link` на `/#home-hero` + `ScrollToTopOnNavigate`;
 * при уже активном hash — тот же вызов, что в `ScrollToTopOnNavigate`: `scrollElementIntoViewAnchored` + `NAVBAR_SCROLL_OFFSET_PX`.
 *
 * Градиент сезона: те же `bg-home-season-banner-wordmark-*`, что у букв баннера, через `mask-image`
 * (у `<svg>` Font Awesome `background-clip: text` даёт пустую иконку в части браузеров).
 */
export function HomeGateScrollToHeroLink() {
  const lenis = useLenis();
  const location = useLocation();
  const { activeSeason } = useSeason();
  const prefersReducedMotion = usePrefersReducedMotion();
  const scrollHintEnabled = location.pathname === ROUTES.HOME;
  const { visible: scrollHintVisible } = useHomeGateScrollHintVisible(scrollHintEnabled);
  const heroHash = `#${HOME_HERO_SECTION_ELEMENT_ID}`;

  const gradientMarkStyle = {
    WebkitMaskImage: maskUrlCss,
    maskImage: maskUrlCss,
    WebkitMaskSize: 'contain',
    maskSize: 'contain',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    maskPosition: 'center',
    ['--hsb-wm-x' as const]: '50%',
  } as CSSProperties;

  const handleClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (location.pathname !== ROUTES.HOME) return;
      if (location.hash !== heroHash) return;
      event.preventDefault();
      const el = document.getElementById(HOME_HERO_SECTION_ELEMENT_ID);
      if (el) {
        scrollElementIntoViewAnchored(lenis, el, NAVBAR_SCROLL_OFFSET_PX);
      }
    },
    [heroHash, lenis, location.hash, location.pathname]
  );

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-home-gate-scroll-hint flex justify-center pb-home-gate-scroll-hint-bottom">
      <Link
        to={{ pathname: ROUTES.HOME, hash: HOME_HERO_SECTION_ELEMENT_ID }}
        prefetch="none"
        onClick={handleClick}
        data-testid="home-gate-scroll-to-hero"
        aria-label={UI.sections.homeGateScrollToHeroAriaLabel}
        className={[
          'pointer-events-auto inline-flex min-h-home-gate-scroll-hint-target min-w-home-gate-scroll-hint-target',
          'items-center justify-center',
          prefersReducedMotion
            ? 'transition-none'
            : 'transition-opacity duration-home-gate-scroll-hint-fade ease-out',
          scrollHintVisible ? 'opacity-100' : 'opacity-0 pointer-events-none',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary',
        ].join(' ')}
      >
        <span className="inline-flex motion-safe:animate-home-gate-scroll-hint-bob">
          {prefersReducedMotion ? (
            <FontAwesomeIcon
              icon={faAnglesDown}
              className={[
                'h-home-gate-scroll-hint-icon w-home-gate-scroll-hint-icon drop-shadow-home-season-banner-letter',
                HOME_SEASON_BANNER_WORDMARK_SOLID_TEXT_CLASS[activeSeason],
              ].join(' ')}
              aria-hidden
            />
          ) : (
            <span
              aria-hidden
              className={[
                'inline-block h-home-gate-scroll-hint-icon w-home-gate-scroll-hint-icon shrink-0 drop-shadow-home-season-banner-letter',
                HOME_SEASON_BANNER_WORDMARK_GRADIENT_BG_CLASS[activeSeason],
                'bg-home-season-banner-wordmark-grid bg-no-repeat',
              ].join(' ')}
              style={gradientMarkStyle}
            />
          )}
        </span>
      </Link>
    </div>
  );
}
