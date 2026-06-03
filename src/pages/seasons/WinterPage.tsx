import { useMemo } from 'react';
import TourCard from '../../components/shared/TourCard';
import SeasonPageLayout from '../../components/seasons/SeasonPageLayout';
import { ROUTES } from '../../constants/routes';
import { getSeasonSeoEntry } from '../../constants/seo';
import { useTourSchedule } from '../../hooks/useTourSchedule';
import { sortToursInDevelopmentLast } from '../../utils/sortToursInDevelopmentLast';
import { getVisibleToursBySeason } from '../../utils/tourSchedule/getVisibleToursBySeason';

const WinterPage = () => {
  const { publicationStatuses } = useTourSchedule();
  const tours = useMemo(
    () =>
      sortToursInDevelopmentLast(
        getVisibleToursBySeason('winter', publicationStatuses),
        publicationStatuses,
      ),
    [publicationStatuses],
  );
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
