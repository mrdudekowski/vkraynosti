import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons/faEnvelope';
import ContactMessengerLogo from '../icons/ContactMessengerLogo';
import SeasonLinkLabel from '../shared/SeasonLinkLabel';
import { UI } from '../../constants/ui';
import { CONTACTS } from '../../constants/contacts';
import {
  FOOTER_CONTACT_LINK_CLASS,
  FOOTER_CONTACT_MESSENGER_ICON_CLASS,
  FOOTER_CONTACT_MESSENGER_ICON_WELL_CLASS,
} from '../../constants/footerContact';
import { LEGAL_ENTITY } from '../../constants/legalEntity';
import { LEGAL_DOCUMENTS_FOOTER } from '../../constants/legalDocuments';
import { ROUTES } from '../../constants/routes';
import LegalPdfLink from '../legal/LegalPdfLink';
import { useCookieConsent } from '../../context/useCookieConsent';
import { toSafeExternalHttpHref, toSafeMailtoHref, toSafePhoneHref } from '../../utils/safeHref';
import type { Season } from '../../types';

const FOOTER_SEASON_LINKS: { season: Season; to: string; hoverClass: string }[] = [
  { season: 'winter', to: ROUTES.WINTER, hoverClass: 'hover:text-season-winter' },
  { season: 'spring', to: ROUTES.SPRING, hoverClass: 'hover:text-season-spring' },
  { season: 'summer', to: ROUTES.SUMMER, hoverClass: 'hover:text-season-summer' },
  { season: 'fall', to: ROUTES.FALL, hoverClass: 'hover:text-season-fall' },
];

const Footer = () => {
  const { openBanner } = useCookieConsent();

  return (
  <footer className="bg-home-season-banner-stage text-text-inverse">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12">
        {/* Brand */}
        <div>
          <Link
            to={ROUTES.HOME}
            className="font-heading text-2xl font-normal text-text-inverse hover:text-brand-secondary transition-colors duration-hover"
            prefetch="none"
          >
            {UI.nav.brand}
          </Link>
          <p className="mt-3 text-text-inverse/60 text-sm leading-relaxed">
            {UI.footer.tagline}
          </p>
        </div>

        {/* Legal + documents */}
        <div className="flex flex-col gap-4">
          <div>
            <h4 className="font-normal text-text-inverse mb-4">{UI.footer.legalHeading}</h4>
            <div className="flex flex-col gap-2 text-text-inverse/60 text-sm leading-relaxed">
              <p>{LEGAL_ENTITY.fullName}</p>
              <p>
                {UI.footer.innLabel} {LEGAL_ENTITY.inn}
              </p>
              <p>{LEGAL_ENTITY.legalAddress}</p>
            </div>
          </div>
          <nav
            aria-label={UI.footer.documentsHeading}
            className="pt-4 border-t border-white/10"
          >
            <ul className="flex flex-col gap-2">
              {LEGAL_DOCUMENTS_FOOTER.map((doc) => (
                <li key={doc.id}>
                  {doc.id === 'offer-and-safety' ? (
                    <Link
                      to={ROUTES.SAFETY}
                      className="text-text-inverse/60 hover:text-brand-secondary transition-colors duration-hover text-sm"
                      prefetch="intent"
                    >
                      {doc.title}
                    </Link>
                  ) : (
                    <LegalPdfLink
                      documentId={doc.id}
                      className="text-text-inverse/60 hover:text-brand-secondary transition-colors duration-hover text-sm underline-offset-2 hover:underline"
                    >
                      {doc.title}
                    </LegalPdfLink>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="font-normal text-text-inverse mb-4">{UI.footer.navHeading}</h4>
          <ul className="flex flex-col gap-2">
            {UI.nav.links.map(link => (
              <li key={link.hash}>
                <Link
                  to={{ pathname: ROUTES.HOME, hash: link.hash }}
                  className="text-text-inverse/60 hover:text-brand-secondary transition-colors duration-hover text-sm"
                  prefetch="none"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {FOOTER_SEASON_LINKS.map(({ season, to, hoverClass }) => (
              <li key={season}>
                <Link
                  to={to}
                  className={[
                    'inline-flex items-center gap-1.5 text-text-inverse/60 transition-colors duration-hover text-sm',
                    hoverClass,
                  ].join(' ')}
                  prefetch="intent"
                >
                  <SeasonLinkLabel season={season} />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contacts */}
        <div>
          <h4 className="font-normal text-text-inverse mb-4">{UI.footer.contactHeading}</h4>
          <div className="flex flex-col gap-3">
            <a
              href={toSafePhoneHref(CONTACTS.PHONE_HREF)}
              className={FOOTER_CONTACT_LINK_CLASS}
              aria-label={UI.contact.phone}
            >
              <span className={FOOTER_CONTACT_MESSENGER_ICON_WELL_CLASS}>
                <ContactMessengerLogo variant="phone" className={FOOTER_CONTACT_MESSENGER_ICON_CLASS} />
              </span>
              {CONTACTS.PHONE_NUMBER}
            </a>
            <a
              href={toSafeMailtoHref(`mailto:${CONTACTS.PERSONAL_DATA_EMAIL}`)}
              className="flex items-center gap-3 text-text-inverse/60 hover:text-brand-secondary transition-colors duration-hover text-sm"
            >
              <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 shrink-0" />
              {CONTACTS.PERSONAL_DATA_EMAIL}
            </a>
            <a
              href={toSafeExternalHttpHref(CONTACTS.TELEGRAM_HREF)}
              target="_blank"
              rel="noopener noreferrer external"
              referrerPolicy="no-referrer"
              className={FOOTER_CONTACT_LINK_CLASS}
              aria-label={UI.contact.telegram}
            >
              <span className={FOOTER_CONTACT_MESSENGER_ICON_WELL_CLASS}>
                <ContactMessengerLogo variant="telegram" className={FOOTER_CONTACT_MESSENGER_ICON_CLASS} />
              </span>
              {CONTACTS.TELEGRAM_HANDLE}
            </a>
            <a
              href={toSafeExternalHttpHref(CONTACTS.MAX_HREF)}
              target="_blank"
              rel="noopener noreferrer external"
              referrerPolicy="no-referrer"
              className={FOOTER_CONTACT_LINK_CLASS}
              aria-label={UI.contact.max}
            >
              <span className={FOOTER_CONTACT_MESSENGER_ICON_WELL_CLASS}>
                <ContactMessengerLogo variant="max" className={FOOTER_CONTACT_MESSENGER_ICON_CLASS} />
              </span>
              {UI.contact.max}
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-text-inverse/40 text-sm">{UI.footer.rights}</p>
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
          <button
            type="button"
            onClick={openBanner}
            className="text-text-inverse/40 hover:text-text-inverse text-sm transition-colors duration-hover"
          >
            {UI.footer.cookieSettings}
          </button>
        </div>
      </div>
    </div>
  </footer>
  );
};

export default Footer;
