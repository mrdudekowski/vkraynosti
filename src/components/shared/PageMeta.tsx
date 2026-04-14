import { Helmet } from 'react-helmet-async';
import { SITE_URL } from '../../constants/contacts';
import type { HomeSeasonBannerWinterVideoPreloadLink } from '../../constants/homeSeasonBannerVideoPreload';

interface PageMetaProps {
  title: string;
  description: string;
  imageUrl?: string;
  path: string;
  /** LCP: первый кадр героя / главное изображение страницы. */
  preloadHeroImageUrl?: string;
  /**
   * Ранний fetch лупов баннера (главная, зима): в `<head>` раньше `preloadHeroImageUrl`.
   * См. `getHomeSeasonBannerWinterVideoPreloadLinks`.
   */
  priorityVideoPreloads?: readonly HomeSeasonBannerWinterVideoPreloadLink[];
  /** По умолчанию `high`, если нет `priorityVideoPreloads`; иначе `low` (ролики баннера впереди). */
  preloadHeroImageFetchPriority?: 'high' | 'low' | 'auto';
}

const PageMeta = ({
  title,
  description,
  imageUrl,
  path,
  preloadHeroImageUrl,
  priorityVideoPreloads,
  preloadHeroImageFetchPriority,
}: PageMetaProps) => {
  const heroPreloadPriority =
    preloadHeroImageFetchPriority ??
    (priorityVideoPreloads != null && priorityVideoPreloads.length > 0 ? 'low' : 'high');

  return (
    <Helmet>
      {priorityVideoPreloads?.map(({ href, fetchPriority }) => (
        <link key={href} rel="preload" as="video" href={href} fetchPriority={fetchPriority} />
      ))}
      {preloadHeroImageUrl ? (
        <link rel="preload" as="image" href={preloadHeroImageUrl} fetchPriority={heroPreloadPriority} />
      ) : null}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={`${SITE_URL}${path}`} />
      <meta property="og:locale" content="ru_RU" />
      {imageUrl && <meta property="og:image" content={imageUrl} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}
    </Helmet>
  );
};

export default PageMeta;
