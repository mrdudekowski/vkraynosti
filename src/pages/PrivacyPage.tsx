import { useLayoutEffect } from 'react';
import { useLenis } from 'lenis/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons/faArrowLeft';
import { faFilePdf } from '@fortawesome/free-solid-svg-icons/faFilePdf';
import { Link } from 'react-router-dom';
import LegalPdfLink from '../components/legal/LegalPdfLink';
import PageMeta from '../components/shared/PageMeta';
import ScrollScrubFade from '../components/shared/ScrollScrubFade';
import { useSitePolicy, useSiteSeoPage } from '../context/SiteContentContext';
import { DEFAULT_PRIVACY_BODY_HTML } from '../cms/defaultPolicyBodyHtml';
import { sanitizePolicyHtml } from '../cms/sanitizePolicyHtml';
import { PRIVACY_POLICY_DOCUMENT_ID } from '../constants/legalDocuments';
import { ROUTES } from '../constants/routes';
import { scrollWindowToTopSmooth } from '../constants/smoothScroll';
import { SEO_DEFAULTS } from '../constants/seo';
import { UI } from '../constants/ui';

const PrivacyPage = () => {
  const lenis = useLenis();
  const copy = UI.privacyPage;
  const pageSeo = useSiteSeoPage('privacy');
  const policy = useSitePolicy(PRIVACY_POLICY_DOCUMENT_ID);

  useLayoutEffect(() => {
    scrollWindowToTopSmooth(lenis);
  }, [lenis]);

  const metaTitle = pageSeo?.title?.trim() || SEO_DEFAULTS.privacy.title;
  const metaDescription = pageSeo?.description?.trim() || SEO_DEFAULTS.privacy.description;
  const heading = pageSeo?.h1?.trim() || copy.title;

  return (
    <div className="bg-surface-light min-h-screen">
      <PageMeta
        title={metaTitle}
        description={metaDescription}
        keywords={pageSeo?.keywords}
        path={SEO_DEFAULTS.privacy.path}
        robots={SEO_DEFAULTS.privacy.robots}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link
          to={ROUTES.HOME}
          className="inline-flex items-center gap-2 text-text-muted hover:text-brand-primary text-sm mb-8 transition-colors duration-hover"
          prefetch="none"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          {copy.backLink}
        </Link>

        <div className="mb-10">
          <LegalPdfLink
            documentId={PRIVACY_POLICY_DOCUMENT_ID}
            className="inline-flex items-center gap-2 rounded-card border border-divider bg-surface-light px-4 py-3 text-sm font-medium text-brand-primary hover:bg-brand-primary/5 transition-colors duration-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary"
            ariaLabel={copy.downloadPdfAriaLabel}
          >
            <FontAwesomeIcon icon={faFilePdf} aria-hidden />
            {copy.downloadPdfLabel}
          </LegalPdfLink>
          <p className="mt-4 text-sm leading-relaxed text-text-muted">{copy.downloadPdfHint}</p>
        </div>

        <ScrollScrubFade as="h1" className="section-title text-text-primary mb-4">
          {heading}
        </ScrollScrubFade>
        <div
          className="privacy-policy-body space-y-4 text-text-primary leading-relaxed [&_h2]:font-heading [&_h2]:text-xl [&_h2]:font-normal [&_h2]:text-text-primary [&_h2]:mt-8 [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_a]:text-brand-primary"
          dangerouslySetInnerHTML={{
            __html: sanitizePolicyHtml(policy.bodyHtml.trim() || DEFAULT_PRIVACY_BODY_HTML),
          }}
        />
      </div>
    </div>
  );
};

export default PrivacyPage;
