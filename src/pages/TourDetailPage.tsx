import { useParams, Link, Navigate } from "react-router-dom";
import { getTourById } from "../data/toursData";
import {
  ROUTES,
  buildTourDetailPath,
} from "../constants/routes";
import { SEO_DEFAULTS } from "../constants/seo";
import { UI } from "../constants/ui";
import PageMeta from "../components/shared/PageMeta";
import type { Season } from "../types";
import ScrollScrubFade from "../components/shared/ScrollScrubFade";
import { useBrowserBackToHomeTours } from "../hooks/useBrowserBackToHomeTours";
import { useTourSchedule } from "../hooks/useTourSchedule";
import {
  isTourHiddenFromSite,
  resolveTourPublicationStatus,
} from "../utils/tourSchedule/resolveTourPublicationStatus";
import TourDetailPageFull from "./TourDetailPageFull";
import TourDetailPageInDevelopment from "./TourDetailPageInDevelopment";

const TourDetailPage = () => {
  const { season = "", tourId = "" } = useParams<{
    season: string;
    tourId: string;
  }>();
  const tour = getTourById(tourId);
  const { publicationStatuses, status: scheduleStatus, retry } = useTourSchedule();
  const scheduleLoaded = scheduleStatus === 'success';
  const publicationStatus =
    tour != null
      ? resolveTourPublicationStatus(tour.id, publicationStatuses, { scheduleLoaded })
      : null;
  const isHidden =
    tour != null && isTourHiddenFromSite(tour.id, publicationStatuses, scheduleLoaded);

  useBrowserBackToHomeTours({
    enabled: tour != null && scheduleLoaded && !isHidden,
  });

  if (tour && scheduleStatus === 'loading') {
    return (
      <>
        <PageMeta
          title={`${SEO_DEFAULTS.siteName}`}
          description={UI.tourDetail.loadingPublicationCatalog}
          path={buildTourDetailPath(tour.season, tour.id)}
          robots="noindex,nofollow"
        />
        <div
          className="min-h-screen flex items-center justify-center"
          aria-busy="true"
          aria-live="polite"
        >
          <p className="text-text-muted">{UI.tourDetail.loadingPublicationCatalog}</p>
        </div>
      </>
    );
  }

  if (tour && scheduleStatus === 'error') {
    return (
      <>
        <PageMeta
          title={`${UI.tourDetail.notFound} | ${SEO_DEFAULTS.siteName}`}
          description={UI.tourDetail.scheduleLoadError}
          path={buildTourDetailPath(tour.season, tour.id)}
          robots="noindex,nofollow"
        />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <ScrollScrubFade as="h1" className="font-heading text-section font-normal text-text-primary mb-4">
              {UI.tourDetail.notFound}
            </ScrollScrubFade>
            <p className="text-text-muted mb-6">{UI.tourDetail.scheduleLoadError}</p>
            <button type="button" onClick={retry} className="btn-cta-tour">
              <span>{UI.tourCalendar.retryLoad}</span>
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!tour || isHidden) {
    const notFoundBody = UI.tourDetail.notFoundWithId.replace("{id}", tourId);
    const notFoundPath =
      season.length > 0 && tourId.length > 0
        ? buildTourDetailPath(season as Season, tourId)
        : ROUTES.HOME;

    return (
      <>
        <PageMeta
          title={`${UI.tourDetail.notFound} | ${SEO_DEFAULTS.siteName}`}
          description={notFoundBody}
          path={notFoundPath}
          robots="noindex,nofollow"
        />
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
      </>
    );
  }

  if (season !== tour.season) {
    return <Navigate replace to={buildTourDetailPath(tour.season, tour.id)} />;
  }

  if (publicationStatus === 'in_development') {
    return <TourDetailPageInDevelopment tour={tour} />;
  }

  return <TourDetailPageFull tour={tour} />;
};

export default TourDetailPage;
