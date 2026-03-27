import { useCallback, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faChartLine,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import { getTourById } from "../data/toursData";
import {
  ROUTES,
  SEASON_TO_LIST_ROUTE,
  buildTourDetailPath,
} from "../constants/routes";
import { UI } from "../constants/ui";
import Breadcrumbs from "../components/shared/Breadcrumbs";
import PageMeta from "../components/shared/PageMeta";
import TourDetailHero from "../components/tours/TourDetailHero";
import TourDetailGallery from "../components/tours/TourDetailGallery";
import TourGalleryLightbox from "../components/tours/TourGalleryLightbox";
import TourRequestCtaButton from "../components/tours/TourRequestCtaButton";
import { SEASON_PAGE_BG_CLASS } from "../constants/seasonTheme";
import { useModal } from "../context/useModal";

const TourDetailPage = () => {
  const { season = "", tourId = "" } = useParams<{
    season: string;
    tourId: string;
  }>();
  const tour = getTourById(tourId);
  const { openTourRequestModal } = useModal();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const galleryGridImages =
    tour && tour.galleryImages.length > 1 ? tour.galleryImages.slice(1) : [];

  const handleOpenTourRequest = useCallback(() => {
    if (!tour) return;
    openTourRequestModal({
      tourId: tour.id,
      title: tour.title,
      subtitle: tour.subtitle,
      season: tour.season,
    });
  }, [tour, openTourRequestModal]);

  if (!tour) {
    const notFoundBody = UI.tourDetail.notFoundWithId.replace("{id}", tourId);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-section font-normal text-text-primary mb-4">
            {UI.tourDetail.notFound}
          </h1>
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

  return (
    <div className={SEASON_PAGE_BG_CLASS[tour.season]}>
      <PageMeta
        title={`${tour.title} | Вкрайности`}
        description={`${tour.subtitle}. ${tour.duration}, ${tour.price}. ${metaSnippet}.`}
        imageUrl={tour.imageUrl}
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
        onOpenGallery={
          tour.galleryImages.length > 0 ? () => setLightboxIndex(0) : undefined
        }
        openGalleryAriaLabel={UI.tourDetail.galleryLightbox.openHeroAria}
      />

      {lightboxIndex !== null && tour.galleryImages.length > 0 && (
        <TourGalleryLightbox
          images={tour.galleryImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          tourTitle={tour.title}
        />
      )}

      <div className="tour-detail-page-gutter">
        <div className="tour-detail-page-inner">
          <div className="tour-detail-page-meta-zone">
            <Breadcrumbs
              className="mb-6"
              items={[
                { label: UI.breadcrumbs.home, to: ROUTES.HOME },
                {
                  label: `${seasonInfo.emoji} ${seasonInfo.label}`,
                  to: SEASON_TO_LIST_ROUTE[tour.season],
                },
                { label: tour.title },
              ]}
            />
            <div className="flex flex-wrap gap-3">
              <span className="flex items-center gap-2 bg-surface-light px-4 py-2 rounded-full text-tour-detail-meta text-text-muted">
                <FontAwesomeIcon
                  icon={faClock}
                  className="text-brand-primary shrink-0"
                />
                {tour.duration}
              </span>
              <span
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-tour-detail-meta font-semibold ${UI.difficulty.styles[tour.difficulty]}`}
              >
                <FontAwesomeIcon icon={faChartLine} />
                {UI.difficulty.labels[tour.difficulty]}
              </span>
              <span className="flex items-center gap-2 bg-brand-primary text-text-inverse px-4 py-2 rounded-full text-tour-detail-meta font-semibold">
                <FontAwesomeIcon icon={faTag} />
                {tour.price}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-x-0">
            <div className="lg:col-span-2 tour-detail-main-column min-w-0">
              <div className="tour-detail-about-included-grid">
                <div className="tour-detail-about-column min-w-0">
                  <h2 className="tour-detail-section-heading">
                    {UI.tourDetail.about}
                  </h2>
                  <p className="text-tour-detail-prose text-text-muted max-w-prose">
                    {tour.descriptionLeadBold != null &&
                      tour.descriptionLeadBold.length > 0 && (
                        <strong className="font-bold">{tour.descriptionLeadBold}</strong>
                      )}
                    {tour.description}
                  </p>
                  <div className="mt-8 max-w-prose">
                    <TourRequestCtaButton onClick={handleOpenTourRequest} />
                  </div>
                </div>
                <div className="tour-detail-included-column min-w-0">
                  <h2 className="tour-detail-section-heading">
                    {UI.tourDetail.includedHeading}
                  </h2>
                  <ul className="flex flex-col gap-3 max-w-prose">
                    {tour.includedInPrice.map((item, idx) => (
                      <li
                        key={`${tour.id}-included-${idx}`}
                        className="flex items-start gap-3"
                      >
                        <FontAwesomeIcon
                          icon={item.icon}
                          className="text-base text-brand-primary mt-1 shrink-0"
                          aria-hidden
                        />
                        <span className="text-tour-detail-prose text-text-muted">
                          {item.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {galleryGridImages.length > 0 && (
                <div className="w-full min-w-0">
                  <div className="tour-gallery-section-heading">
                    <span
                      className="tour-gallery-section-heading-accent"
                      aria-hidden
                    />
                    <h2 className="font-heading text-tour-detail-section font-normal text-text-primary">
                      {UI.tourDetail.gallery}
                    </h2>
                  </div>
                  <TourDetailGallery
                    images={galleryGridImages}
                    firstImageIndexInTourGallery={1}
                    tourTitle={tour.title}
                    onOpenPhoto={setLightboxIndex}
                    layoutVariant={
                      tour.id === "winter-1" ? "izubrinaya" : "default"
                    }
                  />
                </div>
              )}
            </div>

            <div>
              <div className="tour-detail-program-card">
                <h2 className="font-heading text-tour-detail-program-heading font-normal text-text-primary mb-4">
                  {UI.tourDetail.programHeading}
                </h2>
                <ol className="border-l border-divider pl-4 ml-2 space-y-6">
                  {tour.program.map((step, idx) => (
                    <li key={`${step.timeLabel}-${idx}`} className="flex gap-3">
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
              </div>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-divider">
            <button
              type="button"
              onClick={handleOpenTourRequest}
              className="btn-primary inline-flex items-center justify-center text-center"
            >
              {UI.tourDetail.askQuestionCta}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetailPage;
