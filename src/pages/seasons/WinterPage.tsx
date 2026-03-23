import TourCard from '../../components/shared/TourCard';
import SeasonPageLayout from '../../components/seasons/SeasonPageLayout';
import { getToursBySeason } from '../../data/toursData';
import { ROUTES } from '../../constants/routes';

const WinterPage = () => {
  const tours = getToursBySeason('winter');

  return (
    <SeasonPageLayout
      seasonKey="winter"
      metaTitle="Зимние туры — Байкал, Хибины, Алтай | Вкрайности"
      metaDescription="Зимние приключения в России: ледяные пещеры Байкала, фрирайд в Хибинах, экспедиции по Алтаю. Маршруты для любого уровня подготовки."
      metaPath={ROUTES.WINTER}
    >
      {tours.map((tour, index) => (
        <TourCard key={tour.id} tour={tour} priorityImage={index === 0} />
      ))}
    </SeasonPageLayout>
  );
};

export default WinterPage;
