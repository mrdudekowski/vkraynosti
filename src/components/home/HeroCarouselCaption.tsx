import { UI } from '../../constants/ui';

export type HeroCarouselCaptionGutter = 'phone' | 'lg' | 'responsive';

const GUTTER_CLASS: Record<HeroCarouselCaptionGutter, string> = {
  phone: 'px-12 pb-24',
  lg: 'px-home-hero-carousel-text-gutter-x pb-24',
  responsive: 'px-12 pb-24 sm:px-8 md:px-6 lg:px-home-hero-carousel-text-gutter-x',
};

export const HERO_CAROUSEL_CAPTION_STACK_CLASS =
  'text-center flex min-w-0 w-full max-w-full flex-col items-center gap-hero-phrase-cta-gap';

type HeroCarouselCaptionBodyProps = {
  phrase: string;
};

export const HeroCarouselCaptionBody = ({ phrase }: HeroCarouselCaptionBodyProps) => (
  <>
    <p className="font-hero-carousel-phrase text-home-hero-carousel-phrase font-normal text-text-inverse hero-carousel-phrase-text-shadow w-full min-w-0 max-w-full hyphens-none text-balance">
      {phrase}
    </p>
    <span className="btn-primary text-base">{UI.hero.viewTour}</span>
  </>
);

type HeroCarouselCaptionProps = {
  phrase: string;
  gutter: HeroCarouselCaptionGutter;
};

/** Подпись и CTA hero, как в `CarouselSlide`: низ кадра, те же отступы. */
export const HeroCarouselCaption = ({ phrase, gutter }: HeroCarouselCaptionProps) => (
  <div className="flex h-full min-h-0 w-full flex-col">
    <div className="min-h-0 w-full flex-1" aria-hidden />
    <div className="relative flex shrink-0 flex-col items-center justify-end px-4 text-text-inverse">
      <div
        className={`flex w-full max-w-home-hero-phrase mx-auto justify-center ${GUTTER_CLASS[gutter]}`}
      >
        <div className={HERO_CAROUSEL_CAPTION_STACK_CLASS}>
          <HeroCarouselCaptionBody phrase={phrase} />
        </div>
      </div>
    </div>
  </div>
);
