import type { CSSProperties } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { UI } from "../../constants/ui";

type TourRequestCtaButtonProps = {
  onClick: () => void;
  className?: string;
};

const hoverWordChars = [...UI.tourDetail.requestTourCtaHoverWordmark];

function ctaLetterIndexStyle(index: number): CSSProperties {
  return { ["--cta-letter-index"]: String(index) } as CSSProperties;
}

/**
 * CTA заявки на тур: апельсиновый фон, светлый текст (`text.inverse`) → зелёный sweep; при наведении —
 * слово «Вкрайности» и стрелка появляются по буквам в такт заливке (см. `.btn-cta-tour--dual`).
 */
const TourRequestCtaButton = ({
  onClick,
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
          {hoverWordChars.map((char, index) => (
            <span
              key={`${char}-${index}`}
              className="btn-cta-tour__letter"
              style={ctaLetterIndexStyle(index)}
            >
              {char}
            </span>
          ))}
          <span
            className="btn-cta-tour__arrow"
            style={ctaLetterIndexStyle(hoverWordChars.length)}
            aria-hidden
          >
            <FontAwesomeIcon icon={faArrowRight} className="block h-4 w-4" />
          </span>
        </span>
      </span>
    </span>
  </button>
);

export default TourRequestCtaButton;
