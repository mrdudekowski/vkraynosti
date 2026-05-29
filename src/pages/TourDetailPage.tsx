import { useRef, type CSSProperties } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons/faCircleQuestion';
import { faClock } from '@fortawesome/free-solid-svg-icons/faClock';
import { getTourById } from "../data/toursData";
import {
  ROUTES,
  buildHomeSectionPath,
  buildTourDetailPath,
} from "../constants/routes";
import { TOUR_WINTER_3_PREFACE_BACKGROUND } from "../constants/images";
import { getTourGridVideoPosterGetter } from "../constants/tourGridVideoPosterResolver";
import {
  getTourGalleryLayoutVariant,
} from "../constants/tourGalleryLayoutVariant";
import { TOUR_SPRING_3_COVER_HERO_IMG_OBJECT_CLASS } from "../constants/tourSpring3CoverCrop";
import { TOUR_SPRING_6_COVER_HERO_IMG_OBJECT_CLASS } from "../constants/tourSpring6CoverCrop";
import { TOUR_SUMMER_1_COVER_HERO_IMG_OBJECT_CLASS } from "../constants/tourSummer1GalleryCrop";
import { TOUR_SUMMER_7_COVER_HERO_IMG_OBJECT_CLASS } from "../constants/tourSummer7CoverCrop";
import { UI } from "../constants/ui";
import { getTourGalleryGridUrls } from "../utils/tourGalleryUrls";
import { splitTourDescription } from "../utils/splitTourDescription";
import PageMeta from "../components/shared/PageMeta";
import TourDetailHero from "../components/tours/TourDetailHero";
import TourDetailGallery from "../components/tours/TourDetailGallery";
import TourRequestCtaButton from "../components/tours/TourRequestCtaButton";
import TourDetailSectionHeading from "../components/tours/TourDetailSectionHeading";
import TourDetailMetaFacts from "../components/tours/TourDetailMetaFacts";
import TourDetailPriceHighlight from "../components/tours/TourDetailPriceHighlight";
import TourIncludedIconList from "../components/tours/TourIncludedIconList";
import RevealBox from "../components/shared/RevealBox";
import ScrollScrubFade from "../components/shared/ScrollScrubFade";
import SeasonPageBackdrop from "../components/seasons/SeasonPageBackdrop";
import { BREAKPOINT_LG_PX } from "../constants/reveal";
import { useMatchMinWidth } from "../hooks/useMatchMinWidth";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { useTourProgramScrollReveal } from "../hooks/useTourProgramScrollReveal";
import { useTourProgramViewportTrack } from "../hooks/useTourProgramViewportTrack";
import { useModal } from "../context/useModal";
import { useBrowserBackToHomeTours } from "../hooks/useBrowserBackToHomeTours";
import { useTourDisplayDuration } from "../hooks/useTourDisplayDuration";
import {
  resolveTourHeroImageUrl,
  resolveTourPrefaceBackgroundUrl,
} from "../utils/getTourPrefaceBackgroundUrl";
import {
  getTourBreadcrumbSchema,
  getTourSeoEntry,
  getTourStructuredData,
} from "../constants/seo";
import {
  SEASON_ICON,
  SEASON_STYLE,
} from "../constants/seasonNavbarAppearance";

