import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons/faCircleQuestion';
import type { Tour } from "../types";
import { buildHomeSectionPath } from "../constants/routes";
import { UI } from "../constants/ui";
import { getTourGalleryGridUrls } from "../utils/tourGalleryUrls";
import PageMeta from "../components/shared/PageMeta";
import TourDetailHero from "../components/tours/TourDetailHero";
import TourDetailInDevelopmentContent from "../components/tours/TourDetailInDevelopmentContent";
import SeasonPageBackdrop from "../components/seasons/SeasonPageBackdrop";
import { BREAKPOINT_LG_PX } from "../constants/reveal";
import { useMatchMinWidth } from "../hooks/useMatchMinWidth";
import { useModal } from "../context/useModal";
import { useTourDisplayDuration } from "../hooks/useTourDisplayDuration";
import { resolveTourHeroImageUrl } from "../utils/getTourPrefaceBackgroundUrl";
import {
  getTourBreadcrumbSchema,
  getTourSeoEntry,
  getTourStructuredData,
} from "../constants/seo";

type TourDetailPageInDevelopmentProps = {
  tour: Tour;
};

const TourDetailPageInDevelopment = ({ tour }: TourDetailPageInDevelopmentProps) => {
  const { openTourRequestModal } = useModal();
  const isLgOrAbove = useMatchMinWidth(BREAKPOINT_LG_PX);
  const { displayDuration, durationType } = useTourDisplayDuration(tour);
  const gridGalleryUrls = getTourGalleryGridUrls(tour);
  const heroImageUrl = resolveTourHeroImageUrl({
    tour,
    gridGalleryUrls,
    isLgOrAbove,
  });

  const handleOpenTourRequest = () => {
    openTourRequestModal({
      tourId: tour.id,
      title: tour.title,
      subtitle: tour.subtitle,
      season: tour.season,
      ...(durationType != null ? { tourDuration: durationType } : {}),
    });
  };

  const seoEntry = getTourSeoEntry(tour, {
    displayDuration,
    publicationStatus: 'in_development',
  });
  const tourStructuredData = getTourStructuredData(tour, {
    displayDuration,
    publicationStatus: 'in_development',
  });
  const breadcrumbStructuredData = getTourBreadcrumbSchema(tour);

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
      />

      <div className="tour-detail-page-gutter">
        <div className="tour-detail-page-inner">
          <TourDetailInDevelopmentContent tour={tour} isLgOrAbove={isLgOrAbove} />

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

export default TourDetailPageInDevelopment;
