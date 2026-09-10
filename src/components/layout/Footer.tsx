import { Link } from 'react-router-dom';
import SeasonLinkLabel from '../shared/SeasonLinkLabel';
import { UI } from '../../constants/ui';
import {
  FOOTER_CONTACT_LINK_CLASS,
} from '../../constants/footerContact';
import { LEGAL_ENTITY } from '../../constants/legalEntity';
import { LEGAL_DOCUMENTS_FOOTER } from '../../constants/legalDocuments';
import { ROUTES } from '../../constants/routes';
import LegalPdfLink from '../legal/LegalPdfLink';
import { useCookieConsent } from '../../context/useCookieConsent';
import type { Season } from '../../types';
import FooterStudioCreditLink from './FooterStudioCreditLink';
import { useSiteContent } from '../../context/SiteContentContext';

const FOOTER_SEASON_LINKS: { season: Season; to: string; hoverClass: string }[] = [
  { season: 'winter', to: ROUTES.WINTER, hoverClass: 'hover:text-season-winter' },
  { season: 'spring', to: ROUTES.SPRING, hoverClass: 'hover:text-season-spring' },
  { season: 'summer', to: ROUTES.SUMMER, hoverClass: 'hover:text-season-summer' },
  { season: 'fall', to: ROUTES.FALL, hoverClass: 'hover:text-season-fall' },
];

const Footer = () => {
  const { openBanner } = useCookieConsent();
  const { contacts, footer } = useSiteContent();
  const footerRows = new Map(footer.blocks.flatMap((block) => block.visible ? block.rows.map((row) => [row.id, row] as const) : []));
  const footerRowValue = (id: string, fallback: string) => {
    const row = footerRows.get(id);
    return row == null ? fallback : row.visible ? row.value : '';
  };
  const contactChannels = contacts.channels.filter((channel) => channel.visible).sort((a, b) => a.order - b.order);

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
          <p className="mt-3 text-text-inverse/60 text-sm leading-relaxed">{footerRowValue('tagline', UI.footer.tagline)}</p>
        </div>

        {/* Legal + documents */}
        <div className="flex flex-col gap-4">
          <div>
            <h4 className="font-normal text-text-inverse mb-4">{UI.footer.legalHeading}</h4>
            <div className="flex flex-col gap-2 text-text-inverse/60 text-sm leading-relaxed">
              <p>{footerRowValue('legal-name', LEGAL_ENTITY.fullName)}</p>
              <p>
                {UI.footer.innLabel} {footerRowValue('inn', LEGAL_ENTITY.inn)}
              </p>
              <p>{footerRowValue('legal-address', LEGAL_ENTITY.legalAddress)}</p>
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
          <div className="flex flex-col gap-3">{contactChannels.map((channel) => <a key={channel.id} href={channel.href} target={channel.type === 'phone' ? undefined : '_blank'} rel={channel.type === 'phone' ? undefined : 'noopener noreferrer external'} className={FOOTER_CONTACT_LINK_CLASS}>{channel.label}</a>)}</div>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-text-inverse/40 text-sm" data-nosnippet>
          {UI.footer.rights}
        </p>
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

      <div className="border-t border-white/10 mt-6 pt-6 flex flex-col items-center gap-1 text-center">
        <p className="text-text-inverse/40 text-sm">{UI.footer.studioCreditPrefix}</p>
        <FooterStudioCreditLink />
      </div>
    </div>
  </footer>
  );
};

export default Footer;
