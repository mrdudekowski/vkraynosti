import { useLayoutEffect } from 'react';
import { useLenis } from 'lenis/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons/faArrowLeft';
import { faShieldHalved } from '@fortawesome/free-solid-svg-icons/faShieldHalved';
import { Link } from 'react-router-dom';
import { SAFETY_ITEMS } from '../data/safetyData';
import { SAFETY_ICON_MAP } from '../constants/safetyIcons';
import { UI } from '../constants/ui';
import { ROUTES } from '../constants/routes';
import { IMAGES } from '../constants/images';
import PageMeta from '../components/shared/PageMeta';
import ScrollScrubFade from '../components/shared/ScrollScrubFade';
import winterSafety from '../data/safety/winter.json';
import springSafety from '../data/safety/spring.json';
import summerSafety from '../data/safety/summer.json';
import fallSafety from '../data/safety/fall.json';
import { useSeason } from '../context/useSeason';
import type { Season } from '../types';
import { scrollWindowToTopSmooth } from '../constants/smoothScroll';

type SafetyOverrides = {
  id: string;
  summary: string;
  details: string;
};

const SEASON_SAFETY_OVERRIDES: Record<Season, SafetyOverrides[]> = {
  winter: winterSafety as SafetyOverrides[],
  spring: springSafety as SafetyOverrides[],
  summer: summerSafety as SafetyOverrides[],
  fall:   fallSafety as SafetyOverrides[],
};

const SafetyPage = () => {
  const lenis = useLenis();

  useLayoutEffect(() => {
    scrollWindowToTopSmooth(lenis);
  }, [lenis]);

  const { activeSeason } = useSeason();
  const overrides = SEASON_SAFETY_OVERRIDES[activeSeason] ?? [];
  const overrideById = new Map<string, SafetyOverrides>(
    overrides.map(item => [item.id, item])
  );

  const PLACEHOLDER_PREFIX = 'TODO';
  const isRealContent = (text: string) => text.length > 0 && !text.startsWith(PLACEHOLDER_PREFIX);

  const items = SAFETY_ITEMS.map(baseItem => {
    const seasonOverride = overrideById.get(baseItem.id);
    if (!seasonOverride) return baseItem;
    return {
      ...baseItem,
      summary: isRealContent(seasonOverride.summary) ? seasonOverride.summary : baseItem.summary,
      details: isRealContent(seasonOverride.details) ? seasonOverride.details : baseItem.details,
    };
  });

  return (
    <div className="bg-surface-light min-h-screen">
      <PageMeta
        title="Безопасность в наших походах | Вкрайности"
        description="Как мы обеспечиваем безопасность: профессиональное снаряжение, GPS-навигация, врач в каждой группе, спутниковая связь и план эвакуации."
        imageUrl={IMAGES.hero[activeSeason]}
        path={ROUTES.SAFETY}
      />
      {/* Hero */}
      <div className="bg-brand-primary py-20 px-4 text-center">
        <ScrollScrubFade as="h1" className="section-title text-text-inverse mb-3">
          {UI.sections.safety}
        </ScrollScrubFade>
        <p className="text-text-inverse/70 text-lg max-w-2xl mx-auto">{UI.sections.safetySub}</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link
          to={ROUTES.HOME}
          className="inline-flex items-center gap-2 text-text-muted hover:text-brand-primary text-sm mb-12 transition-colors duration-hover"
          prefetch="none"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          {UI.tourDetail.homeLink}
        </Link>

        <div className="flex flex-col gap-12">
          {items.map((item, idx) => (
            <div key={item.id}>
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center shrink-0">
                  <FontAwesomeIcon
                    icon={SAFETY_ICON_MAP[item.icon] ?? faShieldHalved}
                    className="text-brand-secondary text-2xl"
                  />
                </div>
                <div>
                  <h2 className="font-heading text-2xl font-normal text-text-primary mb-2">
                    {item.title}
                  </h2>
                  <p className="text-brand-primary font-medium text-sm mb-4">{item.summary}</p>
                  <p className="text-text-muted leading-relaxed">{item.details}</p>
                </div>
              </div>
              {idx < items.length - 1 && (
                <div className="mt-12 border-t border-divider" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SafetyPage;
