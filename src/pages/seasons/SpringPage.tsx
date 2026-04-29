import TourCard from '../../components/shared/TourCard';
import SeasonPageLayout from '../../components/seasons/SeasonPageLayout';
import { getToursBySeason } from '../../data/toursData';
import { ROUTES } from '../../constants/routes';
import { getSeasonSeoEntry } from '../../constants/seo';

const SpringPage = () => {
  const tours = getToursBySeason('spring');
  const seoEntry = getSeasonSeoEntry('spring', ROUTES.SPRING);

  return (
    <SeasonPageLayout
      seasonKey="spring"
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

export default SpringPage;
