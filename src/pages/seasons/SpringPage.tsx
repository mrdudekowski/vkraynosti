import TourCard from '../../components/shared/TourCard';
import SeasonPageLayout from '../../components/seasons/SeasonPageLayout';
import { getToursBySeason } from '../../data/toursData';
import { ROUTES } from '../../constants/routes';

const SpringPage = () => {
  const tours = getToursBySeason('spring');

  return (
    <SeasonPageLayout
      seasonKey="spring"
      metaTitle="Весенние туры — Алтай, Камчатка, Байкал | Вкрайности"
      metaDescription="Весна в России: цветение маральника на Алтае, вулканы Камчатки, ледоход на Байкале. Маршруты на любой уровень от лёгких до сложных."
      metaPath={ROUTES.SPRING}
    >
      {tours.map((tour, index) => (
        <TourCard key={tour.id} tour={tour} priorityImage={index === 0} />
      ))}
    </SeasonPageLayout>
  );
};

export default SpringPage;