const TourDetailPage = () => {
  const { season = "", tourId = "" } = useParams<{
    season: string;
    tourId: string;
  }>();
  const tour = getTourById(tourId);

  const { openTourRequestModal } = useModal();
  useBrowserBackToHomeTours({ enabled: tour != null });
  const isLgOrAbove = useMatchMinWidth(BREAKPOINT_LG_PX);
  const prefersReducedMotion = usePrefersReducedMotion();
  const programRevealEnabled = isLgOrAbove && !prefersReducedMotion && tour != null;
  const mainColumnRef = useRef<HTMLDivElement>(null);
  const programViewportRef = useRef<HTMLDivElement>(null);
  const programTrackRef = useRef<HTMLDivElement>(null);
  const activeProgramItemRef = useRef<HTMLElement>(null);
  const { revealedCount, showProgramFooter } = useTourProgramScrollReveal({
    stepCount: tour?.program.length ?? 0,
    enabled: programRevealEnabled,
    mainColumnRef,
  });
  const { trackOffsetY } = useTourProgramViewportTrack({
    enabled: programRevealEnabled,
    viewportRef: programViewportRef,
    trackRef: programTrackRef,
    activeItemRef: activeProgramItemRef,
    updateKey: `${revealedCount}-${showProgramFooter ? 'footer' : 'steps'}`,
  });
  const visibleProgramSteps = tour?.program.slice(0, revealedCount) ?? [];
  const programCardClassName = programRevealEnabled
    ? "tour-detail-program-card tour-detail-program-card-reveal"
    : "tour-detail-program-card";
  const programTrackStyle = {
    '--tour-program-track-offset-y': `${trackOffsetY}px`,
  } as CSSProperties;
  const galleryStillUrls = tour?.galleryImages ?? [];
  const gridGalleryUrls = tour == null ? [] : getTourGalleryGridUrls(tour);

  /** Фон блока «О туре»: `prefaceBackgroundImageUrl` или иначе второй still-кадр галереи. */
  const prefaceBackgroundUrl =
    tour == null
      ? null
      : resolveTourPrefaceBackgroundUrl({
      tour,
      galleryStillUrls,
      isLgOrAbove,
      });

  const galleryGridImages =
    !tour || gridGalleryUrls.length <= 2 ? [] : gridGalleryUrls.slice(2);
  const heroImageUrl =
    tour == null
      ? ''
      : resolveTourHeroImageUrl({
      tour,
      gridGalleryUrls,
      isLgOrAbove,
      });

  const getVideoPosterForGridSrc =
    tour == null ? undefined : getTourGridVideoPosterGetter(tour.id, isLgOrAbove);

  const galleryLayoutVariant =
    tour == null ? "default" : getTourGalleryLayoutVariant(tour.id);

  const handleOpenTourRequest = () => {
    if (!tour) return;
    openTourRequestModal({
      tourId: tour.id,
      title: tour.title,
      subtitle: tour.subtitle,
      season: tour.season,
    });
  };

  const descriptionColumns = splitTourDescription(
    tour?.description ?? "",
    tour?.descriptionAside
  );
  const { displayDuration } = useTourDisplayDuration(tour ?? { id: tourId });

  if (!tour) {
    const notFoundBody = UI.tourDetail.notFoundWithId.replace("{id}", tourId);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ScrollScrubFade as="h1" className="font-heading text-section font-normal text-text-primary mb-4">
            {UI.tourDetail.notFound}
          </ScrollScrubFade>
          <p className="text-text-muted mb-6">{notFoundBody}</p>
          <Link to={ROUTES.HOME} className="btn-cta-tour" prefetch="none">
            <span>{UI.tourDetail.homeLink}</span>
          </Link>
        </div>
      </div>
    );
  }

  if (season !== tour.season) {
    return <Navigate replace to={buildTourDetailPath(tour.season, tour.id)} />;
  }

  const seasonVisualStyle = SEASON_STYLE[tour.season];
  const seasonButtonGradientClass = {
    winter: 'bg-gradient-to-r from-season-winter/30 to-season-winter/15',
    spring: 'bg-gradient-to-r from-season-spring/30 to-season-spring/15',
    summer: 'bg-gradient-to-r from-season-summer/30 to-season-summer/15',
    fall: 'bg-gradient-to-r from-season-fall/35 to-season-fall/20',
  }[tour.season];
  const seasonButtonTextClass = {
    winter: 'text-surface-dark',
    spring: 'text-surface-dark',
    summer: 'text-surface-dark',
    fall: 'text-text-inverse',
  }[tour.season];
  const seoEntry = getTourSeoEntry(tour, { displayDuration });
  const tourStructuredData = getTourStructuredData(tour, { displayDuration });
  const breadcrumbStructuredData = getTourBreadcrumbSchema(tour);
  /** Bento/crop по маршруту; медиа — только `tour.id`. */
  const heroLayoutTourId = tour.contentSourceTourId ?? tour.id;

  const includedRevealClassName =
    prefaceBackgroundUrl != null
      ? "tour-detail-included-column tour-detail-included-on-preface min-w-0"
      : "tour-detail-included-column tour-detail-included-panel min-w-0";

  const aboutTopClassName = [
    "tour-detail-about-top",
    descriptionColumns.asideText != null ? "tour-detail-about-top--with-aside" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const includedPanel = (
    <RevealBox
      as="div"
      className={includedRevealClassName}
      disabled={isLgOrAbove}
    >
      <div className="min-w-0">
        <TourDetailSectionHeading
          title={UI.tourDetail.includedHeading}
          season={tour.season}
          className="mb-4"
        />
        <TourIncludedIconList
          tourId={tour.id}
          season={tour.season}
          items={tour.includedInPrice}
        />
      </div>
    </RevealBox>
  );

  return (
    <div className="relative" data-testid="tour-detail-main">
      <SeasonPageBackdrop season={tour.season} />
      <PageMeta
        title={seoEntry.title}
        description={seoEntry.description}
        imageUrl={heroImageUrl}
        path={seoEntry.path}
        structuredData={[tourStructuredData, breadcrumbStructuredData]}
      />
      <TourDetailHero
        key={tour.id}
        imageUrl={heroImageUrl}
        imageAlt={tour.title}
        title={tour.title}
        subtitle={tour.subtitle}
        backLinkTo={buildHomeSectionPath(UI.sections.homeToursSectionElementId)}
        backLinkSeason={tour.season}
        heroImageObjectClassName={
          heroLayoutTourId === 'spring-3'
            ? TOUR_SPRING_3_COVER_HERO_IMG_OBJECT_CLASS
            : heroLayoutTourId === 'spring-6'
              ? TOUR_SPRING_6_COVER_HERO_IMG_OBJECT_CLASS
              : tour.id === 'summer-1'
                ? TOUR_SUMMER_1_COVER_HERO_IMG_OBJECT_CLASS
                : tour.id === 'summer-7'
                  ? TOUR_SUMMER_7_COVER_HERO_IMG_OBJECT_CLASS
                  : undefined
        }
        desktopHeroImgClassName={
          tour.id === 'winter-3'
            ? 'lg:object-tour-detail-hero-desktop-winter-3'
            : tour.id === 'winter-4'
              ? 'lg:object-tour-detail-hero-desktop-winter-4'
              : heroLayoutTourId === 'spring-1'
                ? 'lg:object-tour-detail-hero-desktop-spring-1'
                : heroLayoutTourId === 'spring-4'
                  ? 'lg:object-tour-detail-hero-desktop-spring-4'
                  : heroLayoutTourId === 'spring-5'
                    ? 'lg:object-tour-detail-hero-desktop-spring-5'
                    : heroLayoutTourId === 'spring-13' || tour.id === 'summer-5'
                      ? 'lg:object-tour-detail-hero-desktop-spring-13'
                      : undefined
        }
      />

      <div className="tour-detail-page-gutter">
        <div className="tour-detail-page-inner">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-x-0">
            <div
              ref={mainColumnRef}
              className="lg:col-span-2 tour-detail-main-column min-w-0"
            >
              {prefaceBackgroundUrl != null && (
                <div className="tour-detail-meta-below-hero mb-tour-detail-meta-to-preface">
                  <TourDetailMetaFacts
                    size="prominent"
                    displayDuration={displayDuration}
                    difficulty={tour.difficulty}
                    metaAudienceLabel={tour.metaAudienceLabel}
                    difficultyDisplayLabel={tour.difficultyDisplayLabel}
                  />
                </div>
              )}
              {prefaceBackgroundUrl != null ? (
                <div className="tour-detail-preface-bg">
                  <div
                    className={
                      prefaceBackgroundUrl === TOUR_WINTER_3_PREFACE_BACKGROUND
                        ? "tour-detail-preface-bg__image bg-preface-winter-3-boarder"
                        : "tour-detail-preface-bg__image"
                    }
                    style={{ backgroundImage: `url(${prefaceBackgroundUrl})` }}
                    aria-hidden
                  />
                  <div className="tour-detail-preface-bg__scrim" aria-hidden />
                  <div className="tour-detail-preface-bg__content">
                    <div className="tour-detail-about-section">
                      <div className={aboutTopClassName}>
                        <div className="tour-detail-about-column min-w-0">
                          <p className="text-tour-detail-prose max-w-prose">
                            {tour.descriptionLeadBold != null &&
                              tour.descriptionLeadBold.length > 0 && (
                                <strong className="font-bold">
                                  {tour.descriptionLeadBold}
                                </strong>
                              )}
                            {tour.descriptionLeadBold != null &&
                            tour.descriptionLeadBold.length > 0
                              ? " — "
                              : ""}
                            {descriptionColumns.primaryText}
                          </p>
                          <div className="mt-8 max-w-prose">
                            <TourRequestCtaButton
                              onClick={handleOpenTourRequest}
                            />
                          </div>
                        </div>
                        {descriptionColumns.asideText != null && (
                          <div className="tour-detail-about-aside-column">
                            <p className="tour-detail-about-aside-copy">
                              {descriptionColumns.asideText}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="tour-detail-about-included-slot">
                        {includedPanel}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="tour-detail-about-section">
                  <div className={aboutTopClassName}>
                    <div className="tour-detail-about-column min-w-0">
                      <TourDetailMetaFacts
                        displayDuration={displayDuration}
                        difficulty={tour.difficulty}
                        metaAudienceLabel={tour.metaAudienceLabel}
                        difficultyDisplayLabel={tour.difficultyDisplayLabel}
                      />
                      <p className="text-tour-detail-prose text-text-muted max-w-prose">
                        {tour.descriptionLeadBold != null &&
                          tour.descriptionLeadBold.length > 0 && (
                            <strong className="font-bold">
                              {tour.descriptionLeadBold}
                            </strong>
                          )}
                        {tour.descriptionLeadBold != null &&
                        tour.descriptionLeadBold.length > 0
                          ? " — "
                          : ""}
                        {descriptionColumns.primaryText}
                      </p>
                      <div className="mt-8 max-w-prose">
                        <TourRequestCtaButton onClick={handleOpenTourRequest} />
                      </div>
                    </div>
                    {descriptionColumns.asideText != null && (
                      <div className="tour-detail-about-aside-column">
                        <p className="tour-detail-about-aside-copy">
                          {descriptionColumns.asideText}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="tour-detail-about-included-slot">
                    {includedPanel}
                  </div>
                </div>
              )}

              {galleryGridImages.length > 0 && (
                <div className="w-full min-w-0">
                  <TourDetailSectionHeading
                    title={UI.tourDetail.gallery}
                    season={tour.season}
                    className="mb-gallery-gap"
                  />
                  <TourDetailGallery
                    images={galleryGridImages}
                    tourTitle={tour.title}
                    prefersReducedMotion={prefersReducedMotion}
                    getVideoPosterForGridSrc={getVideoPosterForGridSrc}
                    layoutVariant={galleryLayoutVariant}
                  />
                  <div className="mt-8">
                    <Link
                      to={buildHomeSectionPath(UI.sections.homeToursSectionElementId)}
                      className={[
                        'group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm backdrop-blur-sm transition-all duration-hover',
                        seasonButtonGradientClass,
                        seasonVisualStyle.border,
                        seasonVisualStyle.hoverBorder,
                        seasonVisualStyle.sectionHoverGlow,
                        'bg-cover bg-center shadow-lg hover:shadow-xl hover:brightness-110',
                        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary',
                      ].join(' ')}
                      prefetch="intent"
                    >
                      <FontAwesomeIcon
                        icon={SEASON_ICON[tour.season]}
                        className={[
                          'transition-all duration-hover',
                          seasonButtonTextClass,
                          seasonVisualStyle.rotate,
                        ].join(' ')}
                        aria-hidden
                      />
                      <span className={`font-semibold ${seasonButtonTextClass}`}>
                        {UI.tourDetail.backToToursCta}
                      </span>
                    </Link>
                  </div>
                </div>
              )}
              <div className="hidden lg:mt-10 lg:block">
                <TourDetailPriceHighlight
                  tour={tour}
                  ariaHidden={!isLgOrAbove}
                />
              </div>
            </div>

            <div>
              <div className={programCardClassName}>
                <TourDetailSectionHeading
                  title={UI.tourDetail.programHeading}
                  season={tour.season}
                  size="program"
                  className="mb-4"
                />
                <div ref={programViewportRef} className="tour-detail-program-viewport">
                  <div
                    ref={programTrackRef}
                    className="tour-detail-program-track"
                    style={programTrackStyle}
                  >
                    <ol className="border-l border-divider pl-4 ml-2 space-y-6">
                      {visibleProgramSteps.map((step, idx) => (
                        <li
                          key={`${step.timeLabel}-${idx}`}
                          ref={
                            !showProgramFooter && idx === visibleProgramSteps.length - 1
                              ? (node) => {
                                  activeProgramItemRef.current = node;
                                }
                              : undefined
                          }
                          className="flex gap-3 reveal-program-step-base reveal-program-step-visible"
                        >
                          <FontAwesomeIcon
                            icon={faClock}
                            className="text-brand-primary mt-1 shrink-0"
                            aria-hidden
                          />
                          <div>
                            <p className="text-tooltip text-text-muted">
                              {step.timeLabel}
                            </p>
                            <p className="text-tour-detail-program-body text-text-muted">
                              {step.description}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                    {showProgramFooter && (
                      <div
                        ref={(node) => {
                          activeProgramItemRef.current = node;
                        }}
                        className="reveal-program-footer"
                      >
                        <p className="text-tooltip text-text-muted mt-8 lg:mt-10 leading-relaxed">
                          {UI.tourDetail.programTimeDisclaimer}
                        </p>
                        {tour.programAdditionalNotes?.map((note, noteIdx) => (
                          <p
                            key={`program-note-${noteIdx}`}
                            className="text-tooltip text-text-muted mt-4 leading-relaxed"
                          >
                            {note}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 lg:hidden">
            <TourDetailPriceHighlight
              tour={tour}
              ariaHidden={isLgOrAbove}
            />
          </div>

          <div className="mt-10 border-t border-divider pt-8">
            <div className="tour-detail-footer-cta-block flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-prose text-tour-detail-prose text-text-muted">
                {UI.tourDetail.askQuestionFooterLead}
              </p>
              <button
                type="button"
                onClick={handleOpenTourRequest}
                className="btn-tour-detail-footer-cta shrink-0"
              >
                <FontAwesomeIcon icon={faCircleQuestion} className="shrink-0" aria-hidden />
                {UI.tourDetail.askQuestionCta}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetailPage;
