import { Link } from 'react-router-dom';
import { UI } from '../../constants/ui';
import { IMAGES } from '../../constants/images';
import { ROUTES } from '../../constants/routes';
import type { Season } from '../../types';

const SEASON_CONFIG: Array<{ season: Season; route: string; imageUrl: string }> = [
  { season: 'winter', route: ROUTES.WINTER, imageUrl: IMAGES.hero.winter },
  { season: 'spring', route: ROUTES.SPRING, imageUrl: IMAGES.hero.spring },
  { season: 'summer', route: ROUTES.SUMMER, imageUrl: IMAGES.hero.summer },
  { season: 'fall',   route: ROUTES.FALL,   imageUrl: IMAGES.hero.fall   },
];

const SEASON_ACCENT: Record<Season, string> = {
  winter: 'bg-season-winter',
  spring: 'bg-season-spring',
  summer: 'bg-season-summer',
  fall:   'bg-season-fall',
};

const SeasonGrid = () => (
  <section id="tours" className="py-section-y bg-surface-light">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="section-title text-text-primary">{UI.sections.tours}</h2>
        <p className="text-text-muted mt-3">{UI.sections.toursSub}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {SEASON_CONFIG.map(({ season, route, imageUrl }) => {
          const s = UI.seasons[season];
          return (
            <Link
              key={season}
              to={route}
              className="group relative h-72 rounded-card overflow-hidden shadow-md hover:shadow-xl transition-all duration-hover hover:-translate-y-1 block"
            >
              <img
                src={imageUrl}
                alt={s.label}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-carousel group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Season accent bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${SEASON_ACCENT[season]}`} />

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-3xl mb-1">{s.emoji}</p>
                <h3 className="font-display text-2xl font-bold text-white mb-1">{s.label}</h3>
                <p className="text-white/70 text-sm">{s.description}</p>
              </div>

              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-hover">
                <span className="bg-brand-secondary text-surface-dark text-xs font-semibold px-3 py-1 rounded-full">
                  Смотреть туры →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  </section>
);

export default SeasonGrid;
