import TourCard from '../../components/shared/TourCard';
import SeasonPageLayout from '../../components/seasons/SeasonPageLayout';
import { getToursBySeason } from '../../data/toursData';
import { ROUTES } from '../../constants/routes';

const SummerPage = () => {
  const tours = getToursBySeason('summer');

  return (
    <SeasonPageLayout
      seasonKey="summer"
      metaTitle="Летние туры — Вулканы, тропы, сплавы | Вкрайности"
      metaDescription="Лето в дикой природе России: вулканы Камчатки, Большая Байкальская тропа, плато Укок на Алтае, сплавы по Карелии."
      metaPath={ROUTES.SUMMER}
    >
      {tours.map(tour => (
        <TourCard key={tour.id} tour={tour} />
      ))}
    </SeasonPageLayout>
  );
};

export default SummerPage;
