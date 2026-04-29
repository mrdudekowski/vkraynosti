import { Helmet } from 'react-helmet-async';
import type { HomeSeasonBannerWinterVideoPreloadLink } from '../../constants/homeSeasonBannerVideoPreload';
import { SEO_DEFAULTS, getCanonicalUrl, type RobotsDirective } from '../../constants/seo';

interface PageMetaProps {
  title: string;
  description: string;
  imageUrl?: string;
  path: string;
  robots?: RobotsDirective;
  canonicalPath?: string;
  structuredData?: ReadonlyArray<Record<string, unknown>>;
  /** LCP: первый кадр героя / главное изображение страницы. */
  preloadHeroImageUrl?: string;
  /**
   * Ранний fetch первых N лупов сезонного баннера ворот (главная): в `<head>` раньше `preloadHeroImageUrl`.
   * Политика и лимит N — в `homeSeasonBannerVideoPreload.ts` (`getHomeSeasonBannerWinterVideoPreloadLinks` / spring).
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
  robots = SEO_DEFAULTS.robots,
  canonicalPath,
  structuredData,
  preloadHeroImageUrl,
  priorityVideoPreloads,
  preloadHeroImageFetchPriority,
}: PageMetaProps) => {
  const heroPreloadPriority =
    preloadHeroImageFetchPriority ??
    (priorityVideoPreloads != null && priorityVideoPreloads.length > 0 ? 'low' : 'high');

  const canonicalUrl = getCanonicalUrl(canonicalPath ?? path);

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
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={SEO_DEFAULTS.siteName} />
      <meta property="og:locale" content="ru_RU" />
      {imageUrl && <meta property="og:image" content={imageUrl} />}
      {imageUrl && <meta property="og:image:alt" content={title} />}
      <meta name="twitter:card" content={SEO_DEFAULTS.twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}
      <meta name="twitter:url" content={canonicalUrl} />
      {structuredData?.map((schema, index) => (
        <script key={`schema-${index}`} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default PageMeta;
