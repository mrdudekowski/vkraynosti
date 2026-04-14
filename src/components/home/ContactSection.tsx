import { forwardRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone } from '@fortawesome/free-solid-svg-icons/faPhone';
import { faTelegram } from '@fortawesome/free-brands-svg-icons/faTelegram';
import { faVk } from '@fortawesome/free-brands-svg-icons/faVk';
import { VKRAI_FOREST_LOGO } from '../../constants/images';
import RevealBox from '../shared/RevealBox';
import ScrollScrubFade from '../shared/ScrollScrubFade';
import { UI } from '../../constants/ui';
import { CONTACTS } from '../../constants/contacts';
import { HOME_SECTION_CONTACT } from '../../constants/routes';

const ContactSection = forwardRef<HTMLElement>(function ContactSection(_, ref) {
  return (
  <section
    ref={ref}
    id={HOME_SECTION_CONTACT}
    className="relative isolate overflow-hidden py-section-y text-text-inverse"
  >
    <div
      className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center"
      aria-hidden
    >
      <div className="relative w-full max-w-contact-section-mark px-4 sm:px-6 lg:px-8">
        <img
          src={VKRAI_FOREST_LOGO}
          alt=""
          className="h-auto w-full object-contain object-bottom opacity-35"
          decoding="async"
          loading="lazy"
        />
      </div>
    </div>

    <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <ScrollScrubFade as="h2" className="section-title text-text-inverse mb-4">
        {UI.sections.contact}
      </ScrollScrubFade>
      <RevealBox as="div" className="mb-12">
        <p className="text-text-inverse/60 text-lg">{UI.contact.subtitle}</p>
      </RevealBox>

      <RevealBox as="div" className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
        <a
          href={CONTACTS.PHONE_HREF}
          className="btn-primary flex items-center justify-center gap-3"
        >
          <FontAwesomeIcon icon={faPhone} />
          {UI.contact.phone}
        </a>

        <a
          href={CONTACTS.TELEGRAM_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost text-text-inverse flex items-center justify-center gap-3"
        >
          <FontAwesomeIcon icon={faTelegram} />
          {UI.contact.telegram}
        </a>

        <a
          href={CONTACTS.MAX_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost text-text-inverse flex items-center justify-center gap-3"
        >
          <FontAwesomeIcon icon={faVk} />
          {UI.contact.max}
        </a>
      </RevealBox>
    </div>
  </section>
  );
});

export default ContactSection;
