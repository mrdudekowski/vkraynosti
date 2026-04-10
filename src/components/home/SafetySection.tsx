import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldHalved } from '@fortawesome/free-solid-svg-icons';
import { SAFETY_ITEMS } from '../../data/safetyData';
import { SAFETY_ICON_MAP } from '../../constants/safetyIcons';
import { HOME_SAFETY_SECTION_HERO_IMAGE } from '../../constants/images';
import RevealBox from '../shared/RevealBox';
import ScrollScrubFade from '../shared/ScrollScrubFade';
import { UI } from '../../constants/ui';
import { ROUTES } from '../../constants/routes';

const SafetySection = () => (
  <section
    id="safety"
    className="relative isolate overflow-hidden py-section-y text-text-primary"
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10 lg:mb-12">
        <ScrollScrubFade as="h2" className="section-title text-text-primary">
          {UI.sections.safety}
        </ScrollScrubFade>
        <RevealBox as="div" className="mt-3 max-w-2xl mx-auto">
          <p className="text-text-muted">{UI.sections.safetySub}</p>
        </RevealBox>
      </div>

      <RevealBox
        as="div"
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 mb-12 items-stretch"
      >
        <div className="relative overflow-hidden rounded-card isolate min-h-home-safety-hero motion-safe:animate-fade-up">
          <img
            src={HOME_SAFETY_SECTION_HERO_IMAGE}
            alt={UI.sections.safetyHeroImageAlt}
            className="absolute inset-0 z-0 size-full object-cover"
            width={900}
            height={600}
            decoding="async"
            loading="lazy"
          />
          <div
            className="absolute inset-0 z-stack-base bg-gradient-to-t from-surface-dark/92 via-surface-dark/45 to-surface-dark/10"
            aria-hidden
          />
          <div className="relative z-10 flex min-h-home-safety-hero flex-col justify-end p-card-p">
            <p className="font-heading font-normal text-lg sm:text-xl text-text-inverse leading-snug max-w-prose text-pretty">
              {UI.sections.safetyHeroHighlight}
            </p>
          </div>
        </div>

        <ul className="flex flex-col gap-0 rounded-card border border-divider bg-white/80 shadow-md backdrop-blur-sm divide-y divide-divider motion-safe:animate-fade-up">
          {SAFETY_ITEMS.map(item => (
            <li
              key={item.id}
              className="flex gap-4 p-card-p motion-safe:transition-colors motion-safe:duration-hover motion-safe:hover:bg-text-primary/5"
            >
              <div
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-secondary/25"
                aria-hidden
              >
                <FontAwesomeIcon
                  icon={SAFETY_ICON_MAP[item.icon] ?? faShieldHalved}
                  className="text-brand-secondary text-lg"
                />
              </div>
              <div className="min-w-0">
                <h3 className="font-heading font-normal text-base text-text-primary mb-1">
                  {item.title}
                </h3>
                <p className="text-text-muted text-sm leading-relaxed">{item.summary}</p>
              </div>
            </li>
          ))}
        </ul>
      </RevealBox>

      <RevealBox as="div" className="text-center">
        <Link to={ROUTES.SAFETY} className="btn-ghost text-text-primary" prefetch="intent">
          {UI.sections.safety_cta}
        </Link>
      </RevealBox>
    </div>
  </section>
);

export default SafetySection;
