import TourCard from '../../components/shared/TourCard';
import SeasonPageLayout from '../../components/seasons/SeasonPageLayout';
import { getToursBySeason } from '../../data/toursData';
import { ROUTES } from '../../constants/routes';
import { getSeasonSeoEntry } from '../../constants/seo';

const WinterPage = () => {
  const tours = getToursBySeason('winter');
  const seoEntry = getSeasonSeoEntry('winter', ROUTES.WINTER);

  return (
    <SeasonPageLayout
      seasonKey="winter"
      metaTitle={seoEntry.title}
      metaDescription={seoEntry.description}
      metaPath={seoEntry.path}
    >
      {tours.map((tour, index) => (
        <TourCard key={tour.id} tour={tour} priorityImage={index === 0} />
      ))}
    </SeasonPageLayout>
  );
};

export default WinterPage;
