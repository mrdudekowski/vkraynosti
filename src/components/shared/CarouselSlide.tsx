import { type ReactNode } from 'react';
import { DOM_DATA_HOME_HERO_ACTIVE_SLIDE } from '../../constants/homeHeroSnap';

/** Слайд героя: неактивные — `inert` (не `aria-hidden` на предке с фокусом у Link при смене слайда). */

interface CarouselSlideProps {
  backgroundUrl: string;
  isActive: boolean;
  /** Фон подгружается для активного слайда и для уже посещённых (родитель хранит множество индексов). */
  shouldLoadBackground: boolean;
  /** `background-position` при `background-size: cover` (см. `theme.extend.objectPosition`). */
  backgroundPosition?: string;
  children: ReactNode;
}

const CarouselSlide = ({
  backgroundUrl,
  isActive,
  shouldLoadBackground,
  backgroundPosition = 'center',
  children,
}: CarouselSlideProps) => {
  const activeSlideProps =
    isActive === true
      ? { [DOM_DATA_HOME_HERO_ACTIVE_SLIDE]: 'true' as const }
      : undefined;

  return (
    <div
      className={`absolute inset-0 ${
        isActive
          ? 'opacity-100 z-10'
          : 'opacity-0 z-0 pointer-events-none'
      } transition-opacity duration-carousel ease-standard motion-reduce:transition-none`}
      style={
        shouldLoadBackground
          ? {
              backgroundImage: `url(${backgroundUrl})`,
              backgroundSize: 'cover',
              backgroundPosition,
              backgroundRepeat: 'no-repeat',
            }
          : undefined
      }
      inert={!isActive}
      {...activeSlideProps}
    >
      <div className="relative z-10 h-full flex flex-col items-center justify-end text-text-inverse px-4">
        {children}
      </div>
    </div>
  );
};

export default CarouselSlide;
