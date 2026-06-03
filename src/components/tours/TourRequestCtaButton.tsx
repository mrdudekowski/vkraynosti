import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from '@fortawesome/free-solid-svg-icons/faArrowRight';
import { UI } from "../../constants/ui";
import type { Season } from "../../types";
import BrandWordmark from "../shared/BrandWordmark";

type TourRequestCtaButtonProps = {
  onClick: () => void;
  season: Season;
  className?: string;
};

/**
 * CTA заявки на тур: апельсиновый фон, светлый текст (`text.inverse`); при наведении —
 * чёрная заливка, логотип «Вкрайности» как в navbar и стрелка (см. `.btn-cta-tour--dual`).
 */
const TourRequestCtaButton = ({
  onClick,
  season,
  className = "",
}: TourRequestCtaButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`btn-cta-tour btn-cta-tour--dual inline-flex items-center justify-center text-center w-max max-w-full ${className}`}
    aria-label={UI.tourDetail.requestTourCta}
  >
    <span className="btn-cta-tour__layer">
      <span className="btn-cta-tour__default">{UI.tourDetail.requestTourCta}</span>
      <span className="btn-cta-tour__hover" aria-hidden>
        <span className="btn-cta-tour__hover-inner">
          <BrandWordmark season={season} size="nav" />
          <span className="btn-cta-tour__arrow" aria-hidden>
            <FontAwesomeIcon icon={faArrowRight} className="block h-4 w-4" />
          </span>
        </span>
      </span>
    </span>
  </button>
);

export default TourRequestCtaButton;
