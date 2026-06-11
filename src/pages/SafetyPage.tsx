import { useLayoutEffect } from 'react';
import { useLenis } from 'lenis/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons/faArrowLeft';
import { faFilePdf } from '@fortawesome/free-solid-svg-icons/faFilePdf';
import { Link } from 'react-router-dom';
import { SAFETY_OFFER_HEADER } from '../data/safetyOfferContent';
import SafetyOfferContent from '../components/legal/SafetyOfferContent';
import LegalPdfLink from '../components/legal/LegalPdfLink';
import { UI } from '../constants/ui';
import { ROUTES } from '../constants/routes';
import PageMeta from '../components/shared/PageMeta';
import ScrollScrubFade from '../components/shared/ScrollScrubFade';
import { scrollWindowToTopSmooth } from '../constants/smoothScroll';
import { SEO_DEFAULTS } from '../constants/seo';

const SafetyPage = () => {
  const lenis = useLenis();

  useLayoutEffect(() => {
    scrollWindowToTopSmooth(lenis);
  }, [lenis]);

  return (
    <div className="bg-surface-light min-h-screen">
      <PageMeta
        title={SEO_DEFAULTS.safety.title}
        description={SEO_DEFAULTS.safety.description}
        path={SEO_DEFAULTS.safety.path}
      />
      <div className="bg-brand-primary py-20 px-4 text-center">
        <ScrollScrubFade as="h1" className="section-title text-text-inverse mb-3">
          {SAFETY_OFFER_HEADER.title}
        </ScrollScrubFade>
        <p className="text-text-inverse/70 text-lg max-w-2xl mx-auto">
          {SAFETY_OFFER_HEADER.subtitle}
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link
          to={ROUTES.HOME}
          className="inline-flex items-center gap-2 text-text-muted hover:text-brand-primary text-sm mb-8 transition-colors duration-hover"
          prefetch="none"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          {UI.tourDetail.homeLink}
        </Link>

        <div className="mb-10">
          <LegalPdfLink
            documentId="offer-and-safety"
            className="inline-flex items-center gap-2 rounded-card border border-divider bg-surface-light px-4 py-3 text-sm font-medium text-brand-primary hover:bg-brand-primary/5 transition-colors duration-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary"
            ariaLabel={UI.safetyPage.downloadPdfAriaLabel}
          >
            <FontAwesomeIcon icon={faFilePdf} aria-hidden />
            {UI.safetyPage.downloadPdfLabel}
          </LegalPdfLink>
        </div>

        <SafetyOfferContent />
      </div>
    </div>
  );
};

export default SafetyPage;
