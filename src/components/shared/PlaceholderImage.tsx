interface PlaceholderImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Доп. классы для `object-position` и т.п. (токены темы). */
  imgClassName?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
}

const PlaceholderImage = ({
  src,
  alt,
  className = '',
  imgClassName = '',
  loading = 'lazy',
  fetchPriority,
}: PlaceholderImageProps) => (
  <img
    src={src}
    alt={alt}
    className={`object-cover ${imgClassName} ${className}`.trim()}
    loading={loading}
    fetchPriority={fetchPriority}
  />
);

export default PlaceholderImage;
