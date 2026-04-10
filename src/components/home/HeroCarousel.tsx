import { forwardRef, useCallback, useRef, type MutableRefObject, type Ref } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { useCarousel } from '../../hooks/useCarousel';
import CarouselSlide from '../shared/CarouselSlide';
import RevealBox from '../shared/RevealBox';
import ScrollScrubFade from '../shared/ScrollScrubFade';
import { UI } from '../../constants/ui';
import { heroCarouselPhraseTypographyStyle } from '../../constants/typography';
import { HOME_HERO_SECTION_ELEMENT_ID } from '../../constants/homeHeroSnap';
import { buildTourDetailPath } from '../../constants/routes';
import { getToursBySeason } from '../../data/toursData';
import { useSeason } from '../../context/useSeason';
import type { Season } from '../../types';

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
            <RevealBox
              as="div"
              className="flex w-full max-w-2xl mx-auto justify-center px-4 pb-24"
            >
              <Link
                to={buildTourDetailPath(tour.season, tour.id)}
                className="text-center group flex flex-col items-center gap-hero-phrase-cta-gap"
                tabIndex={idx === current ? 0 : -1}
                aria-label={`${tour.title}. ${UI.hero.viewTour}`}
                prefetch="intent"
              >
                <p
                  className="font-hero-carousel-phrase font-medium text-text-inverse/80 hero-carousel-phrase-text-shadow max-w-full"
                  style={heroCarouselPhraseTypographyStyle}
                >
                  {tour.heroPhrase}
                </p>
                <span className="btn-primary inline-block text-base shrink-0">{UI.hero.viewTour}</span>
              </Link>
            </RevealBox>
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
              idx === current ? 'bg-brand-secondary scale-125' : 'bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Слайд ${idx + 1}`}
          />
        ))}
      </div>
    </>
  );
}

const HeroCarousel = forwardRef<HTMLElement>(function HeroCarousel(_props, ref) {
  const { activeSeason } = useSeason();
  const sectionRef = useRef<HTMLElement | null>(null);

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
      className="relative z-home-hero isolate h-hero-viewport overflow-hidden bg-surface-dark"
    >
      <header className="absolute top-home-hero-title-top right-6 z-20 max-w-md pl-4 text-right">
        <ScrollScrubFade
          as="h1"
          className="font-brand-wordmark text-text-inverse text-section leading-tight drop-shadow-md"
        >
          {UI.hero.documentTitle}
        </ScrollScrubFade>
      </header>
      <HeroCarouselSlides key={activeSeason} activeSeason={activeSeason} />
    </section>
  );
});

export default HeroCarousel;
