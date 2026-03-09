import TourCard from '../../components/shared/TourCard';
import { getToursBySeason } from '../../data/toursData';
import { UI } from '../../constants/ui';
import { IMAGES } from '../../constants/images';

const SpringPage = () => {
  const tours = getToursBySeason('spring');
  const season = UI.seasons.spring;

  return (
    <div>
      <div
        className="h-72 bg-cover bg-center flex items-end"
        style={{ backgroundImage: `url(${IMAGES.hero.spring})` }}
      >
        <div className="w-full bg-gradient-to-t from-black/70 to-transparent px-8 pb-8">
          <p className="text-4xl mb-2">{season.emoji}</p>
          <h1 className="font-display text-section font-bold text-white">{season.label}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {tours.map(tour => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpringPage;
