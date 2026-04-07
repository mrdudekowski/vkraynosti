import type { Season } from "../../types";
import { UI } from "../../constants/ui";

const ACCENT_BG: Record<Season, string> = {
  winter: "bg-season-accent-bar-winter",
  spring: "bg-season-accent-bar-spring",
  summer: "bg-season-accent-bar-summer",
  fall: "bg-season-accent-bar-fall",
};

export interface TourDetailPriceHighlightProps {
  price: string;
  pricePrevious?: string;
  /** См. `Tour.priceFootnote`. */
  footnote?: string;
  season: Season;
  className?: string;
  /** Дублирующий экземпляр: скрыть от вспомогательных технологий, если блок показан в другом месте. */
  ariaHidden?: boolean;
}

/**
 * Отдельный акцентный блок стоимости (не в ряду мета под hero).
 */
const TourDetailPriceHighlight = ({
  price,
  pricePrevious,
  footnote,
  season,
  className = "",
  ariaHidden,
}: TourDetailPriceHighlightProps) => {
  const ariaPrice =
    pricePrevious != null && pricePrevious.length > 0
      ? `${price}, ранее ${pricePrevious}`
      : price;
  const note = footnote ?? UI.tourDetail.priceHighlightNote;

  return (
  <section
    className={`tour-detail-price-highlight ${className}`.trim()}
    aria-label={`${UI.tourDetail.priceHighlightAriaLabel}: ${ariaPrice}`}
    aria-hidden={ariaHidden === true ? true : undefined}
  >
    <div
      className={`tour-detail-price-highlight__accent ${ACCENT_BG[season]}`}
      aria-hidden
    />
    <p className="text-center font-heading text-tour-detail-prose font-normal text-text-muted sm:text-left">
      {UI.tourDetail.priceHighlightLead}
    </p>
    <p className="mt-3 text-center font-heading text-tour-detail-meta-price-prominent font-bold tabular-nums text-brand-primary sm:text-left">
      {price}
    </p>
    {pricePrevious != null && pricePrevious.length > 0 && (
      <p className="mt-1 text-center font-heading text-tour-detail-prose tabular-nums text-text-muted line-through sm:text-left">
        {pricePrevious}
      </p>
    )}
    <p className="mt-2 text-center text-tooltip text-text-muted sm:text-left">
      {note}
    </p>
  </section>
  );
};

export default TourDetailPriceHighlight;
