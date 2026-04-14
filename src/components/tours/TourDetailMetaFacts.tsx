import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMountain } from '@fortawesome/free-solid-svg-icons/faMountain';
import { faRoute } from '@fortawesome/free-solid-svg-icons/faRoute';
import { faUsers } from '@fortawesome/free-solid-svg-icons/faUsers';
import { UI } from "../../constants/ui";
import type { Tour } from "../../types";

const DIFFICULTY_TEXT_FG: Record<Tour["difficulty"], string> = {
  Easy: "text-difficulty-easy-fg",
  Medium: "text-difficulty-medium-fg",
  Hard: "text-difficulty-hard-fg",
  Expert: "text-difficulty-expert-fg",
};

export interface TourDetailMetaFactsProps {
  duration: string;
  difficulty: Tour["difficulty"];
  metaAudienceLabel?: string;
  /** Крупный ряд под hero: ~1.3× к базовому мета (двойной размер минус 35%). */
  size?: "default" | "prominent";
}

const TourDetailMetaFacts = ({
  duration,
  difficulty,
  metaAudienceLabel,
  size = "default",
}: TourDetailMetaFactsProps) => {
  const metaTextClass =
    size === "prominent" ? "text-tour-detail-meta-prominent" : "text-tour-detail-meta";
  const rowGapClass = size === "prominent" ? "gap-4" : "gap-2.5";

  return (
  <section
    className="tour-detail-key-facts"
    aria-label={UI.tourDetail.tourMetaFactsAriaLabel}
  >
    <div
      className="tour-detail-key-facts__item tour-detail-key-facts__item--delay-0"
      aria-label={`${UI.tourDetail.metaLabelDuration}: ${duration}`}
    >
      <p className="tour-detail-key-facts__meta-title">
        {UI.tourDetail.metaDurationTitleAbove}
      </p>
      <span className={`group flex w-max max-w-full cursor-default items-center ${rowGapClass} font-semibold tabular-nums ${metaTextClass} text-text-primary transition-colors duration-hover hover:text-brand-primary`}>
        <FontAwesomeIcon
          icon={faRoute}
          className="shrink-0 text-brand-primary transition-colors duration-hover group-hover:text-brand-secondary"
          aria-hidden
        />
        {duration}
      </span>
    </div>
    <div
      className="tour-detail-key-facts__item tour-detail-key-facts__item--delay-1"
      aria-label={
        metaAudienceLabel != null && metaAudienceLabel.length > 0
          ? `${UI.tourDetail.metaAudienceTitleAbove}: ${metaAudienceLabel}`
          : `${UI.tourDetail.metaLabelDifficulty}: ${UI.difficulty.labels[difficulty]}`
      }
    >
      <p className="tour-detail-key-facts__meta-title">
        {metaAudienceLabel != null && metaAudienceLabel.length > 0
          ? UI.tourDetail.metaAudienceTitleAbove
          : UI.tourDetail.metaDifficultyTitleAbove}
      </p>
      <span
        className={
          metaAudienceLabel != null && metaAudienceLabel.length > 0
            ? `group flex w-max max-w-full cursor-default flex-wrap items-center ${rowGapClass} font-bold ${metaTextClass} text-text-primary transition-colors duration-hover hover:text-brand-primary`
            : `group flex w-max max-w-full cursor-default flex-wrap items-center ${rowGapClass} font-bold ${metaTextClass} transition-colors duration-hover hover:text-brand-primary ${DIFFICULTY_TEXT_FG[difficulty]}`
        }
      >
        <FontAwesomeIcon
          icon={
            metaAudienceLabel != null && metaAudienceLabel.length > 0
              ? faUsers
              : faMountain
          }
          className="shrink-0 transition-colors duration-hover group-hover:text-brand-secondary"
          aria-hidden
        />
        {metaAudienceLabel != null && metaAudienceLabel.length > 0
          ? metaAudienceLabel
          : UI.difficulty.labels[difficulty]}
      </span>
    </div>
  </section>
  );
};

export default TourDetailMetaFacts;
