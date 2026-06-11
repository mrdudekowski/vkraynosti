import LegalPdfLink from '../legal/LegalPdfLink';
import { COOKIE_BANNER_ICON } from '../../constants/images';
import { UI } from '../../constants/ui';
import { useCookieConsent } from '../../context/useCookieConsent';

const CookieConsentBanner = () => {
  const { isBannerOpen, acceptAnalytics, rejectAnalytics } = useCookieConsent();
  const copy = UI.cookieConsent;

  if (!isBannerOpen) return null;

  return (
    <div
      role="region"
      aria-label={copy.bannerAriaLabel}
      className="fixed inset-x-0 bottom-0 z-cookie-consent px-4 pb-4 pointer-events-none motion-reduce:transition-none"
    >
      <div className="pointer-events-auto mx-auto max-w-3xl rounded-card border border-white/10 bg-home-season-banner-stage shadow-xl px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
          <img
            src={COOKIE_BANNER_ICON}
            alt={copy.iconAlt}
            width={48}
            height={48}
            className="size-12 shrink-0 self-start sm:self-center"
            decoding="async"
            fetchPriority="low"
            draggable={false}
          />
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <p className="text-sm leading-relaxed text-text-inverse/90">{copy.bannerMessage}</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <button type="button" className="btn-primary text-sm" onClick={acceptAnalytics}>
                {copy.acceptLabel}
              </button>
              <button
                type="button"
                className="btn-ghost text-sm text-text-inverse border-text-inverse/30"
                onClick={rejectAnalytics}
              >
                {copy.essentialOnlyLabel}
              </button>
              <LegalPdfLink
                documentId="personal-data-policy"
                className="text-sm text-text-inverse/60 hover:text-brand-secondary transition-colors duration-hover underline-offset-2 hover:underline"
              >
                {copy.privacyLinkLabel}
              </LegalPdfLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
