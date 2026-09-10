import { Helmet } from 'react-helmet-async';
import type { HomeSeasonBannerVideoPreloadLink } from '../../constants/homeSeasonBannerVideoPreload';
import { DOCUMENT_COLOR_SCHEME } from '../../constants/documentColorScheme';
import {
  SEO_DEFAULTS,
  getAbsoluteOgImageUrl,
  getCanonicalUrl,
  type RobotsDirective,
} from '../../constants/seo';

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
   * Ранний fetch первых N лупов сезонного баннера ворот (главная).
   * Политика и лимит N — в `homeSeasonBannerVideoPreload.ts` (`getHomeSeasonBannerWinterVideoPreloadLinks` / spring).
   */
  priorityVideoPreloads?: readonly HomeSeasonBannerVideoPreloadLink[];
  /** По умолчанию `high`: LCP image не должен уступать декоративным video preload. */
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
  const heroPreloadPriority = preloadHeroImageFetchPriority ?? 'high';

  const canonicalUrl = getCanonicalUrl(canonicalPath ?? path);
  const ogImage = imageUrl
    ? getAbsoluteOgImageUrl(imageUrl)
    : SEO_DEFAULTS.defaultOgImage;

  return (
    <Helmet>
      {preloadHeroImageUrl ? (
        <link rel="preload" as="image" href={preloadHeroImageUrl} fetchPriority={heroPreloadPriority} />
      ) : null}
      {priorityVideoPreloads?.map(({ href, fetchPriority }) => (
        <link key={href} rel="preload" as="video" href={href} fetchPriority={fetchPriority} />
      ))}
      <title>{title}</title>
      <meta name="color-scheme" content={DOCUMENT_COLOR_SCHEME} />
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={SEO_DEFAULTS.siteName} />
      <meta property="og:locale" content="ru_RU" />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={title} />
      <meta name="twitter:card" content={SEO_DEFAULTS.twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
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
