import ScrollScrubFade from "../shared/ScrollScrubFade";
import type { Season } from "../../types";

export interface TourDetailSectionHeadingProps {
  title: string;
  season: Season;
  className?: string;
  /** Заголовок карточки «Программа тура» — крупнее обычного. */
  size?: "default" | "program";
}

const ACCENT_BG: Record<Season, string> = {
  winter: "bg-season-accent-bar-winter",
  spring: "bg-season-accent-bar-spring",
  summer: "bg-season-accent-bar-summer",
  fall: "bg-season-accent-bar-fall",
};

const TourDetailSectionHeading = ({
  title,
  season,
  className = "",
  size = "default",
}: TourDetailSectionHeadingProps) => {
  const titleClass =
    size === "program"
      ? "font-heading text-tour-detail-program-heading font-normal text-text-primary"
      : "font-heading text-tour-detail-section font-normal text-text-primary";

  return (
    <div className={`tour-detail-section-heading-row ${className}`.trim()}>
      <span
        className={`tour-detail-section-heading-accent ${ACCENT_BG[season]}`}
        aria-hidden
      />
      <ScrollScrubFade as="h2" className={titleClass}>
        {title}
      </ScrollScrubFade>
    </div>
  );
};

export default TourDetailSectionHeading;
