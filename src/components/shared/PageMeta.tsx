import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import type { HomeSeasonBannerVideoPreloadLink } from '../../constants/homeSeasonBannerVideoPreload';
import { DOCUMENT_COLOR_SCHEME } from '../../constants/documentColorScheme';
import {
  SEO_DEFAULTS,
  getAbsoluteOgImageUrl,
  getCanonicalUrl,
  type RobotsDirective,
} from '../../constants/seo';
import { stripBuildTimeSeoHead } from '../../utils/stripBuildTimeSeoHead';

interface PageMetaProps {
  title: string;
  description: string;
  keywords?: readonly string[];
  imageUrl?: string;
  /** Disable Open Graph and Twitter tags for pages that should not have social previews. */
  includeSocialMetadata?: boolean;
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
  keywords,
  imageUrl,
  includeSocialMetadata = true,
  path,
  robots = SEO_DEFAULTS.robots,
  canonicalPath,
  structuredData,
  preloadHeroImageUrl,
  priorityVideoPreloads,
  preloadHeroImageFetchPriority,
}: PageMetaProps) => {
  const heroPreloadPriority = preloadHeroImageFetchPriority ?? 'high';

  useEffect(() => {
    stripBuildTimeSeoHead();
  }, [title, description, imageUrl, includeSocialMetadata, path, robots, canonicalPath]);

  const canonicalUrl = getCanonicalUrl(canonicalPath ?? path);
  const ogImage = includeSocialMetadata
    ? imageUrl
      ? getAbsoluteOgImageUrl(imageUrl)
      : SEO_DEFAULTS.defaultOgImage
    : null;

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
      {keywords != null && keywords.length > 0 ? <meta name="keywords" content={keywords.join(', ')} /> : null}
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonicalUrl} />
      {includeSocialMetadata && ogImage ? (
        [
          <meta key="og-title" property="og:title" content={title} />,
          <meta key="og-description" property="og:description" content={description} />,
          <meta key="og-type" property="og:type" content="website" />,
          <meta key="og-url" property="og:url" content={canonicalUrl} />,
          <meta key="og-site-name" property="og:site_name" content={SEO_DEFAULTS.siteName} />,
          <meta key="og-locale" property="og:locale" content="ru_RU" />,
          <meta key="og-image" property="og:image" content={ogImage} />,
          <meta key="og-image-alt" property="og:image:alt" content={title} />,
          <meta key="twitter-card" name="twitter:card" content={SEO_DEFAULTS.twitterCard} />,
          <meta key="twitter-title" name="twitter:title" content={title} />,
          <meta key="twitter-description" name="twitter:description" content={description} />,
          <meta key="twitter-image" name="twitter:image" content={ogImage} />,
          <meta key="twitter-url" name="twitter:url" content={canonicalUrl} />,
        ]
      ) : null}
      {structuredData?.map((schema, index) => (
        <script key={`schema-${index}`} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default PageMeta;
