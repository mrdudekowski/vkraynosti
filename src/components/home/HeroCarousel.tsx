import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { useCarousel } from '../../hooks/useCarousel';
import CarouselSlide from '../shared/CarouselSlide';
import { UI } from '../../constants/ui';
import { heroCarouselPhraseTypographyStyle } from '../../constants/typography';
import { buildTourDetailPath } from '../../constants/routes';
import { getToursBySeason } from '../../data/toursData';
import { useSeason } from '../../context/useSeason';
import type { Season } from '../../types';

/** Смонтирован с `key={activeSeason}` в родителе — сброс индекса слайда без setState в эффекте. */
function HeroCarouselSlides({ activeSeason }: { activeSeason: Season }) {
  const tours = getToursBySeason(activeSeason);
  const { current, next, prev, goTo } = useCarousel({
    total: tours.length,
    autoplayMs: UI.hero.autoplayIntervalMs,
  });

  return (
    <>
      {tours.map((tour, idx) => {
        return (
          <CarouselSlide key={tour.id} backgroundUrl={tour.imageUrl} isActive={idx === current}>
            <Link
              to={buildTourDetailPath(tour.season, tour.id)}
              className="text-center group flex flex-col items-center gap-hero-phrase-cta-gap pb-24 max-w-2xl mx-auto px-4"
              tabIndex={idx === current ? 0 : -1}
              aria-label={`${tour.title}. ${UI.hero.viewTour}`}
              prefetch="intent"
            >
              <span className="btn-primary inline-block text-base animate-fade-up shrink-0">
                {UI.hero.viewTour}
              </span>
              <p
                className="font-hero-carousel-phrase font-medium text-text-inverse/80 hero-carousel-phrase-text-shadow animate-fade-up max-w-full"
                style={heroCarouselPhraseTypographyStyle}
              >
                {tour.heroPhrase}
              </p>
            </Link>
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

const HeroCarousel = () => {
  const { activeSeason } = useSeason();

  return (
    <section className="relative h-hero-viewport overflow-hidden bg-surface-dark">
      <header className="absolute top-6 right-6 z-20 max-w-md pl-4 text-right space-y-2 animate-fade-up">
        <h1 className="font-brand-wordmark text-text-inverse text-section leading-tight drop-shadow-md">
          {UI.hero.documentTitle}
        </h1>
        <p className="font-heading font-bold text-xl text-brand-secondary drop-shadow-md">
          {UI.nav.brand}
        </p>
      </header>
      <HeroCarouselSlides key={activeSeason} activeSeason={activeSeason} />
    </section>
  );
};

export default HeroCarousel;
