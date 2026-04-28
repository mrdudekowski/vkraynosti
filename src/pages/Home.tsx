import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLenis } from 'lenis/react';
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
import PlaceholderImage from '../components/shared/PlaceholderImage';
import { HOME_SEASON_BANNER_WINTER_LOOP_VIDEOS, IMAGES } from '../constants/images';
import {
  HOME_GATE_STAGE_INTERSECT_ENTER,
  HOME_GATE_STAGE_INTERSECT_LEAVE,
  homeGateStageIntersectThresholds,
  homeGateStageVisibleHeightShare,
} from '../constants/homeGateScroll';
import {
  getHomeSeasonBannerSpringVideoPreloadLinks,
  getHomeSeasonBannerWinterVideoPreloadLinks,
} from '../constants/homeSeasonBannerVideoPreload';
import { ROUTES } from '../constants/routes';
import { UI } from '../constants/ui';
import { getToursBySeason } from '../data/toursData';
import { useSeason } from '../context/useSeason';
import { HOME_PAGE_SKY_BG_CLASS, SEASON_PAGE_BG_CLASS } from '../constants/seasonTheme';
import { useHomeNavbarChromeScroll } from '../hooks/useHomeNavbarChromeScroll';
import { useHomeSkyParallax } from '../hooks/useHomeSkyParallax';
import { SEASON_ORDER } from '../constants/seasonNavbarAppearance';
import { BREAKPOINT_MD_PX, NAVBAR_SCROLL_OFFSET_PX } from '../constants/smoothScroll';
import type { Season } from '../types';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll';

const SafetySectionLazy = lazy(() => import('../components/home/SafetySection'));
const TeamCarouselLazy = lazy(() => import('../components/home/TeamCarousel'));
const ContactSectionLazy = lazy(() => import('../components/home/ContactSection'));
const HOME_TOURS_PREVIEW_LIMIT = 3;
const HOME_TOURS_PROMO_VIDEO_SWITCH_MS = 3000;
const GRID_FADE_OUT_DURATION_MS = 260;
const GRID_REVEAL_DURATION_MS = 500;
const GRID_CASCADE_STEP_MS = 70;
const HOME_TOURS_HEADING_ELEMENT_ID = 'home-tours-heading';

type HomeToursGridPhase = 'idle' | 'fadingOut' | 'preFadeIn' | 'fadingIn';

