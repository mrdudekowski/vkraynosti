import { useParams, Link, Navigate } from "react-router-dom";
import { getTourById } from "../data/toursData";
import {
  ROUTES,
  buildTourDetailPath,
} from "../constants/routes";
import { UI } from "../constants/ui";
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
  const { publicationStatuses, status: scheduleStatus } = useTourSchedule();
  const scheduleLoaded = scheduleStatus === 'success';
  const publicationStatus = tour
    ? resolveTourPublicationStatus(tour.id, publicationStatuses, tour.inDevelopment)
    : null;
  const isHidden =
    tour != null && isTourHiddenFromSite(tour.id, publicationStatuses, scheduleLoaded);

  useBrowserBackToHomeTours({ enabled: tour != null && !isHidden });

  if (!tour || isHidden) {
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

  if (publicationStatus === 'in_development') {
    return <TourDetailPageInDevelopment tour={tour} />;
  }

  return <TourDetailPageFull tour={tour} />;
};

export default TourDetailPage;
