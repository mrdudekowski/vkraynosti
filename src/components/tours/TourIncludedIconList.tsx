import {
  useCallback,
  useRef,
  useState,
  type FocusEvent,
  type PointerEvent,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Season, TourIncludedItem } from "../../types";
import {
  TOUR_INCLUDED_HOVER_DROP_SHADOW_CLASS,
  TOUR_INCLUDED_ICON_ACTIVE_TEXT_CLASS,
} from "../../constants/tourIncludedHover";
import {
  useFinePointerHover,
  useTourIncludedActiveItem,
} from "../../hooks/useTourIncludedActiveItem";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { useTourIncludedDescriptionFade } from "../../hooks/useTourIncludedDescriptionFade";

export type TourIncludedIconListProps = {
  tourId: string;
  season: Season;
  items: TourIncludedItem[];
};

type TourIncludedIconButtonProps = {
  season: Season;
  item: TourIncludedItem;
  idx: number;
  isActive: boolean;
  finePointerHover: boolean;
  onActivate: (idx: number) => void;
  onToggleOrActivate: (idx: number) => void;
  onBlurFromList: (e: FocusEvent<HTMLButtonElement>) => void;
};

function TourIncludedIconButton({
  season,
  item,
  idx,
  isActive,
  finePointerHover,
  onActivate,
  onToggleOrActivate,
  onBlurFromList,
}: TourIncludedIconButtonProps) {
  return (
    <li className="shrink-0">
      <button
        type="button"
        className="tour-included-icon-btn text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-tourIncludedIconStrip"
        aria-pressed={isActive}
        aria-label={item.text}
        onPointerEnter={() => {
          if (finePointerHover) onActivate(idx);
        }}
        onClick={() => {
          if (!finePointerHover) onToggleOrActivate(idx);
        }}
        onFocus={(e) => {
          if (e.currentTarget.matches(":focus-visible")) {
            onActivate(idx);
          }
        }}
        onBlur={onBlurFromList}
      >
        <span className="inline-flex h-tour-included-icon-slot-horizontal w-tour-included-icon-slot-horizontal items-center justify-center overflow-visible">
          <FontAwesomeIcon
            icon={item.icon}
            className={
              isActive
                ? `text-tour-detail-included-icon-active-horizontal ${TOUR_INCLUDED_ICON_ACTIVE_TEXT_CLASS[season]} ${TOUR_INCLUDED_HOVER_DROP_SHADOW_CLASS[season]} motion-safe:transition-[font-size,drop-shadow,color] motion-safe:duration-tour-included motion-safe:ease-out`
                : "text-tour-detail-included-icon-idle-horizontal text-text-primary motion-safe:transition-[font-size,drop-shadow,color] motion-safe:duration-tour-included motion-safe:ease-out"
            }
            aria-hidden
          />
        </span>
      </button>
    </li>
  );
}

const TourIncludedIconList = ({
  tourId,
  season,
  items,
}: TourIncludedIconListProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const finePointerHover = useFinePointerHover();
  const [pointerInside, setPointerInside] = useState(false);
  const [focusInside, setFocusInside] = useState(false);
  const interactionPaused = pointerInside || focusInside;
  const { activeIndex, activate, scheduleExit, toggleOrActivate } =
    useTourIncludedActiveItem(items.length, interactionPaused);

  const handleContainerPointerEnter = useCallback(() => {
    setPointerInside(true);
  }, []);

  const handleContainerFocus = useCallback((e: FocusEvent<HTMLDivElement>) => {
    const t = e.target;
    if (t instanceof Node && containerRef.current?.contains(t)) {
      setFocusInside(true);
    }
  }, []);

  const handleContainerBlur = useCallback((e: FocusEvent<HTMLDivElement>) => {
    const next = e.relatedTarget;
    if (
      next instanceof Node &&
      containerRef.current?.contains(next)
    ) {
      return;
    }
    setFocusInside(false);
  }, []);

  const handleRowBlur = useCallback(
    (e: FocusEvent<HTMLButtonElement>) => {
      const next = e.relatedTarget;
      if (
        next instanceof Node &&
        containerRef.current?.contains(next)
      ) {
        return;
      }
      scheduleExit();
    },
    [scheduleExit]
  );

  const handleContainerPointerLeave = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      const rt = e.relatedTarget;
      const stillInside =
        rt instanceof Node &&
        containerRef.current != null &&
        containerRef.current.contains(rt);
      if (stillInside) return;
      setPointerInside(false);
      if (!finePointerHover) return;
      scheduleExit();
    },
    [finePointerHover, scheduleExit]
  );

  const activeText =
    activeIndex !== null && items[activeIndex] != null
      ? items[activeIndex].text
      : null;

  const reducedMotion = usePrefersReducedMotion();
  const { displayText, isVisible, handleTransitionEnd } =
    useTourIncludedDescriptionFade(activeText, reducedMotion);

  return (
    <div
      ref={containerRef}
      className="flex min-w-0 flex-col gap-y-tour-included-horizontal-stack"
      onPointerEnter={handleContainerPointerEnter}
      onPointerLeave={handleContainerPointerLeave}
      onFocus={handleContainerFocus}
      onBlur={handleContainerBlur}
    >
      <div className="tour-included-icon-strip">
        <ul
          role="list"
          className="flex min-w-0 w-full list-none flex-row flex-wrap justify-center gap-x-tour-included-icon-row-horizontal-gap gap-y-tour-included-icon-row-horizontal-gap p-0"
        >
          {items.map((item, idx) => (
            <TourIncludedIconButton
              key={`${tourId}-included-${idx}`}
              season={season}
              item={item}
              idx={idx}
              isActive={activeIndex === idx}
              finePointerHover={finePointerHover}
              onActivate={activate}
              onToggleOrActivate={toggleOrActivate}
              onBlurFromList={handleRowBlur}
            />
          ))}
        </ul>
      </div>
      <div
        className="min-h-tour-included-description w-full"
        aria-live="polite"
        aria-atomic="true"
      >
        <p
          className={
            isVisible && displayText !== null
              ? "text-center text-tour-detail-prose text-text-muted motion-safe:transition-opacity motion-safe:duration-tour-included-description-fade motion-safe:ease-out motion-reduce:transition-none opacity-100"
              : "pointer-events-none select-none text-center text-tour-detail-prose text-text-muted motion-safe:transition-opacity motion-safe:duration-tour-included-description-fade motion-safe:ease-out motion-reduce:transition-none opacity-0"
          }
          onTransitionEnd={handleTransitionEnd}
        >
          {displayText ?? "\u00a0"}
        </p>
      </div>
    </div>
  );
};

export default TourIncludedIconList;