const Home = () => {
  const location = useLocation();
  const lenis = useLenis();
  const { activeSeason, setActiveSeason } = useSeason();
  const tours = useMemo(() => getToursBySeason(activeSeason), [activeSeason]);
  const springTours = useMemo(() => getToursBySeason('spring'), []);
  const [expandedSeason, setExpandedSeason] = useState<Season | null>(null);
  const isAllToursExpanded = expandedSeason === activeSeason;
  const [toursPromoVideoIndex, setToursPromoVideoIndex] = useState(0);
  const [gridPhase, setGridPhase] = useState<HomeToursGridPhase>('idle');
  const [gridAnimationCycle, setGridAnimationCycle] = useState(0);
  const [pendingExpandedSeason, setPendingExpandedSeason] = useState<Season | null>(null);
  const shouldScrollAfterCollapseRef = useRef(false);
  const expandCardMediaViewportRef = useRef<HTMLDivElement | null>(null);
  const gateIntersectRef = useRef<HTMLDivElement | null>(null);
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const expandControlButtonRef = useRef<HTMLButtonElement | null>(null);
  const toursHeadingWrapRef = useRef<HTMLDivElement | null>(null);
  const [gateStageFocused, setGateStageFocused] = useState(false);
  const [expandCardVideoInView, setExpandCardVideoInView] = useState(
    () => typeof IntersectionObserver === 'undefined'
  );
  const homeGateScrollEnabled = location.pathname === ROUTES.HOME;
  const homeGateBannerColumnHover =
    UI.sections.homeGateSeasonBannerStaticPresentation &&
    UI.sections.homeGateSeasonBannerLetterHoverVideo;
  const { ref: homeSkyParallaxRef } = useHomeSkyParallax();
  const { ref: expandOverlayRevealRef, directionalRevealClassName: expandOverlayRevealClassName } =
    useRevealOnScroll({
      once: false,
      bidirectional: true,
      directional: true,
      threshold: 0.2,
      rootMargin: '0px 0px -10% 0px',
    });

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

  const seasonBannerVideoPreloads = useMemo(
    () =>
      activeSeason === 'winter'
        ? getHomeSeasonBannerWinterVideoPreloadLinks()
        : activeSeason === 'spring'
          ? getHomeSeasonBannerSpringVideoPreloadLinks()
          : undefined,
    [activeSeason]
  );

  const visibleTours = isAllToursExpanded ? tours : tours.slice(0, HOME_TOURS_PREVIEW_LIMIT);
  const activeSeasonLeadTour = tours[0];
  const springPromoVideoUrls = useMemo(
    () =>
      springTours
        .flatMap(tour => tour.galleryGridUrls ?? tour.galleryImages)
        .filter(url => /\.(webm|mp4)(\?|$)/i.test(url)),
    [springTours]
  );
  const winterPromoVideoUrls = useMemo(
    () => [...HOME_SEASON_BANNER_WINTER_LOOP_VIDEOS],
    []
  );
  const activeSeasonPromoVideoUrls = useMemo(() => {
    if (activeSeason === 'winter') return winterPromoVideoUrls;
    if (activeSeason === 'spring') return springPromoVideoUrls;
    return [];
  }, [activeSeason, springPromoVideoUrls, winterPromoVideoUrls]);
  const activeSeasonPromoVideoCount = activeSeasonPromoVideoUrls.length;
  const normalizedPromoVideoIndex =
    activeSeasonPromoVideoCount > 0 ? toursPromoVideoIndex % activeSeasonPromoVideoCount : 0;
  const activeSeasonPromoVideoUrl =
    activeSeasonPromoVideoCount > 0 ? activeSeasonPromoVideoUrls[normalizedPromoVideoIndex] : null;
  const hasHiddenTours = tours.length > HOME_TOURS_PREVIEW_LIMIT;
  const shouldRenderExpandCard = hasHiddenTours;
  const activeSeasonIndex = SEASON_ORDER.indexOf(activeSeason);
  const nextSeason = SEASON_ORDER[(activeSeasonIndex + 1) % SEASON_ORDER.length];
  const nextSeasonTours = useMemo(() => getToursBySeason(nextSeason), [nextSeason]);
  const nextSeasonLeadTour = nextSeasonTours[0];
  const gridItemsBeforeShadowCard = visibleTours.length + (shouldRenderExpandCard ? 1 : 0);
  const shouldRenderNextSeasonShadowCard =
    isAllToursExpanded && gridItemsBeforeShadowCard % 4 === 3 && nextSeasonLeadTour != null;

  const toggleToursVisibility = () => {
    if (gridPhase !== 'idle') return;
    const nextExpandedSeason = isAllToursExpanded ? null : activeSeason;
    shouldScrollAfterCollapseRef.current = isAllToursExpanded;
    setPendingExpandedSeason(nextExpandedSeason);
    setGridPhase('fadingOut');
  };

  const switchToNextSeason = () => {
    setActiveSeason(nextSeason);
    setExpandedSeason(null);
    setPendingExpandedSeason(null);
    shouldScrollAfterCollapseRef.current = false;
    setGridPhase('idle');
  };

  const snapToCollapseTarget = useCallback(() => {
    const headingTarget = toursHeadingWrapRef.current ?? document.getElementById(HOME_TOURS_HEADING_ELEMENT_ID);
    const isTabletOrDesktopViewport = window.innerWidth >= BREAKPOINT_MD_PX;
    const scrollTarget = isTabletOrDesktopViewport ? headingTarget : expandControlButtonRef.current;
    if (scrollTarget == null) return;

    if (lenis) {
      lenis.scrollTo(scrollTarget, { offset: NAVBAR_SCROLL_OFFSET_PX, immediate: true });
      return;
    }

    const viewportTop = window.scrollY + scrollTarget.getBoundingClientRect().top;
    window.scrollTo({ top: viewportTop + NAVBAR_SCROLL_OFFSET_PX, behavior: 'auto' });
  }, [lenis]);

  useEffect(() => {
    if (expandCardVideoInView) return;
    const el = expandCardMediaViewportRef.current;
    if (el == null) return;
    if (typeof IntersectionObserver === 'undefined') {
      setExpandCardVideoInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          setExpandCardVideoInView(true);
          observer.disconnect();
        }
      },
      { root: null, rootMargin: '300px 0px', threshold: 0.01 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [expandCardVideoInView]);

  useEffect(() => {
    if (activeSeasonPromoVideoUrls.length <= 1) return;
    const intervalId = window.setInterval(() => {
      setToursPromoVideoIndex(prev => (prev + 1) % activeSeasonPromoVideoUrls.length);
    }, HOME_TOURS_PROMO_VIDEO_SWITCH_MS);
    return () => window.clearInterval(intervalId);
  }, [activeSeasonPromoVideoUrls]);

  useEffect(() => {
    if (gridPhase !== 'fadingOut') return;
    const timeoutId = window.setTimeout(() => {
      setExpandedSeason(pendingExpandedSeason);
      setGridAnimationCycle(prev => prev + 1);
      setGridPhase('preFadeIn');
    }, GRID_FADE_OUT_DURATION_MS);
    return () => window.clearTimeout(timeoutId);
  }, [gridPhase, pendingExpandedSeason]);

  useEffect(() => {
    if (gridPhase !== 'preFadeIn') return;
    if (shouldScrollAfterCollapseRef.current) {
      // In preFadeIn grid is already re-rendered but still hidden (opacity 0).
      snapToCollapseTarget();
      shouldScrollAfterCollapseRef.current = false;
    }
    const frameId = window.requestAnimationFrame(() => {
      setGridPhase('fadingIn');
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [gridPhase, snapToCollapseTarget]);

  useEffect(() => {
    if (gridPhase !== 'fadingIn') return;
    const renderedGridItemsCount =
      visibleTours.length + (shouldRenderExpandCard ? 1 : 0) + (shouldRenderNextSeasonShadowCard ? 1 : 0);
    const cascadeDurationMs =
      GRID_REVEAL_DURATION_MS + Math.max(renderedGridItemsCount - 1, 0) * GRID_CASCADE_STEP_MS;
    const timeoutId = window.setTimeout(() => {
      shouldScrollAfterCollapseRef.current = false;
      setPendingExpandedSeason(null);
      setGridPhase('idle');
    }, cascadeDurationMs);
    return () => window.clearTimeout(timeoutId);
  }, [
    gridPhase,
    shouldRenderExpandCard,
    shouldRenderNextSeasonShadowCard,
    visibleTours.length,
  ]);

  const getGridItemAnimation = (itemIndex: number): { className: string; style?: { transitionDelay: string } } => {
    const baseClassName = 'h-full transition-[opacity,transform,filter] duration-reveal ease-reveal-out';
    const maxCascadeIndex = Math.min(itemIndex, 8);
    const cascadeDelayStyle =
      gridPhase === 'fadingIn' || gridPhase === 'preFadeIn'
        ? { transitionDelay: `${maxCascadeIndex * GRID_CASCADE_STEP_MS}ms` }
        : undefined;

    if (gridPhase === 'fadingOut') {
      return { className: `${baseClassName} opacity-0 -translate-y-reveal-y` };
    }
    if (gridPhase === 'preFadeIn') {
      return { className: `${baseClassName} opacity-0 translate-y-reveal-y`, style: cascadeDelayStyle };
    }
    if (gridPhase === 'fadingIn') {
      return { className: `${baseClassName} opacity-100 translate-y-0`, style: cascadeDelayStyle };
    }
    return { className: `${baseClassName} opacity-100 translate-y-0` };
  };

  const toursSectionTitle = UI.sections.toursTitleBySeason[activeSeason];
  return (
    <>
      <PageMeta
        title="Вкрайности — Туры по дикой природе России"
        description="Авторские туры по Алтаю, Байкалу, Камчатке и Кавказу. Зима, весна, лето, осень — четыре сезона приключений с опытными гидами."
        imageUrl={IMAGES.hero[activeSeason]}
        path={ROUTES.HOME}
        preloadHeroImageUrl={tours[0]?.imageUrl}
        priorityVideoPreloads={seasonBannerVideoPreloads}
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
                <div ref={toursHeadingWrapRef} className="text-center mb-12">
                  <ScrollScrubFade id={HOME_TOURS_HEADING_ELEMENT_ID} as="h2" className="section-title text-text-primary">
                    {toursSectionTitle}
                  </ScrollScrubFade>
                </div>
                <RevealBox as="div" className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {visibleTours.map((tour, index) => (
                    <div
                      key={`${tour.id}-${gridAnimationCycle}`}
                      className={getGridItemAnimation(index).className}
                      style={getGridItemAnimation(index).style}
                    >
                      <TourCard tour={tour} priorityImage={index === 0} />
                    </div>
                  ))}
                  {shouldRenderExpandCard ? (
                    <div
                      key={`expand-control-${gridAnimationCycle}`}
                      className={getGridItemAnimation(visibleTours.length).className}
                      style={getGridItemAnimation(visibleTours.length).style}
                    >
                      <button
                        ref={expandControlButtonRef}
                        type="button"
                        onClick={toggleToursVisibility}
                        className="card-base relative flex h-full w-full max-h-tour-card max-w-tour-card justify-self-center flex-col items-center justify-center overflow-hidden text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary"
                      >
                        {activeSeasonLeadTour != null ? (
                          <div className="absolute inset-0" aria-hidden>
                            <div ref={expandCardMediaViewportRef} className="h-full w-full">
                            {activeSeasonPromoVideoUrl != null && expandCardVideoInView ? (
                              <video
                                key={activeSeasonPromoVideoUrl}
                                className="h-full w-full object-cover opacity-60"
                                poster={activeSeasonLeadTour.imageUrl}
                                autoPlay
                                muted
                                playsInline
                                preload="none"
                                loop
                              >
                                <source src={activeSeasonPromoVideoUrl} />
                              </video>
                            ) : (
                              <PlaceholderImage
                                src={activeSeasonLeadTour.imageUrl}
                                alt={`${UI.tourCard.nextSeasonCloneImageAltPrefix}: ${UI.sections.toursTitleBySeason[activeSeason]}`}
                                className="h-full w-full opacity-50"
                                loading="lazy"
                              />
                            )}
                            </div>
                            <div
                              ref={expandOverlayRevealRef}
                              className={`absolute inset-0 bg-surface-dark/45 reveal-base ${expandOverlayRevealClassName}`}
                            />
                          </div>
                        ) : null}
                        <div className="relative z-10 flex flex-col items-center gap-3 p-card-p">
                          <span className="font-heading text-card text-text-inverse">
                            {isAllToursExpanded ? UI.tourCard.showLessCta : UI.tourCard.showMoreCta}
                          </span>
                          <span className="font-body text-sm text-text-inverse/90">
                            {UI.sections.toursTitleBySeason[activeSeason]}
                          </span>
                        </div>
                      </button>
                    </div>
                  ) : null}
                  {shouldRenderNextSeasonShadowCard ? (
                    <div
                      key={`next-season-clone-${gridAnimationCycle}`}
                      className={
                        getGridItemAnimation(visibleTours.length + (shouldRenderExpandCard ? 1 : 0)).className
                      }
                      style={getGridItemAnimation(visibleTours.length + (shouldRenderExpandCard ? 1 : 0)).style}
                    >
                      <button
                        type="button"
                        onClick={switchToNextSeason}
                        className="card-base relative flex h-full w-full max-h-tour-card max-w-tour-card justify-self-center flex-col overflow-hidden border-dashed border-brand-secondary/50 bg-surface-light/70 text-center opacity-80 shadow-none transition-all duration-300 hover:opacity-100 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary"
                        aria-label={UI.tourCard.nextSeasonCloneCta}
                      >
                        <div className="relative h-48 w-full overflow-hidden rounded-t-card">
                          <PlaceholderImage
                            src={nextSeasonLeadTour.imageUrl}
                            alt={`${UI.tourCard.nextSeasonCloneImageAltPrefix}: ${UI.seasons[nextSeason].label}`}
                            className="h-full w-full"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-surface-dark/60" aria-hidden />
                        </div>
                        <div className="relative z-10 flex w-full flex-col items-center gap-2 p-card-p">
                          <span className="font-heading text-card text-text-inverse">
                            {UI.tourCard.nextSeasonCloneCta}
                          </span>
                          <span className="font-body text-sm text-text-inverse/90">
                            {UI.seasons[nextSeason].label}
                          </span>
                        </div>
                      </button>
                    </div>
                  ) : null}
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
