import { Link } from 'react-router-dom';
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
  /** Открыть полноэкранную галерею с первого кадра. */
  onOpenGallery?: () => void;
  openGalleryAriaLabel?: string;
}

const TourDetailHero = ({
  imageUrl,
  imageAlt,
  title,
  subtitle,
  backLinkTo,
  backLinkLabel,
  onOpenGallery,
  openGalleryAriaLabel = '',
}: TourDetailHeroProps) => (
  <div className="relative h-tour-detail-hero overflow-hidden">
    <PlaceholderImage
      src={imageUrl}
      alt={imageAlt}
      className="h-full w-full min-h-0"
      imgClassName="object-center lg:object-tour-detail-hero-desktop"
      loading="eager"
      fetchPriority="high"
    />
    {onOpenGallery && (
      <button
        type="button"
        className="absolute inset-0 z-20 cursor-pointer bg-transparent"
        aria-label={openGalleryAriaLabel}
        onClick={onOpenGallery}
      />
    )}
    <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
    <div className="absolute bottom-0 left-0 right-0 z-30 tour-detail-page-gutter py-8">
      <div className="tour-detail-page-measure flex flex-col gap-4">
        <Link
          to={backLinkTo}
          className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors duration-hover"
          prefetch="intent"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          {backLinkLabel}
        </Link>
        <h1 className="font-heading text-section font-normal text-white">{title}</h1>
        <p className="text-tour-detail-hero-subtitle text-white/80 mt-1">
          {subtitle}
        </p>
      </div>
    </div>
  </div>
);

export default TourDetailHero;
