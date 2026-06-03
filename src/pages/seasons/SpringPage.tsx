import { useMemo } from 'react';
import TourCard from '../../components/shared/TourCard';
import SeasonPageLayout from '../../components/seasons/SeasonPageLayout';
import { ROUTES } from '../../constants/routes';
import { getSeasonSeoEntry } from '../../constants/seo';
import { useTourSchedule } from '../../hooks/useTourSchedule';
import { sortToursInDevelopmentLast } from '../../utils/sortToursInDevelopmentLast';
import { getVisibleToursBySeason } from '../../utils/tourSchedule/getVisibleToursBySeason';

const SpringPage = () => {
  const { publicationStatuses } = useTourSchedule();
  const tours = useMemo(
    () =>
      sortToursInDevelopmentLast(
        getVisibleToursBySeason('spring', publicationStatuses),
        publicationStatuses,
      ),
    [publicationStatuses],
  );
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
