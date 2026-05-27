import { forwardRef } from 'react';
import ContactMessengerLogo from '../icons/ContactMessengerLogo';
import { CONTACTS } from '../../constants/contacts';
import {
  HOME_CONTACT_MESSENGER_ROW_CLASS,
  HOME_CONTACT_SECTION_CLASS,
  HOME_CONTACT_SECTION_ICON_BASE,
  HOME_CONTACT_SECTION_ICON_WELL_CLASS,
  HOME_CONTACT_SECTION_INNER_CLASS,
  HOME_CONTACT_SECTION_MESSENGER_LINK_MAX,
  HOME_CONTACT_SECTION_MESSENGER_LINK_PHONE,
  HOME_CONTACT_SECTION_MESSENGER_LINK_TELEGRAM,
  HOME_CONTACT_SECTION_SUBTITLE_CLASS,
} from '../../constants/homeContactSection';
import { HOME_SECTION_CONTACT } from '../../constants/routes';
import { UI } from '../../constants/ui';
import { toSafeExternalHttpHref, toSafePhoneHref } from '../../utils/safeHref';
import RevealBox from '../shared/RevealBox';
import ScrollScrubFade from '../shared/ScrollScrubFade';

const MESSENGER_ICON_CLASS = `${HOME_CONTACT_SECTION_ICON_BASE} object-contain`;

const ContactSection = forwardRef<HTMLElement>(function ContactSection(_, ref) {
  return (
    <section ref={ref} id={HOME_SECTION_CONTACT} className={HOME_CONTACT_SECTION_CLASS}>
      <div className={HOME_CONTACT_SECTION_INNER_CLASS}>
        <ScrollScrubFade as="h2" className="section-title mb-4">
          {UI.sections.contact}
        </ScrollScrubFade>

        <RevealBox as="div" className="mb-10 sm:mb-12">
          <p className={HOME_CONTACT_SECTION_SUBTITLE_CLASS}>{UI.contact.subtitle}</p>
        </RevealBox>

        <RevealBox as="div" className={HOME_CONTACT_MESSENGER_ROW_CLASS}>
          <a
            href={toSafePhoneHref(CONTACTS.PHONE_HREF)}
            className={HOME_CONTACT_SECTION_MESSENGER_LINK_PHONE}
            aria-label={UI.hero.homeHeroContactPhoneAria}
          >
            <span className={HOME_CONTACT_SECTION_ICON_WELL_CLASS}>
              <ContactMessengerLogo variant="phone" className={MESSENGER_ICON_CLASS} />
            </span>
          </a>
          <a
            href={toSafeExternalHttpHref(CONTACTS.TELEGRAM_HREF)}
            target="_blank"
            rel="noopener noreferrer external"
            referrerPolicy="no-referrer"
            className={HOME_CONTACT_SECTION_MESSENGER_LINK_TELEGRAM}
            aria-label={UI.tourRequestModal.messengerTelegramAria}
          >
            <span className={HOME_CONTACT_SECTION_ICON_WELL_CLASS}>
              <ContactMessengerLogo variant="telegram" className={MESSENGER_ICON_CLASS} />
            </span>
          </a>
          <a
            href={toSafeExternalHttpHref(CONTACTS.MAX_HREF)}
            target="_blank"
            rel="noopener noreferrer external"
            referrerPolicy="no-referrer"
            className={HOME_CONTACT_SECTION_MESSENGER_LINK_MAX}
            aria-label={UI.tourRequestModal.messengerMaxAria}
          >
            <span className={HOME_CONTACT_SECTION_ICON_WELL_CLASS}>
              <ContactMessengerLogo variant="max" className={MESSENGER_ICON_CLASS} />
            </span>
          </a>
        </RevealBox>
      </div>
    </section>
  );
});

export default ContactSection;
