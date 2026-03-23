import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import HeroCarousel from '../components/home/HeroCarousel';
import TeamCarousel from '../components/home/TeamCarousel';
import SafetySection from '../components/home/SafetySection';
import ContactSection from '../components/home/ContactSection';
import PageMeta from '../components/shared/PageMeta';
import RevealBox from '../components/shared/RevealBox';
import SeasonSwitcher from '../components/shared/SeasonSwitcher';
import TourCard from '../components/shared/TourCard';
import { IMAGES } from '../constants/images';
import { ROUTES } from '../constants/routes';
import { UI } from '../constants/ui';
import { getToursBySeason } from '../data/toursData';
import { useSeason } from '../context/useSeason';
import { SEASON_PAGE_BG_CLASS } from '../constants/seasonTheme';

const Home = () => {
  const location = useLocation();
  const { activeSeason } = useSeason();
  const tours = getToursBySeason(activeSeason);

  useLayoutEffect(() => {
    if (location.pathname !== ROUTES.HOME || !location.hash) return;
    const id = location.hash.slice(1);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [location.pathname, location.hash]);
  const seasonBgClass = SEASON_PAGE_BG_CLASS[activeSeason];
  const seasonSectionImage = IMAGES.seasonSection[activeSeason];
  const toursSectionTitle = UI.sections.toursTitleBySeason[activeSeason];
  return (
    <>
      <PageMeta
        title="Вкрайности — Туры по дикой природе России"
        description="Авторские туры по Алтаю, Байкалу, Камчатке и Кавказу. Зима, весна, лето, осень — четыре сезона приключений с опытными гидами."
        imageUrl={IMAGES.hero[activeSeason]}
        path={ROUTES.HOME}
        preloadHeroImageUrl={tours[0]?.imageUrl}
      />
      <HeroCarousel />

      <section id="tours" className="relative isolate pt-section-y pb-3">
        <div
          className={`absolute inset-0 -z-10 transition-colors duration-season-change ${seasonBgClass}`}
          aria-hidden
        />
        <RevealBox as="div" className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="section-title text-text-primary">{toursSectionTitle}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {tours.map((tour, index) => (
                <TourCard key={tour.id} tour={tour} priorityImage={index === 0} />
              ))}
            </div>
          </div>
        </RevealBox>
      </section>

      <section className="relative isolate overflow-hidden min-h-season-section h-season-section md:min-h-season-section-md md:h-season-section-md pt-8">
        <div
          className={`absolute inset-0 z-0 transition-colors duration-season-change ${seasonBgClass}`}
          aria-hidden
        />
        {seasonSectionImage && (
          <div
            key={activeSeason}
            className="absolute inset-0 z-10 bg-cover bg-center animate-bg-fade"
            style={{ backgroundImage: `url(${seasonSectionImage})` }}
          />
        )}
        <RevealBox as="div" className="relative z-20 h-full min-h-0">
          <div className="pl-3 xs:pl-4 sm:pl-6 lg:pl-8 pt-2 xs:pt-3 phone:pt-4 pb-2 xs:pb-3 phone:pb-4">
            <p className="font-heading text-sm font-normal tracking-widest uppercase text-text-inverse/80 mb-3">
              {UI.sections.switchSeason}
            </p>
            <SeasonSwitcher variant="section" />
          </div>
        </RevealBox>
      </section>

      <section className="relative isolate">
        <div
          className={`absolute inset-0 -z-10 transition-colors duration-season-change ${seasonBgClass}`}
          aria-hidden
        />
        <RevealBox as="div" className="relative z-10">
          <TeamCarousel />
        </RevealBox>
      </section>

      <div className="relative isolate w-full">
        <div className="absolute inset-0 -z-10 bg-brand-primary" aria-hidden />
        <RevealBox as="div" className="relative z-10 w-full">
          <SafetySection />
        </RevealBox>
      </div>
      <div className="relative isolate w-full">
        <div className="absolute inset-0 -z-10 bg-surface-dark" aria-hidden />
        <RevealBox as="div" className="relative z-10 w-full">
          <ContactSection />
        </RevealBox>
      </div>
    </>
  );
};

export default Home;
