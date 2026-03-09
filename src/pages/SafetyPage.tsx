import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShieldHalved, faMap, faKitMedical, faCloudSun, faSatelliteDish, faHelicopter, faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { Link } from 'react-router-dom';
import { SAFETY_ITEMS } from '../data/safetyData';
import { UI } from '../constants/ui';
import { ROUTES } from '../constants/routes';
import { IMAGES } from '../constants/images';
import PageMeta from '../components/shared/PageMeta';

const ICON_MAP: Record<string, IconDefinition> = {
  'shield-halved':  faShieldHalved,
  'map':            faMap,
  'kit-medical':    faKitMedical,
  'cloud-sun':      faCloudSun,
  'satellite-dish': faSatelliteDish,
  'helicopter':     faHelicopter,
};

const SafetyPage = () => (
  <div className="bg-surface-light min-h-screen">
    <PageMeta
      title="Безопасность в наших походах | Вкрайности"
      description="Как мы обеспечиваем безопасность: профессиональное снаряжение, GPS-навигация, врач в каждой группе, спутниковая связь и план эвакуации."
      imageUrl={IMAGES.hero.summer}
      path={ROUTES.SAFETY}
    />
    {/* Hero */}
    <div className="bg-brand-primary py-20 px-4 text-center">
      <h1 className="section-title text-text-inverse mb-3">{UI.sections.safety}</h1>
      <p className="text-text-inverse/70 text-lg max-w-2xl mx-auto">{UI.sections.safetySub}</p>
    </div>

    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link
        to={ROUTES.HOME}
        className="inline-flex items-center gap-2 text-text-muted hover:text-brand-primary text-sm mb-12 transition-colors duration-hover"
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        На главную
      </Link>

      <div className="flex flex-col gap-12">
        {SAFETY_ITEMS.map((item, idx) => (
          <div key={item.id}>
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center shrink-0">
                <FontAwesomeIcon
                  icon={ICON_MAP[item.icon] ?? faShieldHalved}
                  className="text-brand-secondary text-2xl"
                />
              </div>
              <div>
                <h2 className="font-display text-2xl font-semibold text-text-primary mb-2">
                  {item.title}
                </h2>
                <p className="text-brand-primary font-medium text-sm mb-4">{item.summary}</p>
                <p className="text-text-muted leading-relaxed">{item.details}</p>
              </div>
            </div>
            {idx < SAFETY_ITEMS.length - 1 && (
              <div className="mt-12 border-t border-gray-200" />
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default SafetyPage;
