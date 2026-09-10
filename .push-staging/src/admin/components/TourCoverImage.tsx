import PlaceholderImage from '../../components/shared/PlaceholderImage';
import { IMAGES } from '../../constants/images';

type TourCoverImageProps = {
  src: string | null | undefined;
  alt: string;
  className: string;
};

const TourCoverImage = ({ src, alt, className }: TourCoverImageProps) => (
  <PlaceholderImage
    src={src ?? IMAGES.tours.placeholder}
    alt={alt}
    className={className}
    imgClassName="h-full w-full object-cover"
  />
);

export default TourCoverImage;
