import { type CSSProperties, type ReactNode, useRef } from 'react';
import { DOM_DATA_HOME_HERO_ACTIVE_SLIDE } from '../../constants/homeHeroSnap';
import { useHeroCarouselSwipe } from '../../hooks/useHeroCarouselSwipe';

/** Слайд героя: неактивные — `inert` (не `aria-hidden` на предке с фокусом у Link при смене слайда). */

interface CarouselSlideProps {
  backgroundUrl: string;
  backgroundSrcSet?: string;
  backgroundSizes?: string;
  isActive: boolean;
  /** Фон подгружается для активного слайда и для уже посещённых (родитель хранит множество индексов). */
  shouldLoadBackground: boolean;
  /** `background-position` при `background-size: cover` (см. `theme.extend.objectPosition`). */
  backgroundPosition?: string;
  backgroundClassName?: string;
  backgroundStyle?: CSSProperties;
  /** Клик по верхней зоне (фон) — следующий слайд; не перекрывает нижний блок с `Link`. */
  onAdvanceNext: () => void;
  onAdvancePrev: () => void;
  /** Свайп на touch при активном слайде; выключать при `prefers-reduced-motion`. */
  swipeEnabled: boolean;
  /** `aria-label` для кнопки верхней зоны (из `UI.hero`). */
  imageAdvanceAriaLabel: string;
  children: ReactNode;
}

const CarouselSlide = ({
  backgroundUrl,
  backgroundSrcSet,
  backgroundSizes,
  isActive,
  shouldLoadBackground,
  backgroundPosition = 'center',
  backgroundClassName,
  backgroundStyle,
  onAdvanceNext,
  onAdvancePrev,
  swipeEnabled,
  imageAdvanceAriaLabel,
  children,
}: CarouselSlideProps) => {
  const activeSlideProps =
    isActive === true
      ? { [DOM_DATA_HOME_HERO_ACTIVE_SLIDE]: 'true' as const }
      : undefined;

  const imageAdvanceRef = useRef<HTMLButtonElement>(null);

  useHeroCarouselSwipe(imageAdvanceRef, {
    enabled: isActive && swipeEnabled,
    onSwipeNext: onAdvanceNext,
    onSwipePrev: onAdvancePrev,
  });

  return (
    <div
      className={`absolute inset-0 ${
        isActive
          ? 'opacity-100 z-10'
          : 'opacity-0 z-0 pointer-events-none'
      } transition-opacity duration-carousel ease-standard motion-reduce:transition-none`}
      inert={!isActive}
      {...activeSlideProps}
    >
      {shouldLoadBackground ? (
        <img
          src={backgroundUrl}
          srcSet={backgroundSrcSet}
          sizes={backgroundSizes}
          alt=""
          aria-hidden
          className={`absolute inset-0 h-full w-full object-cover pointer-events-none ${backgroundClassName ?? ''}`.trim()}
          style={backgroundStyle ?? { objectPosition: backgroundPosition }}
          loading={isActive ? 'eager' : 'lazy'}
          fetchPriority={isActive ? 'high' : 'auto'}
          decoding="async"
        />
      ) : null}
      <div className="absolute inset-0 z-stack-base flex min-h-0 min-w-0 flex-col">
        <button
          ref={imageAdvanceRef}
          type="button"
          className="min-h-0 w-full flex-1 cursor-pointer border-0 bg-transparent p-0 max-lg:cursor-default focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          aria-label={imageAdvanceAriaLabel}
          onClick={onAdvanceNext}
        />
        <div className="relative flex shrink-0 flex-col items-center justify-end px-4 text-text-inverse">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CarouselSlide;
