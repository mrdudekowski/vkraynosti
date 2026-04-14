import { useCallback, useMemo, useRef, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons/faCircleQuestion';
import { faClock } from '@fortawesome/free-solid-svg-icons/faClock';
import { getTourById } from "../data/toursData";
import {
  ROUTES,
  SEASON_TO_LIST_ROUTE,
  buildTourDetailPath,
} from "../constants/routes";
import {
  TOUR_WINTER_3_GRID_VIDEO_POSTERS,
  TOUR_WINTER_3_PREFACE_BACKGROUND,
  TOUR_WINTER_4_GRID_VIDEO_POSTERS,
  TOUR_WINTER_5_GRID_VIDEO_POSTERS,
} from "../constants/images";
import { UI } from "../constants/ui";
import {
  getTourGalleryGridUrls,
  getTourGalleryViewerUrls,
} from "../utils/tourGalleryUrls";
import PageMeta from "../components/shared/PageMeta";
import TourDetailHero from "../components/tours/TourDetailHero";
import TourDetailGallery, {
  type TourGalleryLayoutVariant,
} from "../components/tours/TourDetailGallery";
import TourPhotoViewer from "../components/tours/TourPhotoViewer";
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
import { useModal } from "../context/useModal";

const TourDetailPage = () => {
  const { season = "", tourId = "" } = useParams<{
    season: string;
    tourId: string;
  }>();
  const tour = getTourById(tourId);
  const { openTourRequestModal } = useModal();
  const isLgOrAbove = useMatchMinWidth(BREAKPOINT_LG_PX);
  const prefersReducedMotion = usePrefersReducedMotion();
  const programRevealEnabled = !prefersReducedMotion && tour != null;
  const mainColumnRef = useRef<HTMLDivElement>(null);
  const programCardRef = useRef<HTMLDivElement>(null);
  const revealProgressRef = isLgOrAbove ? mainColumnRef : programCardRef;
  const { revealedCount } = useTourProgramScrollReveal({
    stepCount: tour?.program.length ?? 0,
    enabled: programRevealEnabled,
    mainColumnRef: revealProgressRef,
  });
  const [photoViewer, setPhotoViewer] = useState<{
    images: string[];
    initialIndex: number;
    tourTitle: string;
  } | null>(null);

  const viewerGalleryUrls = useMemo(
    () => (tour == null ? [] : getTourGalleryViewerUrls(tour)),
    [tour]
  );
  const gridGalleryUrls = useMemo(
    () => (tour == null ? [] : getTourGalleryGridUrls(tour)),
    [tour]
  );

  /** Фон блока «О туре»: `prefaceBackgroundImageUrl` или иначе второй кадр viewer-галереи. */
  const prefaceBackgroundUrl = useMemo(() => {
    if (tour == null) return null;
    return (
      tour.prefaceBackgroundImageUrl ??
      (viewerGalleryUrls.length > 1 ? viewerGalleryUrls[1] : null)
    );
  }, [tour, viewerGalleryUrls]);

  const galleryGridImages = useMemo(() => {
    if (!tour || gridGalleryUrls.length <= 2) return [];
    return gridGalleryUrls.slice(2);
  }, [tour, gridGalleryUrls]);

  const galleryFirstIndexInFullTour = 2;

  const getVideoPosterForGridSrc = useMemo(():
    | ((src: string) => string | undefined)
    | undefined => {
    if (!tour) return undefined;
    if (tour.id === "winter-3")
      return (src) => TOUR_WINTER_3_GRID_VIDEO_POSTERS[src];
    if (tour.id === "winter-4")
      return (src) => TOUR_WINTER_4_GRID_VIDEO_POSTERS[src];
    if (tour.id === "winter-5")
      return (src) => TOUR_WINTER_5_GRID_VIDEO_POSTERS[src];
    return undefined;
  }, [tour]);

  const galleryLayoutVariant = useMemo((): TourGalleryLayoutVariant => {
    if (!tour) return "default";
    if (tour.id === "winter-1") return "izubrinaya";
    if (tour.id === "winter-5") return "arsgora";
    return "default";
  }, [tour]);

  const handleOpenTourRequest = useCallback(() => {
    if (!tour) return;
    openTourRequestModal({
      tourId: tour.id,
      title: tour.title,
      subtitle: tour.subtitle,
      season: tour.season,
    });
  }, [tour, openTourRequestModal]);

  const handleOpenGalleryPhoto = useCallback(
    (idx: number) => {
      if (!tour) return;
      setPhotoViewer({
        images: viewerGalleryUrls,
        initialIndex: idx,
        tourTitle: tour.title,
      });
    },
    [tour, viewerGalleryUrls]
  );

  const closePhotoViewer = useCallback(() => {
    setPhotoViewer(null);
  }, []);

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

  const seasonInfo = UI.seasons[tour.season];
  const metaSnippet = tour.program
    .slice(0, 3)
    .map((s) => s.description)
    .join(", ");

  const includedRevealClassName =
    prefaceBackgroundUrl != null
      ? "tour-detail-included-column tour-detail-included-on-preface min-w-0"
      : "tour-detail-included-column tour-detail-included-panel min-w-0";

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
        title={`${tour.title} | Вкрайности`}
        description={`${tour.subtitle}. ${tour.duration}, ${tour.price}. ${metaSnippet}.`}
        imageUrl={viewerGalleryUrls[0] ?? tour.imageUrl}
        path={buildTourDetailPath(tour.season, tour.id)}
      />
      <TourDetailHero
        key={tour.id}
        imageUrl={tour.imageUrl}
        imageAlt={tour.title}
        title={tour.title}
        subtitle={tour.subtitle}
        backLinkTo={SEASON_TO_LIST_ROUTE[tour.season]}
        backLinkLabel={`${seasonInfo.emoji} ${seasonInfo.label}`}
        desktopHeroImgClassName={
          tour.id === 'winter-3'
            ? 'lg:object-tour-detail-hero-desktop-winter-3'
            : tour.id === 'winter-4'
              ? 'lg:object-tour-detail-hero-desktop-winter-4'
              : undefined
        }
      />

      {photoViewer != null && (
        <TourPhotoViewer
          key={photoViewer.initialIndex}
          images={photoViewer.images}
          initialIndex={photoViewer.initialIndex}
          tourTitle={photoViewer.tourTitle}
          onClose={closePhotoViewer}
        />
      )}

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
                    duration={tour.duration}
                    difficulty={tour.difficulty}
                    metaAudienceLabel={tour.metaAudienceLabel}
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
                    <div className="tour-detail-about-included-grid">
                      <div className="tour-detail-about-column min-w-0">
                        <p className="text-tour-detail-prose max-w-prose">
                          {tour.descriptionLeadBold != null &&
                            tour.descriptionLeadBold.length > 0 && (
                              <strong className="font-bold">
                                {tour.descriptionLeadBold}
                              </strong>
                            )}
                          {tour.description}
                        </p>
                        <div className="mt-8 max-w-prose">
                          <TourRequestCtaButton
                            onClick={handleOpenTourRequest}
                          />
                        </div>
                      </div>
                      {includedPanel}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="tour-detail-about-included-grid">
                  <div className="tour-detail-about-column min-w-0">
                    <TourDetailMetaFacts
                      duration={tour.duration}
                      difficulty={tour.difficulty}
                      metaAudienceLabel={tour.metaAudienceLabel}
                    />
                    <p className="text-tour-detail-prose text-text-muted max-w-prose">
                      {tour.descriptionLeadBold != null &&
                        tour.descriptionLeadBold.length > 0 && (
                          <strong className="font-bold">
                            {tour.descriptionLeadBold}
                          </strong>
                        )}
                      {tour.description}
                    </p>
                    <div className="mt-8 max-w-prose">
                      <TourRequestCtaButton onClick={handleOpenTourRequest} />
                    </div>
                  </div>
                  {includedPanel}
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
                    firstImageIndexInTourGallery={galleryFirstIndexInFullTour}
                    tourTitle={tour.title}
                    onOpenPhoto={handleOpenGalleryPhoto}
                    prefersReducedMotion={prefersReducedMotion}
                    getVideoPosterForGridSrc={getVideoPosterForGridSrc}
                    layoutVariant={galleryLayoutVariant}
                  />
                </div>
              )}
              <div className="hidden lg:mt-10 lg:block">
                <TourDetailPriceHighlight
                  price={tour.price}
                  pricePrevious={tour.pricePrevious}
                  footnote={tour.priceFootnote}
                  season={tour.season}
                  ariaHidden={!isLgOrAbove}
                />
              </div>
            </div>

            <div>
              <div ref={programCardRef} className="tour-detail-program-card">
                <TourDetailSectionHeading
                  title={UI.tourDetail.programHeading}
                  season={tour.season}
                  size="program"
                  className="mb-4"
                />
                <ol className="border-l border-divider pl-4 ml-2 space-y-6">
                  {tour.program.map((step, idx) => (
                    <li
                      key={`${step.timeLabel}-${idx}`}
                      className={`flex gap-3 reveal-program-step-base ${
                        !programRevealEnabled || idx < revealedCount
                          ? "reveal-program-step-visible"
                          : "reveal-program-step-hidden"
                      }`}
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
            </div>
          </div>

          <div className="mt-10 lg:hidden">
            <TourDetailPriceHighlight
              price={tour.price}
              pricePrevious={tour.pricePrevious}
              footnote={tour.priceFootnote}
              season={tour.season}
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
