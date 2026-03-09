import HeroCarousel from '../components/home/HeroCarousel';
import SeasonGrid from '../components/home/SeasonGrid';
import TeamCarousel from '../components/home/TeamCarousel';
import SafetySection from '../components/home/SafetySection';
import ContactSection from '../components/home/ContactSection';
import PageMeta from '../components/shared/PageMeta';
import { IMAGES } from '../constants/images';
import { ROUTES } from '../constants/routes';

const Home = () => (
  <>
    <PageMeta
      title="Вкрайности — Туры по дикой природе России"
      description="Авторские туры по Алтаю, Байкалу, Камчатке и Кавказу. Зима, весна, лето, осень — четыре сезона приключений с опытными гидами."
      imageUrl={IMAGES.hero.summer}
      path={ROUTES.HOME}
    />
    <HeroCarousel />
    <SeasonGrid />
    <TeamCarousel />
    <SafetySection />
    <ContactSection />
  </>
);

export default Home;
