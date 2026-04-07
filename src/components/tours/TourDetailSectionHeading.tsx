import type { Season } from "../../types";

export interface TourDetailSectionHeadingProps {
  title: string;
  season: Season;
  className?: string;
  /** Заголовок карточки «Программа тура» — крупнее обычного. */
  size?: "default" | "program";
}

const ACCENT_BG: Record<Season, string> = {
  winter: "bg-season-winter",
  spring: "bg-season-spring",
  summer: "bg-season-summer",
  fall: "bg-season-fall",
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
      <h2 className={titleClass}>{title}</h2>
    </div>
  );
};

export default TourDetailSectionHeading;
