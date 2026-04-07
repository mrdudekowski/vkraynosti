import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldHalved } from '@fortawesome/free-solid-svg-icons';
import { SAFETY_ITEMS } from '../../data/safetyData';
import { SAFETY_ICON_MAP } from '../../constants/safetyIcons';
import { UI } from '../../constants/ui';
import { ROUTES } from '../../constants/routes';

const SafetySection = () => (
  <section
    id="safety"
    className="relative isolate overflow-hidden bg-home-safety-section py-section-y text-text-inverse"
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="section-title text-text-inverse">{UI.sections.safety}</h2>
        <p className="text-text-inverse/70 mt-3">{UI.sections.safetySub}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {SAFETY_ITEMS.map(item => (
          <div
            key={item.id}
            className="bg-white/10 backdrop-blur-sm rounded-card p-card-p hover:bg-white/20 transition-all duration-hover"
          >
            <div className="w-12 h-12 bg-brand-secondary/20 rounded-full flex items-center justify-center mb-4">
              <FontAwesomeIcon
                icon={SAFETY_ICON_MAP[item.icon] ?? faShieldHalved}
                className="text-brand-secondary text-xl"
              />
            </div>
            <h3 className="font-heading font-normal text-lg mb-2">{item.title}</h3>
            <p className="text-text-inverse/70 text-sm leading-relaxed">{item.summary}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Link to={ROUTES.SAFETY} className="btn-ghost text-text-inverse" prefetch="intent">
          {UI.sections.safety_cta}
        </Link>
      </div>
    </div>
  </section>
);

export default SafetySection;
