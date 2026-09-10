import { Link, useLocation } from 'react-router-dom';
import PageMeta from '../components/shared/PageMeta';
import ScrollScrubFade from '../components/shared/ScrollScrubFade';
import { UI } from '../constants/ui';
import { ROUTES } from '../constants/routes';
import { SEO_DEFAULTS } from '../constants/seo';

const NotFoundPage = () => {
  const location = useLocation();

  return (
    <>
      <PageMeta
        title={SEO_DEFAULTS.notFound.title}
        description={SEO_DEFAULTS.notFound.description}
        path={location.pathname}
        canonicalPath={SEO_DEFAULTS.notFound.path}
        robots={SEO_DEFAULTS.notFound.robots}
      />
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface-light px-4">
        <div className="max-w-md w-full text-center">
          <ScrollScrubFade as="h1" className="font-heading text-section font-normal text-text-primary mb-3">
            {UI.notFoundPage.heading}
          </ScrollScrubFade>
          <p className="text-text-muted mb-8 leading-relaxed">
            {UI.notFoundPage.description}
          </p>
          <Link to={ROUTES.HOME} className="btn-primary inline-block" prefetch="none">
            {UI.notFoundPage.homeLink}
          </Link>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;
