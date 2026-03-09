interface PlaceholderImageProps {
  src: string;
  alt: string;
  className?: string;
}

const PlaceholderImage = ({ src, alt, className = '' }: PlaceholderImageProps) => (
  <img
    src={src}
    alt={alt}
    className={`object-cover ${className}`}
    loading="lazy"
  />
);

export default PlaceholderImage;
