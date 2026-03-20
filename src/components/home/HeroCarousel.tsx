import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { useCarousel } from '../../hooks/useCarousel';
import CarouselSlide from '../shared/CarouselSlide';
import { UI } from '../../constants/ui';
import { buildTourDetailPath } from '../../constants/routes';
import { getToursBySeason } from '../../data/toursData';
import { useSeason } from '../../context/SeasonContext';

const HeroCarousel = () => {
  const { activeSeason } = useSeason();
  const tours = getToursBySeason(activeSeason);
  const { current, next, prev, goTo } = useCarousel({
    total: tours.length,
    autoplayMs: UI.hero.autoplayIntervalMs,
    resetKey: activeSeason,
  });

  // #region agent log
  fetch('http://127.0.0.1:7797/ingest/43b5f5d9-745f-43fc-b1e5-79ca29b85a5b', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '5b4664' },
    body: JSON.stringify({
      sessionId: '5b4664',
      location: 'HeroCarousel.tsx:afterHooks',
      message: 'HeroCarousel render after hooks',
      data: { tours: tours.length, current },
      timestamp: Date.now(),
      hypothesisId: 'H1',
    }),
  }).catch(() => {});
  // #endregion

  return (
    <section className="relative h-screen overflow-hidden bg-surface-dark">
      <header className="absolute top-6 right-6 z-20 max-w-md pl-4 text-right space-y-2 animate-fade-up">
        <h1 className="font-display font-bold text-text-inverse text-section leading-tight drop-shadow-md">
          {UI.hero.documentTitle}
        </h1>
        <p className="font-display text-xl font-bold text-brand-secondary drop-shadow-md">
          {UI.nav.brand}
        </p>
      </header>
      {tours.map((tour, idx) => {
        return (
          <CarouselSlide key={tour.id} backgroundUrl={tour.imageUrl} isActive={idx === current}>
            <Link
              to={buildTourDetailPath(tour.season, tour.id)}
              className="text-center group block pb-24 max-w-2xl mx-auto px-4"
              tabIndex={idx === current ? 0 : -1}
              aria-label={`${tour.title}. ${UI.hero.viewTour}`}
            >
              <p className="text-text-inverse/80 text-xl mb-6 animate-fade-up">
                {tour.heroPhrase}
              </p>
              <span className="btn-primary inline-block text-base animate-fade-up">
                {UI.hero.viewTour}
              </span>
            </Link>
          </CarouselSlide>
        );
      })}

      {/* Arrows */}
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

      {/* Dots */}
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
    </section>
  );
};

export default HeroCarousel;
