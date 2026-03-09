import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { useCarousel } from '../../hooks/useCarousel';
import { useModal } from '../../context/ModalContext';
import CarouselSlide from '../shared/CarouselSlide';
import { IMAGES } from '../../constants/images';
import { UI } from '../../constants/ui';
import { ROUTES } from '../../constants/routes';
import type { Season } from '../../types';

const SLIDES: Array<{ season: Season; route: string; imageUrl: string }> = [
  { season: 'winter', route: ROUTES.WINTER, imageUrl: IMAGES.hero.winter },
  { season: 'spring', route: ROUTES.SPRING, imageUrl: IMAGES.hero.spring },
  { season: 'summer', route: ROUTES.SUMMER, imageUrl: IMAGES.hero.summer },
  { season: 'fall',   route: ROUTES.FALL,   imageUrl: IMAGES.hero.fall   },
];

const HeroCarousel = () => {
  const { current, next, prev, goTo } = useCarousel({ total: SLIDES.length, autoplayMs: 5000 });
  const { openConsultModal } = useModal();

  return (
    <section className="relative h-screen overflow-hidden bg-surface-dark">
      {SLIDES.map((slide, idx) => {
        const season = UI.seasons[slide.season];
        return (
          <CarouselSlide key={slide.season} backgroundUrl={slide.imageUrl} isActive={idx === current}>
            <Link
              to={slide.route}
              className="text-center group block"
              tabIndex={idx === current ? 0 : -1}
            >
              <p className="text-brand-secondary text-lg font-semibold mb-2 animate-slide-in">
                {season.emoji} {season.label}
              </p>
              <h1 className="text-hero font-display font-bold text-text-inverse mb-4 animate-fade-up group-hover:text-brand-secondary transition-colors duration-hover">
                {UI.nav.brand}
              </h1>
              <p className="text-text-inverse/80 text-xl mb-8 animate-fade-up">
                {UI.hero.subtitle}
              </p>
            </Link>
            <button
              onClick={openConsultModal}
              className="btn-primary text-lg px-8 py-4"
              tabIndex={idx === current ? 0 : -1}
            >
              {UI.hero.cta}
            </button>
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
        {SLIDES.map((_, idx) => (
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
