import { forwardRef, memo, useCallback, useRef, type MutableRefObject, type Ref } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons/faChevronLeft';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight';
import { useCarousel } from '../../hooks/useCarousel';
import { useScrollScrubFade } from '../../hooks/useScrollScrubFade';
import CarouselSlide from '../shared/CarouselSlide';
import { UI } from '../../constants/ui';
import { HOME_HERO_SECTION_ELEMENT_ID } from '../../constants/homeHeroSnap';
import { buildTourDetailPath } from '../../constants/routes';
import { getToursBySeason } from '../../data/toursData';
import { useSeason } from '../../context/useSeason';
import type { Season } from '../../types';

const HERO_PAGINATION_ACTIVE_DOT_CLASS: Record<Season, string> = {
  winter: 'bg-season-winter',
  spring: 'bg-season-spring',
  summer: 'bg-season-summer',
  fall: 'bg-season-fall',
};

const HERO_PAGINATION_INACTIVE_DOT_HOVER_CLASS: Record<Season, string> = {
  winter: 'hover:bg-season-winter/80',
  spring: 'hover:bg-season-spring/80',
  summer: 'hover:bg-season-summer/80',
  fall: 'hover:bg-season-fall/80',
};

function assignRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (ref == null) return;
  if (typeof ref === 'function') {
    ref(value);
  } else {
    (ref as MutableRefObject<T | null>).current = value;
  }
}

/** Смонтирован с `key={activeSeason}` в родителе — сброс индекса слайда без setState в эффекте. */
function HeroCarouselSlides({ activeSeason }: { activeSeason: Season }) {
  const tours = getToursBySeason(activeSeason);
  const { current, next, prev, goTo, visitedSlideIndices } = useCarousel({
    total: tours.length,
    autoplayMs: UI.hero.autoplayIntervalMs,
  });

  return (
    <>
      {tours.map((tour, idx) => {
        const isActive = idx === current;
        const shouldLoadBackground = visitedSlideIndices.has(idx);
        return (
          <CarouselSlide
            key={tour.id}
            backgroundUrl={tour.imageUrl}
            isActive={isActive}
            shouldLoadBackground={shouldLoadBackground}
          >
            <div className="flex w-full max-w-home-hero-phrase mx-auto justify-center px-home-hero-carousel-text-gutter-x pb-24 md:px-4">
              <Link
                to={buildTourDetailPath(tour.season, tour.id)}
                className="text-center group flex min-w-0 w-full max-w-full flex-col items-center gap-hero-phrase-cta-gap"
                tabIndex={idx === current ? 0 : -1}
                aria-label={`${tour.title}. ${UI.hero.viewTour}`}
                prefetch="intent"
              >
                <p
                  className="font-hero-carousel-phrase text-home-hero-carousel-phrase font-normal text-text-inverse hero-carousel-phrase-text-shadow w-full min-w-0 max-w-full text-pretty break-words hyphens-auto"
                >
                  {tour.heroPhrase}
                </p>
                <span className="btn-primary inline-block text-base shrink-0">{UI.hero.viewTour}</span>
              </Link>
            </div>
          </CarouselSlide>
        );
      })}

      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all duration-hover"
        aria-label="Предыдущий"
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all duration-hover"
        aria-label="Следующий"
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {tours.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-hover ${
              idx === current
                ? `${HERO_PAGINATION_ACTIVE_DOT_CLASS[activeSeason]} scale-125`
                : `bg-white/50 ${HERO_PAGINATION_INACTIVE_DOT_HOVER_CLASS[activeSeason]}`
            }`}
            aria-label={`Слайд ${idx + 1}`}
          />
        ))}
      </div>
    </>
  );
}

const HeroCarouselInner = forwardRef<HTMLElement>(function HeroCarousel(_props, ref) {
  const { activeSeason } = useSeason();
  const sectionRef = useRef<HTMLElement | null>(null);
  const { ref: heroContentFadeRef } = useScrollScrubFade();

  const setSectionRef = useCallback(
    (node: HTMLElement | null) => {
      sectionRef.current = node;
      assignRef(ref, node);
    },
    [ref]
  );

  return (
    <section
      ref={setSectionRef}
      id={HOME_HERO_SECTION_ELEMENT_ID}
      className="relative z-home-hero isolate h-hero-viewport overflow-hidden bg-home-gate-start-screen"
    >
      <div ref={heroContentFadeRef} className="absolute inset-0 z-10 transition-none">
        <header className="absolute top-home-hero-title-top right-6 z-20 max-w-md pl-4 text-right">
          <h1 className="font-hero-heading text-text-inverse text-home-hero-document-title drop-shadow-md">
            {UI.hero.documentTitle}
          </h1>
        </header>
        <HeroCarouselSlides key={activeSeason} activeSeason={activeSeason} />
      </div>
    </section>
  );
});

const HeroCarousel = memo(HeroCarouselInner);

export default HeroCarousel;
