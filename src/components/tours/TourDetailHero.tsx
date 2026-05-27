import { memo } from 'react';
import { Link } from 'react-router-dom';
import ScrollScrubFade from '../shared/ScrollScrubFade';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons/faArrowLeft';
import PlaceholderImage from '../shared/PlaceholderImage';
import SeasonLinkLabel from '../shared/SeasonLinkLabel';
import type { Season } from '../../types';
import {
  TOUR_DETAIL_HERO_CAPTION_SHELL_CLASS,
  TOUR_DETAIL_HERO_GRADIENT_OVERLAY_CLASS,
} from '../../constants/tourDetailHeroStack';

interface TourDetailHeroProps {
  imageUrl: string;
  imageAlt: string;
  title: string;
  subtitle: string;
  backLinkTo: string;
  backLinkSeason: Season;
  /** Классы `object-position` на `lg+` (токены `object-tour-detail-hero-desktop*` из темы). */
  desktopHeroImgClassName?: string;
  /**
   * Полный набор классов `object-position` для `<img>` (все брейкпоинты). Если задан — вместо
   * `object-center` + `desktopHeroImgClassName` / дефолтного `lg:object-tour-detail-hero-desktop`.
   */
  heroImageObjectClassName?: string;
}

const TourDetailHeroComponent = ({
  imageUrl,
  imageAlt,
  title,
  subtitle,
  backLinkTo,
  backLinkSeason,
  desktopHeroImgClassName,
  heroImageObjectClassName,
}: TourDetailHeroProps) => (
  <div className="relative h-tour-detail-hero overflow-hidden">
    <PlaceholderImage
      src={imageUrl}
      alt={imageAlt}
      className="h-full w-full min-h-0"
      imgClassName={
        heroImageObjectClassName ??
        `object-center ${desktopHeroImgClassName ?? 'lg:object-tour-detail-hero-desktop'}`
      }
      loading="eager"
      fetchPriority="high"
    />
    <div className={TOUR_DETAIL_HERO_GRADIENT_OVERLAY_CLASS} />
    <div className={TOUR_DETAIL_HERO_CAPTION_SHELL_CLASS}>
      <div className="tour-detail-page-measure flex flex-col gap-4">
        <Link
          to={backLinkTo}
          className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors duration-hover"
          prefetch="intent"
        >
          <FontAwesomeIcon icon={faArrowLeft} aria-hidden />
          <SeasonLinkLabel season={backLinkSeason} />
        </Link>
        <ScrollScrubFade as="h1" className="font-heading text-section font-normal text-white">
          {title}
        </ScrollScrubFade>
        <p className="text-tour-detail-hero-subtitle text-white/80 mt-1">
          {subtitle}
        </p>
      </div>
    </div>
  </div>
);

const TourDetailHero = memo(TourDetailHeroComponent);

export default TourDetailHero;
