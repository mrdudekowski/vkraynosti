import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { UI } from '../constants/ui';
import PageMeta from '../components/shared/PageMeta';
import ScrollScrubFade from '../components/shared/ScrollScrubFade';

const PrivacyPage = () => {
  const { privacyPage: p } = UI;

  return (
    <div className="bg-surface-light min-h-screen">
      <PageMeta
        title={p.metaTitle}
        description={p.metaDescription}
        path={ROUTES.PRIVACY}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-section-y">
        <Link
          to={ROUTES.HOME}
          className="inline-block text-text-muted hover:text-brand-primary text-sm mb-8 transition-colors duration-hover"
          prefetch="none"
        >
          {p.backLink}
        </Link>
        <ScrollScrubFade as="h1" className="font-heading text-section font-normal text-text-primary mb-6">
          {p.title}
        </ScrollScrubFade>
        <p className="text-text-muted leading-relaxed mb-8">{p.intro}</p>
        <div className="flex flex-col gap-6">
          {p.paragraphs.map((paragraph, idx) => (
            <p key={idx} className="text-text-muted leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
