import { forwardRef } from 'react';
import ContactMessengerLogo from '../icons/ContactMessengerLogo';
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
import { useSiteContent } from '../../context/SiteContentContext';
import RevealBox from '../shared/RevealBox';
import ScrollScrubFade from '../shared/ScrollScrubFade';

const MESSENGER_ICON_CLASS = `${HOME_CONTACT_SECTION_ICON_BASE} object-contain`;

const ContactSection = forwardRef<HTMLElement>(function ContactSection(_, ref) {
  const { contacts } = useSiteContent();
  const channels = contacts.channels.filter((channel) => channel.visible).sort((a, b) => a.order - b.order);
  if (!contacts.sectionVisible) return null;
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
          {channels.filter((channel) => channel.type !== 'email').map((channel) => <a key={channel.id} href={channel.href} target={channel.type === 'phone' ? undefined : '_blank'} rel={channel.type === 'phone' ? undefined : 'noopener noreferrer external'} className={channel.type === 'telegram' ? HOME_CONTACT_SECTION_MESSENGER_LINK_TELEGRAM : channel.type === 'max' ? HOME_CONTACT_SECTION_MESSENGER_LINK_MAX : HOME_CONTACT_SECTION_MESSENGER_LINK_PHONE} aria-label={channel.type === 'phone' ? UI.hero.homeHeroContactPhoneAria : channel.type === 'telegram' ? UI.tourRequestModal.messengerTelegramAria : UI.tourRequestModal.messengerMaxAria}><span className={HOME_CONTACT_SECTION_ICON_WELL_CLASS}><ContactMessengerLogo variant={channel.type === 'telegram' ? 'telegram' : channel.type === 'max' ? 'max' : 'phone'} className={MESSENGER_ICON_CLASS} /></span></a>)}
        </RevealBox>
      </div>
    </section>
  );
});

export default ContactSection;
