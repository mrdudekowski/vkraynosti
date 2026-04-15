import { useEffect } from 'react';
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

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7539/ingest/43b5f5d9-745f-43fc-b1e5-79ca29b85a5b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d60173'},body:JSON.stringify({sessionId:'d60173',runId:'initial',hypothesisId:'H1',location:'src/components/shared/PageMeta.tsx:34',message:'PageMeta preload configuration snapshot',data:{path,videoPreloadCount:priorityVideoPreloads?.length ?? 0,heroImagePreloadEnabled:preloadHeroImageUrl != null,heroPreloadPriority},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }, [heroPreloadPriority, path, preloadHeroImageUrl, priorityVideoPreloads]);

  useEffect(() => {
    if (priorityVideoPreloads == null || priorityVideoPreloads.length === 0) {
      return;
    }

    // #region agent log
    fetch('http://127.0.0.1:7539/ingest/43b5f5d9-745f-43fc-b1e5-79ca29b85a5b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d60173'},body:JSON.stringify({sessionId:'d60173',runId:'initial',hypothesisId:'H2',location:'src/components/shared/PageMeta.tsx:44',message:'Video preload entries rendered in head',data:{path,entries:priorityVideoPreloads.map(({ href, fetchPriority }) => ({ href, fetchPriority, asValue:'video', hrefIsAbsolute:href.startsWith('http'), hrefExtension:href.split('.').pop() ?? null }))},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }, [path, priorityVideoPreloads]);

  useEffect(() => {
    if (preloadHeroImageUrl == null) {
      return;
    }

    // #region agent log
    fetch('http://127.0.0.1:7539/ingest/43b5f5d9-745f-43fc-b1e5-79ca29b85a5b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d60173'},body:JSON.stringify({sessionId:'d60173',runId:'initial',hypothesisId:'H3',location:'src/components/shared/PageMeta.tsx:56',message:'Hero image preload entry rendered in head',data:{path,href:preloadHeroImageUrl,asValue:'image',fetchPriority:heroPreloadPriority,hrefExtension:preloadHeroImageUrl.split('.').pop() ?? null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }, [heroPreloadPriority, path, preloadHeroImageUrl]);

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
