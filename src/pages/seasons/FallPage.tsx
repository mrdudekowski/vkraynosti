import TourCard from '../../components/shared/TourCard';
import SeasonPageLayout from '../../components/seasons/SeasonPageLayout';
import { getToursBySeason } from '../../data/toursData';
import { ROUTES } from '../../constants/routes';

const FallPage = () => {
  const tours = getToursBySeason('fall');

  return (
    <SeasonPageLayout
      seasonKey="fall"
      metaTitle="Осенние туры — Алтай, Карелия, Кавказ | Вкрайности"
      metaDescription="Осень в России: золото лиственниц Алтая, грибные леса Карелии, горные сёла Кавказа. Самое живописное время года для походов."
      metaPath={ROUTES.FALL}
    >
      {tours.map((tour, index) => (
        <TourCard key={tour.id} tour={tour} priorityImage={index === 0} />
      ))}
    </SeasonPageLayout>
  );
};

export default FallPage;
