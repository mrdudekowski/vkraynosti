import { forwardRef } from 'react';
import { Link2, Mail, Phone } from 'lucide-react';
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
import { toSafeExternalHttpHref, toSafeMailtoHref, toSafePhoneHref } from '../../utils/safeHref';
import RevealBox from '../shared/RevealBox';
import ScrollScrubFade from '../shared/ScrollScrubFade';

const MESSENGER_ICON_CLASS = `${HOME_CONTACT_SECTION_ICON_BASE} object-contain`;

const channelHref = (channel: { type: string; href: string }) => {
  if (channel.type === 'phone') return toSafePhoneHref(channel.href);
  if (channel.type === 'email') return toSafeMailtoHref(channel.href);
  return toSafeExternalHttpHref(channel.href);
};

const channelLabel = (channel: { type: string; label: string }) => {
  if (channel.type === 'phone') return UI.hero.homeHeroContactPhoneAria;
  if (channel.type === 'telegram') return UI.tourRequestModal.messengerTelegramAria;
  if (channel.type === 'max') return UI.tourRequestModal.messengerMaxAria;
  return channel.label;
};

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
          {channels.map((channel) => {
            const Icon = channel.type === 'phone' ? Phone : channel.type === 'email' ? Mail : channel.type === 'link' ? Link2 : null;
            const className = channel.type === 'telegram' ? HOME_CONTACT_SECTION_MESSENGER_LINK_TELEGRAM : channel.type === 'max' ? HOME_CONTACT_SECTION_MESSENGER_LINK_MAX : HOME_CONTACT_SECTION_MESSENGER_LINK_PHONE;
            return <a key={channel.id} href={channelHref(channel)} target={channel.type === 'phone' || channel.type === 'email' ? undefined : '_blank'} rel={channel.type === 'phone' || channel.type === 'email' ? undefined : 'noopener noreferrer external'} className={className} aria-label={channelLabel(channel)}><span className={HOME_CONTACT_SECTION_ICON_WELL_CLASS}>{Icon != null ? <Icon className={MESSENGER_ICON_CLASS} aria-hidden="true" /> : <ContactMessengerLogo variant={channel.type === 'whatsapp' ? 'whatsapp' : channel.type === 'max' ? 'max' : channel.type === 'telegram' ? 'telegram' : 'phone'} className={MESSENGER_ICON_CLASS} />}</span></a>;
          })}
        </RevealBox>
      </div>
    </section>
  );
});

export default ContactSection;
