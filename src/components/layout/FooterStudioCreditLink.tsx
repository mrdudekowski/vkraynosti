import { SEASON_TEXT_CLASS } from '../../constants/seasonNavbarAppearance';
import { CONTACTS } from '../../constants/contacts';
import { UI } from '../../constants/ui';
import { useSeason } from '../../context/useSeason';
import { toSafeExternalHttpHref } from '../../utils/safeHref';

const hoverFadeClass = 'transition-opacity duration-hover motion-reduce:transition-none';

const FooterStudioCreditLink = () => {
  const { activeSeason } = useSeason();
  const seasonGradientClass = SEASON_TEXT_CLASS[activeSeason];

  return (
    <a
      href={toSafeExternalHttpHref(CONTACTS.STUDIO_TELEGRAM_HREF)}
      target="_blank"
      rel="noopener noreferrer external"
      referrerPolicy="no-referrer"
      aria-label={UI.footer.studioCreditLinkAriaLabel}
      className="group relative inline-grid font-doloto text-footer-studio-credit-name focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary focus-visible:rounded-sm"
    >
      <span
        className={`col-start-1 row-start-1 text-text-inverse/60 opacity-100 group-hover:opacity-0 ${hoverFadeClass}`}
      >
        {UI.footer.studioCreditName}
      </span>
      <span
        aria-hidden
        className={`col-start-1 row-start-1 opacity-0 group-hover:opacity-100 ${hoverFadeClass} ${seasonGradientClass}`}
      >
        {UI.footer.studioCreditName}
      </span>
    </a>
  );
};

export default FooterStudioCreditLink;
