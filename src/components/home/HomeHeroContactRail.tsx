import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import ContactMessengerLogo from '../icons/ContactMessengerLogo';
import { CONTACTS } from '../../constants/contacts';
import { ROUTES } from '../../constants/routes';
import { UI } from '../../constants/ui';
import {
  HOME_CONTACT_MESSENGER_ICON_BASE,
  HOME_CONTACT_MESSENGER_ICON_WELL_CLASS,
  HOME_CONTACT_MESSENGER_LINK_MAX,
  HOME_CONTACT_MESSENGER_LINK_PHONE,
  HOME_CONTACT_MESSENGER_LINK_TELEGRAM,
} from '../../constants/homeContactMessenger';
import { useHomeHeroContactRailMotion } from '../../hooks/useHomeHeroContactRailMotion';
import { useHomeNavbarChrome } from '../../context/useHomeNavbarChrome';
import { toSafeExternalHttpHref, toSafePhoneHref } from '../../utils/safeHref';

const MESSENGER_ICON_CLASS = `${HOME_CONTACT_MESSENGER_ICON_BASE} object-contain`;

const HomeHeroContactRail = () => {
  const { pathname } = useLocation();
  const isHome = pathname === ROUTES.HOME;
  const { snap } = useHomeNavbarChrome();
  const { setRailOuterRef } = useHomeHeroContactRailMotion({ enabled: isHome });

  if (!isHome || typeof document === 'undefined') {
    return null;
  }

  const shellTransition = snap.disableTopChromeTransition
    ? 'duration-0'
    : 'transition-[transform,opacity] duration-home-hero-contact-rail ease-out';

  return createPortal(
    <div
      ref={setRailOuterRef}
      className={`fixed right-0 top-navbar-chrome z-home-hero-contact-rail mt-home-hero-contact-rail-top-gap pr-4 sm:pr-6 lg:pr-8 ${shellTransition}`}
      data-home-hero-contact-rail
    >
      <div className="relative z-10 flex flex-row gap-home-hero-contact-rail overflow-visible will-change-transform">
        <a
          href={toSafePhoneHref(CONTACTS.PHONE_HREF)}
          className={HOME_CONTACT_MESSENGER_LINK_PHONE}
          aria-label={UI.hero.homeHeroContactPhoneAria}
        >
          <span className={HOME_CONTACT_MESSENGER_ICON_WELL_CLASS}>
            <ContactMessengerLogo variant="phone" className={MESSENGER_ICON_CLASS} />
          </span>
        </a>
        <a
          href={toSafeExternalHttpHref(CONTACTS.TELEGRAM_HREF)}
          target="_blank"
          rel="noopener noreferrer external"
          referrerPolicy="no-referrer"
          className={HOME_CONTACT_MESSENGER_LINK_TELEGRAM}
          aria-label={UI.tourRequestModal.messengerTelegramAria}
        >
          <span className={HOME_CONTACT_MESSENGER_ICON_WELL_CLASS}>
            <ContactMessengerLogo variant="telegram" className={MESSENGER_ICON_CLASS} />
          </span>
        </a>
        <a
          href={toSafeExternalHttpHref(CONTACTS.MAX_HREF)}
          target="_blank"
          rel="noopener noreferrer external"
          referrerPolicy="no-referrer"
          className={HOME_CONTACT_MESSENGER_LINK_MAX}
          aria-label={UI.tourRequestModal.messengerMaxAria}
        >
          <span className={HOME_CONTACT_MESSENGER_ICON_WELL_CLASS}>
            <ContactMessengerLogo variant="max" className={MESSENGER_ICON_CLASS} />
          </span>
        </a>
      </div>
    </div>,
    document.body
  );
};

export default HomeHeroContactRail;
