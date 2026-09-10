import { UI } from '../../constants/ui';
import type { Tour } from '../../types';
import TourDetailPriceHighlight from './TourDetailPriceHighlight';
import TourDetailSectionHeading from './TourDetailSectionHeading';

type TourDetailInDevelopmentContentProps = {
  tour: Tour;
  isLgOrAbove: boolean;
};

const TourDetailInDevelopmentContent = ({
  tour,
  isLgOrAbove,
}: TourDetailInDevelopmentContentProps) => {
  const priceHighlightProps = {
    tour,
    forceDeparturesEmpty: true,
    preferCatalogPrice: false,
  } as const;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-x-0">
        <div className="lg:col-span-2 tour-detail-main-column min-w-0">
          <section
            data-testid="tour-detail-in-development"
            aria-label={UI.tourDetail.inDevelopmentPageAriaLabel}
          >
            <h2 className="font-brand-wordmark text-tour-detail-in-development-title text-brand-primary text-balance">
              {UI.tourDetail.inDevelopmentHeading}
            </h2>
          </section>
          <div className="hidden lg:mt-10 lg:block">
            <TourDetailPriceHighlight
              {...priceHighlightProps}
              ariaHidden={!isLgOrAbove}
            />
          </div>
        </div>

        <div>
          <div className="tour-detail-program-card">
            <TourDetailSectionHeading
              title={UI.tourDetail.programHeading}
              season={tour.season}
              size="program"
              className="mb-4"
            />
            <p className="text-tour-detail-program-body text-text-muted">
              {UI.tourDetail.programInDevelopment}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10 lg:hidden">
        <TourDetailPriceHighlight
          {...priceHighlightProps}
          ariaHidden={isLgOrAbove}
        />
      </div>
    </>
  );
};

export default TourDetailInDevelopmentContent;
