import { useMemo } from 'react';
import TourCard from '../../components/shared/TourCard';
import SeasonPageLayout from '../../components/seasons/SeasonPageLayout';
import { ROUTES } from '../../constants/routes';
import { getSeasonSeoEntry } from '../../constants/seo';
import { useTourSchedule } from '../../hooks/useTourSchedule';
import { sortToursInDevelopmentLast } from '../../utils/sortToursInDevelopmentLast';
import { getVisibleToursBySeason } from '../../utils/tourSchedule/getVisibleToursBySeason';

const SummerPage = () => {
  const { publicationStatuses } = useTourSchedule();
  const tours = useMemo(
    () =>
      sortToursInDevelopmentLast(
        getVisibleToursBySeason('summer', publicationStatuses),
        publicationStatuses,
      ),
    [publicationStatuses],
  );
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
