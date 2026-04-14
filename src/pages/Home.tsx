import { lazy, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { HomeGateBannerShell } from '../components/home/HomeGateBannerShell';
import { HomeGateScrollToHeroLink } from '../components/home/HomeGateScrollToHeroLink';
import HeroCarousel from '../components/home/HeroCarousel';
import HomeSeasonBanner from '../components/home/HomeSeasonBanner';
import HomeBelowFoldSuspenseFallback from '../components/home/HomeBelowFoldSuspenseFallback';
import PageMeta from '../components/shared/PageMeta';
import RevealBox from '../components/shared/RevealBox';
import ScrollScrubFade from '../components/shared/ScrollScrubFade';
import SeasonSwitcher from '../components/shared/SeasonSwitcher';
import TourCard from '../components/shared/TourCard';
import { IMAGES } from '../constants/images';
import {
  HOME_GATE_STAGE_INTERSECT_ENTER,
  HOME_GATE_STAGE_INTERSECT_LEAVE,
  homeGateStageIntersectThresholds,
  homeGateStageVisibleHeightShare,
} from '../constants/homeGateScroll';
import { ROUTES } from '../constants/routes';
import { UI } from '../constants/ui';
import { getToursBySeason } from '../data/toursData';
import { useSeason } from '../context/useSeason';
import { HOME_PAGE_SKY_BG_CLASS, SEASON_PAGE_BG_CLASS } from '../constants/seasonTheme';
import { useHomeNavbarChromeScroll } from '../hooks/useHomeNavbarChromeScroll';
import { useHomeSkyParallax } from '../hooks/useHomeSkyParallax';

const SafetySectionLazy = lazy(() => import('../components/home/SafetySection'));
const TeamCarouselLazy = lazy(() => import('../components/home/TeamCarousel'));
const ContactSectionLazy = lazy(() => import('../components/home/ContactSection'));

const Home = () => {
  const location = useLocation();
  const { activeSeason } = useSeason();
  const tours = useMemo(() => getToursBySeason(activeSeason), [activeSeason]);
  const gateIntersectRef = useRef<HTMLDivElement | null>(null);
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const [gateStageFocused, setGateStageFocused] = useState(false);
  const homeGateScrollEnabled = location.pathname === ROUTES.HOME;
  const homeGateBannerColumnHover =
    UI.sections.homeGateSeasonBannerStaticPresentation &&
    UI.sections.homeGateSeasonBannerLetterHoverVideo;
  const { ref: homeSkyParallaxRef } = useHomeSkyParallax();

  useHomeNavbarChromeScroll({
    heroSectionRef,
    enabled: homeGateScrollEnabled,
  });

  useLayoutEffect(() => {
    if (!homeGateScrollEnabled) return;
    const el = gateIntersectRef.current;
    if (!el) return;
    const share = homeGateStageVisibleHeightShare(el.getBoundingClientRect(), window.innerHeight);
    if (share >= HOME_GATE_STAGE_INTERSECT_ENTER) {
      queueMicrotask(() => {
        setGateStageFocused(true);
      });
    }
  }, [homeGateScrollEnabled]);

  useEffect(() => {
    if (!homeGateScrollEnabled) return;
    const el = gateIntersectRef.current;
    if (!el) return;
    const thresholds = homeGateStageIntersectThresholds();
    const obs = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!e) return;
        const r = e.intersectionRatio;
        setGateStageFocused((prev) => {
          if (!prev && r >= HOME_GATE_STAGE_INTERSECT_ENTER) return true;
          if (prev && r <= HOME_GATE_STAGE_INTERSECT_LEAVE) return false;
          return prev;
        });
      },
      { root: null, rootMargin: '0px', threshold: thresholds }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [homeGateScrollEnabled]);

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

      <div className="relative isolate flex w-full min-w-0 max-w-full flex-col">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
          <div
            ref={homeSkyParallaxRef}
            className={`absolute left-0 right-0 top-home-sky-parallax-inner min-h-home-sky-parallax-inner w-full will-change-transform ${HOME_PAGE_SKY_BG_CLASS[activeSeason]}`}
          />
        </div>

        <div className="relative z-10 flex w-full flex-col">
          <div
            ref={gateIntersectRef}
            data-home-gate-intersect-root
            className="shrink-0"
          >
            <div className="transition-none w-full shrink-0">
              <div className="relative flex w-full shrink-0 flex-col items-center justify-center overflow-x-hidden bg-home-gate-start-screen min-h-home-gate-viewport">
                <div
                  data-home-gate-banner-wrap
                  className={`flex w-full shrink-0 justify-center px-4 sm:px-6 lg:px-8 ${
                    gateStageFocused || homeGateBannerColumnHover ? '' : 'pointer-events-none'
                  }`}
                >
                  <HomeGateBannerShell>
                    <HomeSeasonBanner
                      season={activeSeason}
                      staticPresentation={UI.sections.homeGateSeasonBannerStaticPresentation}
                    />
                  </HomeGateBannerShell>
                </div>
                <HomeGateScrollToHeroLink />
              </div>
            </div>
          </div>

          <HeroCarousel ref={heroSectionRef} />

          <section
            id={UI.sections.homeToursSectionElementId}
            className={`pt-home-section-top pb-home-stack-gap ${SEASON_PAGE_BG_CLASS[activeSeason]}`}
          >
            <ScrollScrubFade className="relative">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <ScrollScrubFade as="h2" className="section-title text-text-primary">
                    {toursSectionTitle}
                  </ScrollScrubFade>
                </div>
                <RevealBox as="div" className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {tours.map((tour, index) => (
                    <TourCard key={tour.id} tour={tour} priorityImage={index === 0} />
                  ))}
                </RevealBox>
                <RevealBox
                  as="div"
                  className="mx-auto mt-home-stack-gap flex w-full max-w-7xl flex-col items-center gap-home-season-banner-foot-gap"
                >
                  <p className="text-center font-heading text-home-season-strip-label font-normal uppercase text-text-primary">
                    {UI.sections.switchSeason}
                  </p>
                  <SeasonSwitcher variant="section" />
                </RevealBox>
              </div>
            </ScrollScrubFade>
          </section>

          <Suspense fallback={<HomeBelowFoldSuspenseFallback />}>
            <ScrollScrubFade className="relative w-full">
              <SafetySectionLazy />
            </ScrollScrubFade>

            <ScrollScrubFade className="relative w-full">
              <TeamCarouselLazy />
            </ScrollScrubFade>

            <ScrollScrubFade className="relative w-full">
              <ContactSectionLazy />
            </ScrollScrubFade>
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default Home;
