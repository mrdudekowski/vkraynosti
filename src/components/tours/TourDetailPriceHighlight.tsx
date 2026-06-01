import { useMemo } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import type { Tour } from "../../types";
import { UI } from "../../constants/ui";
import TourDepartureMonthCalendar from "../tourDeparture/TourDepartureMonthCalendar";
import { useTourDisplayPrice } from "../../hooks/useTourDisplayPrice";
import { useTourSchedule } from "../../hooks/useTourSchedule";
import { useSyncedDepartureDisplayMonth } from "../../hooks/useSyncedDepartureDisplayMonth";
import { buildTourDepartureCalendarModel } from "../../utils/tourSchedule/buildTourDepartureCalendarModel";
import { buildTourDepartureEventsByDate } from "../../utils/tourSchedule/buildTourDepartureEventsByDate";
import { parseIsoDate } from "../../utils/tourSchedule/parseIsoDate";

const ACCENT_BG: Record<Tour['season'], string> = {
  winter: "bg-season-accent-bar-winter",
  spring: "bg-season-accent-bar-spring",
  summer: "bg-season-accent-bar-summer",
  fall: "bg-season-accent-bar-fall",
};

export interface TourDetailPriceHighlightProps {
  tour: Pick<Tour, "id" | "price" | "pricePrevious" | "priceFootnote" | "season">;
  className?: string;
  /** Дублирующий экземпляр: скрыть от вспомогательных технологий, если блок показан в другом месте. */
  ariaHidden?: boolean;
}

const formatDepartureDate = (isoDate: string): string =>
  format(parseIsoDate(isoDate), "d MMMM yyyy", { locale: ru });

/**
 * Акцентный блок стоимости и дат выездов (не в ряду мета под hero).
 */
const TourDetailPriceHighlight = ({
  tour,
  className = "",
  ariaHidden,
}: TourDetailPriceHighlightProps) => {
  const { status, events } = useTourSchedule();
  const { displayPrice, displayPricePrevious } = useTourDisplayPrice(tour);

  const tourEvents = useMemo(
    () => events.filter(event => event.tourId === tour.id),
    [events, tour.id]
  );

  const departureCalendar = useMemo(
    () => buildTourDepartureCalendarModel(tour.id, tourEvents),
    [tour.id, tourEvents]
  );

  const eventsByDate = useMemo(
    () => buildTourDepartureEventsByDate(tour.id, tourEvents),
    [tour.id, tourEvents]
  );

  const [displayMonth, setDisplayMonth] = useSyncedDepartureDisplayMonth(
    departureCalendar.focusMonth
  );

  const { futureDates } = departureCalendar;

  const ariaPrice =
    displayPricePrevious != null && displayPricePrevious.length > 0
      ? `${displayPrice}, ранее ${displayPricePrevious}`
      : displayPrice;

  const departuresAriaLabel =
    futureDates.length > 0
      ? `${UI.tourDetail.departuresHeading}: ${futureDates.map(formatDepartureDate).join(", ")}`
      : `${UI.tourDetail.departuresHeading}: ${UI.tourDetail.departuresEmpty}`;

  const note = tour.priceFootnote ?? UI.tourDetail.priceHighlightNote;
  const isDeparturesLoading = status === "loading" || status === "idle";

  return (
    <section
      className={`tour-detail-price-highlight ${className}`.trim()}
      aria-label={`${UI.tourDetail.priceHighlightAriaLabel}: ${ariaPrice}. ${departuresAriaLabel}`}
      aria-hidden={ariaHidden === true ? true : undefined}
    >
      <div
        className={`tour-detail-price-highlight__accent ${ACCENT_BG[tour.season]}`}
        aria-hidden
      />
      <p className="text-center font-heading text-tour-detail-prose font-normal text-text-muted sm:text-left">
        {UI.tourDetail.priceHighlightLead}
      </p>
      <p className="mt-3 text-center font-heading text-tour-detail-meta-price-prominent font-bold tabular-nums text-brand-primary sm:text-left">
        {displayPrice}
      </p>
      {displayPricePrevious != null && displayPricePrevious.length > 0 && (
        <p className="mt-1 text-center font-heading text-tour-detail-prose tabular-nums text-text-muted line-through sm:text-left">
          {displayPricePrevious}
        </p>
      )}
      <p className="mt-2 text-center text-tooltip text-text-muted sm:text-left">
        {note}
      </p>

      <div
        className="mt-6 border-t border-divider pt-6"
        aria-busy={isDeparturesLoading ? true : undefined}
      >
        <h3 className="text-center font-heading text-tour-detail-prose font-normal text-text-primary sm:text-left">
          {UI.tourDetail.departuresHeading}
        </h3>

        {isDeparturesLoading ? (
          <div
            className="mt-3 h-48 animate-pulse rounded bg-surface-dark/10"
            aria-label={UI.tourDetail.departuresLoadingAria}
          />
        ) : futureDates.length > 0 ? (
          <div className="mt-3">
            <TourDepartureMonthCalendar
              mode="display"
              departureDateSet={departureCalendar.departureDateSet}
              monthsWithDepartures={departureCalendar.monthsWithDepartures}
              displayMonth={displayMonth}
              onDisplayMonthChange={setDisplayMonth}
              season={tour.season}
              eventsByDate={eventsByDate}
            />
          </div>
        ) : (
          <p className="mt-3 text-center text-tooltip text-text-muted sm:text-left">
            {UI.tourDetail.departuresEmpty}
          </p>
        )}
      </div>
    </section>
  );
};

export default TourDetailPriceHighlight;
