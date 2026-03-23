import type { ReactNode } from 'react';

/** Слайд героя: неактивные — `inert` (не `aria-hidden` на предке с фокусом у Link при смене слайда). */

interface CarouselSlideProps {
  backgroundUrl: string;
  isActive: boolean;
  children: ReactNode;
}

const CarouselSlide = ({ backgroundUrl, isActive, children }: CarouselSlideProps) => (
  <div
    className={`absolute inset-0 transition-opacity duration-carousel ${
      isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
    }`}
    style={{
      backgroundImage: `url(${backgroundUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}
    inert={!isActive}
  >
    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/60" />
    <div className="relative z-10 h-full flex flex-col items-center justify-end text-text-inverse px-4">
      {children}
    </div>
  </div>
);

export default CarouselSlide;
