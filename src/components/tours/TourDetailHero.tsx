import { Link } from 'react-router-dom';
import ScrollScrubFade from '../shared/ScrollScrubFade';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import PlaceholderImage from '../shared/PlaceholderImage';

interface TourDetailHeroProps {
  imageUrl: string;
  imageAlt: string;
  title: string;
  subtitle: string;
  backLinkTo: string;
  backLinkLabel: string;
  /** Классы `object-position` на `lg+` (токены `object-tour-detail-hero-desktop*` из темы). */
  desktopHeroImgClassName?: string;
  /** Первое фото галереи — полноэкранный просмотр (закрытие по клику вне кадра). */
  onOpenPhoto?: () => void;
  openPhotoAriaLabel?: string;
}

const TourDetailHero = ({
  imageUrl,
  imageAlt,
  title,
  subtitle,
  backLinkTo,
  backLinkLabel,
  desktopHeroImgClassName,
  onOpenPhoto,
  openPhotoAriaLabel = '',
}: TourDetailHeroProps) => (
  <div className="relative h-tour-detail-hero overflow-hidden">
    <PlaceholderImage
      src={imageUrl}
      alt={imageAlt}
      className="h-full w-full min-h-0"
      imgClassName={`object-center ${desktopHeroImgClassName ?? 'lg:object-tour-detail-hero-desktop'}`}
      loading="eager"
      fetchPriority="high"
    />
    {onOpenPhoto != null && (
      <button
        type="button"
        className="absolute inset-0 z-20 cursor-pointer bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
        aria-label={openPhotoAriaLabel}
        onClick={onOpenPhoto}
      />
    )}
    <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
    <div className="absolute bottom-0 left-0 right-0 z-30 tour-detail-page-gutter py-tour-detail-hero-overlay-y">
      <div className="tour-detail-page-measure flex flex-col gap-4">
        <Link
          to={backLinkTo}
          className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors duration-hover"
          prefetch="intent"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          {backLinkLabel}
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

export default TourDetailHero;
