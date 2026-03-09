import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faTelegram, faVk } from '@fortawesome/free-brands-svg-icons';
import { UI } from '../../constants/ui';
import { CONTACTS } from '../../constants/contacts';
import { ROUTES } from '../../constants/routes';

const Footer = () => (
  <footer className="bg-surface-dark text-text-inverse">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Brand */}
        <div>
          <Link
            to={ROUTES.HOME}
            className="font-display text-2xl font-bold text-text-inverse hover:text-brand-secondary transition-colors duration-hover"
          >
            {UI.nav.brand}
          </Link>
          <p className="mt-3 text-text-inverse/60 text-sm leading-relaxed">
            {UI.footer.tagline}
          </p>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="font-semibold text-text-inverse mb-4">Навигация</h4>
          <ul className="flex flex-col gap-2">
            {UI.nav.links.map(link => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-text-inverse/60 hover:text-brand-secondary transition-colors duration-hover text-sm"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                to={ROUTES.WINTER}
                className="text-text-inverse/60 hover:text-season-winter transition-colors duration-hover text-sm"
              >
                {UI.seasons.winter.emoji} {UI.seasons.winter.label}
              </Link>
            </li>
            <li>
              <Link
                to={ROUTES.SPRING}
                className="text-text-inverse/60 hover:text-season-spring transition-colors duration-hover text-sm"
              >
                {UI.seasons.spring.emoji} {UI.seasons.spring.label}
              </Link>
            </li>
            <li>
              <Link
                to={ROUTES.SUMMER}
                className="text-text-inverse/60 hover:text-season-summer transition-colors duration-hover text-sm"
              >
                {UI.seasons.summer.emoji} {UI.seasons.summer.label}
              </Link>
            </li>
            <li>
              <Link
                to={ROUTES.FALL}
                className="text-text-inverse/60 hover:text-season-fall transition-colors duration-hover text-sm"
              >
                {UI.seasons.fall.emoji} {UI.seasons.fall.label}
              </Link>
            </li>
          </ul>
        </div>

        {/* Contacts */}
        <div>
          <h4 className="font-semibold text-text-inverse mb-4">Контакты</h4>
          <div className="flex flex-col gap-3">
            <a
              href={CONTACTS.PHONE_HREF}
              className="flex items-center gap-3 text-text-inverse/60 hover:text-brand-secondary transition-colors duration-hover text-sm"
            >
              <FontAwesomeIcon icon={faPhone} className="w-4 h-4" />
              {CONTACTS.PHONE_NUMBER}
            </a>
            <a
              href={`mailto:${CONTACTS.EMAIL}`}
              className="flex items-center gap-3 text-text-inverse/60 hover:text-brand-secondary transition-colors duration-hover text-sm"
            >
              <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4" />
              {CONTACTS.EMAIL}
            </a>
            <a
              href={CONTACTS.TELEGRAM_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-text-inverse/60 hover:text-blue-400 transition-colors duration-hover text-sm"
            >
              <FontAwesomeIcon icon={faTelegram} className="w-4 h-4" />
              {CONTACTS.TELEGRAM_HANDLE}
            </a>
            <a
              href={CONTACTS.MAX_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-text-inverse/60 hover:text-blue-500 transition-colors duration-hover text-sm"
            >
              <FontAwesomeIcon icon={faVk} className="w-4 h-4" />
              VK Max
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-text-inverse/40 text-sm">{UI.footer.rights}</p>
        <button className="text-text-inverse/40 hover:text-text-inverse text-sm transition-colors duration-hover">
          {UI.footer.privacy}
        </button>
      </div>
    </div>
  </footer>
);

export default Footer;
