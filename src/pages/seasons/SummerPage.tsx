import TourCard from '../../components/shared/TourCard';
import SeasonPageLayout from '../../components/seasons/SeasonPageLayout';
import { ROUTES } from '../../constants/routes';
import { getSeasonSeoEntry } from '../../constants/seo';
import { useVisibleToursBySeason } from '../../hooks/useVisibleToursBySeason';
import { useSiteSeoPage } from '../../context/SiteContentContext';

const SummerPage = () => {
  const { tours } = useVisibleToursBySeason('summer');
  const seoEntry = getSeasonSeoEntry('summer', ROUTES.SUMMER);
  const pageSeo = useSiteSeoPage('summer');

  return (
    <SeasonPageLayout
      seasonKey="summer"
      metaTitle={pageSeo?.title?.trim() || seoEntry.title}
      metaDescription={pageSeo?.description?.trim() || seoEntry.description}
      metaPath={seoEntry.path}
      heading={pageSeo?.h1?.trim()}
      keywords={pageSeo?.keywords}
    >
      {tours.map((tour, index) => (
        <TourCard key={tour.id} tour={tour} priorityImage={index === 0} />
      ))}
    </SeasonPageLayout>
  );
};

export default SummerPage;
