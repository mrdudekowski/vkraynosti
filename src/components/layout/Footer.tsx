import { Link } from 'react-router-dom';
import SeasonLinkLabel from '../shared/SeasonLinkLabel';
import { UI } from '../../constants/ui';
import {
  FOOTER_CONTACT_LINK_CLASS,
} from '../../constants/footerContact';
import { ROUTES } from '../../constants/routes';
import { useCookieConsent } from '../../context/useCookieConsent';
import type { Season } from '../../types';
import type { FooterContentBlock, FooterContentRow } from '../../cms/siteContentDocument';
import { useSiteContent } from '../../context/SiteContentContext';

const FOOTER_SEASON_LINKS: { season: Season; to: string; hoverClass: string }[] = [
  { season: 'winter', to: ROUTES.WINTER, hoverClass: 'hover:text-season-winter' },
  { season: 'spring', to: ROUTES.SPRING, hoverClass: 'hover:text-season-spring' },
  { season: 'summer', to: ROUTES.SUMMER, hoverClass: 'hover:text-season-summer' },
  { season: 'fall', to: ROUTES.FALL, hoverClass: 'hover:text-season-fall' },
];

const sortedVisibleRows = (block: FooterContentBlock | undefined): FooterContentRow[] =>
  block?.visible === true
    ? [...block.rows].filter((row) => row.visible).sort((a, b) => a.order - b.order)
    : [];

const FooterRowLink = ({ row, className }: { row: Extract<FooterContentRow, { type: 'link' | 'pdf' }>; className: string }) => {
  const href = row.type === 'pdf' ? row.asset?.url ?? '#' : row.href;
  const external = href.startsWith('http') || row.type === 'pdf';
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      download={row.type === 'pdf' ? true : undefined}
      className={className}
    >
      {row.value}
    </a>
  );
};

const Footer = () => {
  const { openBanner } = useCookieConsent();
  const { contacts, footer } = useSiteContent();
  const footerBlocks = [...footer.blocks].filter((block) => block.visible).sort((a, b) => a.order - b.order);
  const blocksById = new Map(footerBlocks.map((block) => [block.id, block] as const));
  const footerRows = new Map(footerBlocks.flatMap((block) => block.rows.map((row) => [row.id, row] as const)));
  const footerRowValue = (id: string, fallback: string) => {
    const row = footerRows.get(id);
    return row == null ? fallback : row.visible ? row.value : '';
  };
  const contactChannels = contacts.channels.filter((channel) => channel.visible).sort((a, b) => a.order - b.order);
  const legalBlock = blocksById.get('legal');
  const navigationBlock = blocksById.get('navigation');
  const contactsBlock = blocksById.get('contacts');
  const legalRows = sortedVisibleRows(legalBlock);
  const navigationRows = sortedVisibleRows(navigationBlock);
  const footerContactRows = sortedVisibleRows(contactsBlock);
  const extraBlocks = footerBlocks.filter((block) => !new Set(['brand', 'legal', 'navigation', 'contacts', 'bottom']).has(block.id));

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
            <h4 className="font-normal text-text-inverse mb-4">{legalBlock?.heading || UI.footer.legalHeading}</h4>
            <div className="flex flex-col gap-2 text-text-inverse/60 text-sm leading-relaxed">
              {legalRows.filter((row) => row.type === 'text').map((row) => (
                <p key={row.id}>{row.id === 'inn' ? `${row.label || UI.footer.innLabel} ${row.value}` : row.value}</p>
              ))}
            </div>
          </div>
          <nav
            aria-label={UI.footer.documentsHeading}
            className="pt-4 border-t border-white/10"
          >
            <ul className="flex flex-col gap-2">
              {legalRows.filter((row) => row.type === 'pdf').map((row) => <li key={row.id}><FooterRowLink row={row} className="text-text-inverse/60 hover:text-brand-secondary transition-colors duration-hover text-sm underline-offset-2 hover:underline" /></li>)}
            </ul>
          </nav>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="font-normal text-text-inverse mb-4">{navigationBlock?.heading || UI.footer.navHeading}</h4>
          <ul className="flex flex-col gap-2">
            {navigationRows.filter((row): row is Extract<FooterContentRow, { type: 'link' }> => row.type === 'link').map((row) => <li key={row.id}><FooterRowLink row={row} className="text-text-inverse/60 hover:text-brand-secondary transition-colors duration-hover text-sm" /></li>)}
            {navigationRows.length === 0 ? FOOTER_SEASON_LINKS.map(({ season, to, hoverClass }) => <li key={season}><Link to={to} className={['inline-flex items-center gap-1.5 text-text-inverse/60 transition-colors duration-hover text-sm', hoverClass].join(' ')} prefetch="intent"><SeasonLinkLabel season={season} /></Link></li>) : null}
          </ul>
        </div>

        {/* Contacts */}
          <div>
            <h4 className="font-normal text-text-inverse mb-4">{contactsBlock?.heading || UI.footer.contactHeading}</h4>
            <div className="flex flex-col gap-3">{footerContactRows.filter((row): row is Extract<FooterContentRow, { type: 'link' }> => row.type === 'link').map((row) => <FooterRowLink key={row.id} row={row} className={FOOTER_CONTACT_LINK_CLASS} />)}{footerContactRows.length === 0 ? contactChannels.map((channel) => <a key={channel.id} href={channel.href} target={channel.type === 'phone' ? undefined : '_blank'} rel={channel.type === 'phone' ? undefined : 'noopener noreferrer external'} className={FOOTER_CONTACT_LINK_CLASS}>{channel.label}</a>) : null}</div>
          </div>
          {extraBlocks.map((block) => <div key={block.id}><h4 className="font-normal text-text-inverse mb-4">{block.heading}</h4><div className="flex flex-col gap-2 text-text-inverse/60 text-sm leading-relaxed">{sortedVisibleRows(block).map((row) => row.type === 'text' ? <p key={row.id}>{row.value}</p> : <FooterRowLink key={row.id} row={row} className="hover:text-brand-secondary transition-colors duration-hover" />)}</div></div>)}
      </div>

      <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-text-inverse/40 text-sm" data-nosnippet>
          {footerRowValue('rights', UI.footer.rights)}
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
          <button
            type="button"
            onClick={openBanner}
            className="text-text-inverse/40 hover:text-text-inverse text-sm transition-colors duration-hover"
          >
            {footerRowValue('cookie-settings', UI.footer.cookieSettings)}
          </button>
        </div>
      </div>

      <div className="border-t border-white/10 mt-6 pt-6 flex flex-col items-center gap-1 text-center">
        <p className="text-text-inverse/40 text-sm">{footerRowValue('studio-prefix', UI.footer.studioCreditPrefix)}</p>
        {(() => {
          const studio = footerRows.get('studio');
          return studio?.type === 'link' ? <FooterRowLink row={studio} className="text-text-inverse/60 hover:text-brand-secondary text-sm" /> : <span className="text-text-inverse/60 text-sm">{UI.footer.studioCreditName}</span>;
        })()}
      </div>
    </div>
  </footer>
  );
};

export default Footer;
