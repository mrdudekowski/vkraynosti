import { useLayoutEffect } from 'react';
import { getLegalDocumentUrl } from '../constants/legalDocuments';
import PageMeta from '../components/shared/PageMeta';
import { SEO_DEFAULTS } from '../constants/seo';

/**
 * Legacy route `/privacy` → official PDF (152-ФЗ policy).
 */
const PrivacyPage = () => {
  useLayoutEffect(() => {
    window.location.replace(getLegalDocumentUrl('personal-data-policy'));
  }, []);

  return (
    <PageMeta
      title={SEO_DEFAULTS.privacy.title}
      description={SEO_DEFAULTS.privacy.description}
      path={SEO_DEFAULTS.privacy.path}
      robots={SEO_DEFAULTS.privacy.robots}
    />
  );
};

export default PrivacyPage;
