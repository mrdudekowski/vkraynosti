import TourCard from '../../components/shared/TourCard';
import SeasonPageLayout from '../../components/seasons/SeasonPageLayout';
import { getToursBySeason } from '../../data/toursData';
import { ROUTES } from '../../constants/routes';
import { getSeasonSeoEntry } from '../../constants/seo';

const SummerPage = () => {
  const tours = getToursBySeason('summer');
  const seoEntry = getSeasonSeoEntry('summer', ROUTES.SUMMER);

  return (
    <SeasonPageLayout
      seasonKey="summer"
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

export default SummerPage;
