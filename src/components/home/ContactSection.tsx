import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone } from '@fortawesome/free-solid-svg-icons';
import { faTelegram, faVk } from '@fortawesome/free-brands-svg-icons';
import { UI } from '../../constants/ui';
import { CONTACTS } from '../../constants/contacts';
import { HOME_SECTION_CONTACT } from '../../constants/routes';

const ContactSection = () => (
  <section id={HOME_SECTION_CONTACT} className="py-section-y text-text-inverse">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 className="section-title text-text-inverse mb-4">{UI.sections.contact}</h2>
        <p className="text-text-inverse/60 mb-12 text-lg">
          {UI.contact.subtitle}
        </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
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
      </div>
    </div>
  </section>
);

export default ContactSection;
