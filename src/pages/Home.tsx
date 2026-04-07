import { useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useLenis } from 'lenis/react';
import HeroCarousel from '../components/home/HeroCarousel';
import HomeSeasonBanner from '../components/home/HomeSeasonBanner';
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
import { HOME_PAGE_SKY_BG_CLASS } from '../constants/seasonTheme';
import { NAVBAR_SCROLL_OFFSET_PX, scrollElementIntoViewAnchored } from '../constants/smoothScroll';
import { homeSeasonStripLabelColor } from '../constants/themeTextColors';
import { useHomeSeasonBannerWhiteVeil } from '../hooks/useHomeSeasonBannerWhiteVeil';

const Home = () => {
  const location = useLocation();
  const lenis = useLenis();
  const { activeSeason } = useSeason();
  const tours = getToursBySeason(activeSeason);
  const homeSeasonStripSectionRef = useRef<HTMLElement | null>(null);
  const homeTeamSectionRef = useRef<HTMLElement | null>(null);
  const { veilOpacity } = useHomeSeasonBannerWhiteVeil({
    seasonStripSectionRef: homeSeasonStripSectionRef,
    teamSectionRef: homeTeamSectionRef,
    enabled: true,
  });

  useLayoutEffect(() => {
    if (location.pathname !== ROUTES.HOME || !location.hash) return;
    const id = location.hash.slice(1);
    const el = document.getElementById(id);
    if (el) scrollElementIntoViewAnchored(lenis, el, NAVBAR_SCROLL_OFFSET_PX);
  }, [location.pathname, location.hash, lenis]);
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

      <div className="relative isolate flex w-full flex-col overflow-hidden">
        <div
          className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${HOME_PAGE_SKY_BG_CLASS[activeSeason]}`}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 z-home-season-banner-veil bg-home-season-banner-veil transition-opacity duration-home-season-banner-veil ease-out"
          style={{ opacity: veilOpacity }}
          aria-hidden
        />

        <div className="relative z-10 flex w-full flex-col">
          <section id="tours" className="pt-home-section-top pb-home-stack-gap">
            <RevealBox as="div" className="relative">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <h2 className="section-title text-text-primary">{toursSectionTitle}</h2>
                </div>
                <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {tours.map((tour, index) => (
                    <TourCard key={tour.id} tour={tour} priorityImage={index === 0} />
                  ))}
                </div>
              </div>
            </RevealBox>
          </section>

          <section
            ref={homeSeasonStripSectionRef}
            className="flex w-full flex-col overflow-hidden pt-home-season-strip-pt"
          >
            <div className="relative w-full shrink-0">
              <HomeSeasonBanner season={activeSeason} />
            </div>
            <RevealBox
              as="div"
              className="relative z-20 w-full shrink-0 pt-home-season-banner-foot-gap pb-home-season-banner-foot-gap"
            >
              <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-home-season-banner-foot-gap px-4 sm:px-6 lg:px-8">
                <p
                  className="text-center font-heading text-home-season-strip-label font-normal uppercase transition-colors duration-home-season-banner-veil ease-out"
                  style={{ color: homeSeasonStripLabelColor(veilOpacity) }}
                >
                  {UI.sections.switchSeason}
                </p>
                <SeasonSwitcher variant="section" />
              </div>
            </RevealBox>
            <RevealBox as="div" className="relative z-10 w-full">
              <TeamCarousel ref={homeTeamSectionRef} />
            </RevealBox>
          </section>

          <RevealBox as="div" className="relative w-full">
            <SafetySection />
          </RevealBox>
          <RevealBox as="div" className="relative w-full">
            <ContactSection />
          </RevealBox>
        </div>
      </div>
    </>
  );
};

export default Home;
