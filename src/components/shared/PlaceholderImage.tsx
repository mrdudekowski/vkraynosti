interface PlaceholderImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
}

const PlaceholderImage = ({
  src,
  alt,
  className = '',
  loading = 'lazy',
  fetchPriority,
}: PlaceholderImageProps) => (
  <img
    src={src}
    alt={alt}
    className={`object-cover ${className}`}
    loading={loading}
    fetchPriority={fetchPriority}
  />
);

export default PlaceholderImage;
