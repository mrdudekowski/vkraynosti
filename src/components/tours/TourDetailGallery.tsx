import { type ReactNode } from 'react';
import PlaceholderImage from '../shared/PlaceholderImage';
import { TOUR_WINTER_1_REST4_IMAGE, TOUR_WINTER_1_TOP_IMAGE } from '../../constants/images';
import { UI } from '../../constants/ui';

export type TourGalleryLayoutVariant = 'default' | 'izubrinaya';

export interface TourDetailGalleryProps {
  /** Кадры для сетки (без главного фото hero страницы). */
  images: string[];
  /** Индекс в полном `tour.galleryImages` для `images[0]` (обычно `1`). */
  firstImageIndexInTourGallery: number;
  tourTitle: string;
  /** Индекс в полном `tour.galleryImages` (для полноэкранного просмотра и стрелок). */
  onOpenPhoto: (indexInFullGallery: number) => void;
  layoutVariant?: TourGalleryLayoutVariant;
}

const openAriaForHumanNumber = (humanNumber: string) =>
  UI.tourDetail.galleryPhoto.openPhotoAria.replace('{n}', humanNumber);

const TourDetailGallery = ({
  images,
  firstImageIndexInTourGallery,
  tourTitle,
  onOpenPhoto,
  layoutVariant = 'default',
}: TourDetailGalleryProps) => {
  if (images.length === 0) return null;

  let staggerCount = 0;

  /** `aspect-gallery-hero-lifted` ≈ +30% высоты к `gallery-hero` (см. tailwind). */
  const tileClassesWithWinterHeroLift = (tileClassName: string, imageSrc: string) => {
    if (imageSrc === TOUR_WINTER_1_REST4_IMAGE) {
      return tileClassName.replace(/\baspect-gallery-hero\b/g, 'aspect-gallery-hero-lifted');
    }
    return tileClassName;
  };

  const imgClassesForWinterFraming = (imageSrc: string) =>
    imageSrc === TOUR_WINTER_1_REST4_IMAGE ? 'object-gallery-winter-rest4' : '';

  const renderTileButton = (src: string, indexInGrid: number, tileClassName: string) => {
    const idxInTour = firstImageIndexInTourGallery + indexInGrid;
    const humanN = String(idxInTour + 1);
    const resolvedTileClass = tileClassesWithWinterHeroLift(tileClassName, src);
    const imgExtra = imgClassesForWinterFraming(src);
    const staggerIndex = staggerCount++;
    const isFirstTile = staggerIndex === 0;
    const deferSrcUntilVisible = !isFirstTile;

    const tileAlt = `${tourTitle} — фото ${humanN}`;

    return (
      <button
        key={`${src}-${indexInGrid}`}
        type="button"
        className={`cursor-pointer overflow-hidden rounded-card border-0 bg-transparent p-0 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary ${resolvedTileClass}`}
        aria-label={openAriaForHumanNumber(humanN)}
        onClick={() => onOpenPhoto(idxInTour)}
      >
        <PlaceholderImage
          src={src}
          alt={tileAlt}
          className="h-full w-full"
          imgClassName={imgExtra}
          loading={isFirstTile ? 'eager' : 'lazy'}
          fetchPriority={isFirstTile ? 'high' : undefined}
          deferSrcUntilVisible={deferSrcUntilVisible}
        />
      </button>
    );
  };

  const renderRestGrid = (rest: string[], indexOffset: number) => {
    if (rest.length === 0) return null;
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-gallery-gap">
        {rest.map((src, i) =>
          renderTileButton(src, indexOffset + i, 'aspect-square w-full')
        )}
      </div>
    );
  };

  /** Паттерн A: панорама + квадрат, затем два ряда по два квадрата. */
  const renderIzubrinayaRestSixA = (rest: string[], indexOffset: number) => (
    <div className="flex flex-col gap-gallery-gap">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-gallery-gap">
        {renderTileButton(rest[0], indexOffset, 'sm:col-span-2 aspect-gallery-hero w-full')}
        {renderTileButton(rest[1], indexOffset + 1, 'aspect-square w-full')}
      </div>
      <div className="grid grid-cols-2 gap-gallery-gap">
        {renderTileButton(rest[2], indexOffset + 2, 'aspect-square w-full')}
        {renderTileButton(rest[3], indexOffset + 3, 'aspect-square w-full')}
      </div>
      <div className="grid grid-cols-2 gap-gallery-gap">
        {renderTileButton(rest[4], indexOffset + 4, 'aspect-square w-full')}
        {renderTileButton(rest[5], indexOffset + 5, 'aspect-square w-full')}
      </div>
    </div>
  );

  /** Паттерн B: три квадрата в ряд, затем панорама + квадрат. */
  const renderIzubrinayaRestSixB = (rest: string[], indexOffset: number) => (
    <div className="flex flex-col gap-gallery-gap">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-gallery-gap">
        {renderTileButton(rest[0], indexOffset, 'aspect-square w-full')}
        {renderTileButton(rest[1], indexOffset + 1, 'aspect-square w-full')}
        {renderTileButton(rest[2], indexOffset + 2, 'aspect-square w-full')}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-gallery-gap">
        {renderTileButton(rest[3], indexOffset + 3, 'sm:col-span-2 aspect-gallery-hero w-full')}
        {renderTileButton(rest[4], indexOffset + 4, 'aspect-square w-full')}
      </div>
      {renderTileButton(rest[5], indexOffset + 5, 'aspect-gallery-hero w-full')}
    </div>
  );

  /** Оставшиеся кадры после портрета и первого bento: вариативные блоки, чанки по 6 с чередованием A/B. */
  const renderIzubrinayaRemainder = (
    rest: string[],
    indexOffset: number,
    chunkIndex = 0
  ): ReactNode => {
    const n = rest.length;
    if (n === 0) return null;

    if (n === 1) {
      return renderTileButton(rest[0], indexOffset, 'aspect-gallery-hero w-full');
    }

    if (n === 2) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-gallery-gap">
          {renderTileButton(rest[0], indexOffset, 'sm:col-span-2 aspect-gallery-hero w-full')}
          {renderTileButton(rest[1], indexOffset + 1, 'aspect-square w-full')}
        </div>
      );
    }

    if (n === 3) {
      return (
        <div className="flex flex-col gap-gallery-gap">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-gallery-gap">
            {renderTileButton(rest[0], indexOffset, 'sm:col-span-2 aspect-gallery-hero w-full')}
            {renderTileButton(rest[1], indexOffset + 1, 'aspect-square w-full')}
          </div>
          {renderTileButton(rest[2], indexOffset + 2, 'aspect-gallery-hero w-full')}
        </div>
      );
    }

    if (n === 4) {
      /** Зимний тур без `iz.pan`: `iz.top` — одна строка по центру (без пустого места слева от бывшей панорамы). */
      if (rest[0] === TOUR_WINTER_1_TOP_IMAGE) {
        return (
          <div className="flex flex-col gap-gallery-gap">
            <div className="flex w-full justify-center">
              {renderTileButton(
                rest[0],
                indexOffset,
                'w-full max-w-md sm:max-w-lg aspect-gallery-portrait mx-auto shrink-0'
              )}
            </div>
            <div className="grid grid-cols-2 gap-gallery-gap">
              {renderTileButton(rest[1], indexOffset + 1, 'aspect-square w-full')}
              {renderTileButton(rest[2], indexOffset + 2, 'aspect-square w-full')}
            </div>
            {renderTileButton(rest[3], indexOffset + 3, 'aspect-gallery-hero w-full')}
          </div>
        );
      }
      return (
        <div className="flex flex-col gap-gallery-gap">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-gallery-gap">
            {renderTileButton(rest[0], indexOffset, 'sm:col-span-2 aspect-gallery-hero w-full')}
            {renderTileButton(rest[1], indexOffset + 1, 'aspect-square w-full')}
          </div>
          <div className="grid grid-cols-2 gap-gallery-gap">
            {renderTileButton(rest[2], indexOffset + 2, 'aspect-square w-full')}
            {renderTileButton(rest[3], indexOffset + 3, 'aspect-square w-full')}
          </div>
        </div>
      );
    }

    if (n === 5) {
      const firstRowTopStretch = rest[1] === TOUR_WINTER_1_TOP_IMAGE;
      return (
        <div className="flex flex-col gap-gallery-gap">
          <div
            className={`grid grid-cols-1 sm:grid-cols-3 gap-gallery-gap${firstRowTopStretch ? ' sm:items-stretch' : ''}`}
          >
            {renderTileButton(rest[0], indexOffset, 'sm:col-span-2 aspect-gallery-hero w-full')}
            {renderTileButton(
              rest[1],
              indexOffset + 1,
              firstRowTopStretch
                ? 'sm:col-span-1 min-h-0 h-full w-full sm:aspect-auto sm:self-stretch aspect-gallery-portrait'
                : 'aspect-square w-full'
            )}
          </div>
          <div className="grid grid-cols-2 gap-gallery-gap">
            {renderTileButton(rest[2], indexOffset + 2, 'aspect-square w-full')}
            {renderTileButton(rest[3], indexOffset + 3, 'aspect-square w-full')}
          </div>
          {renderTileButton(rest[4], indexOffset + 4, 'aspect-gallery-hero w-full')}
        </div>
      );
    }

    if (n === 6) {
      return chunkIndex % 2 === 0
        ? renderIzubrinayaRestSixA(rest, indexOffset)
        : renderIzubrinayaRestSixB(rest, indexOffset);
    }

    return (
      <div className="flex flex-col gap-gallery-gap">
        {chunkIndex % 2 === 0
          ? renderIzubrinayaRestSixA(rest.slice(0, 6), indexOffset)
          : renderIzubrinayaRestSixB(rest.slice(0, 6), indexOffset)}
        {renderIzubrinayaRemainder(rest.slice(6), indexOffset + 6, chunkIndex + 1)}
      </div>
    );
  };

  if (layoutVariant === 'izubrinaya') {
    return (
      <div className="flex flex-col gap-gallery-gap">
        {renderTileButton(images[0], 0, 'aspect-gallery-portrait w-full')}

        {images.length >= 4 && (
          <div className="grid grid-cols-2 gap-gallery-gap">
            {renderTileButton(
              images[1],
              1,
              'col-start-1 row-span-2 row-start-1 h-full min-h-0 w-full'
            )}
            {renderTileButton(images[2], 2, 'col-start-2 row-start-1 aspect-square w-full')}
            {renderTileButton(images[3], 3, 'col-start-2 row-start-2 aspect-square w-full')}
          </div>
        )}

        {images.length === 2 &&
          renderTileButton(images[1], 1, 'aspect-gallery-hero w-full')}
        {images.length === 3 && (
          <div className="grid grid-cols-2 gap-gallery-gap">
            {renderTileButton(images[1], 1, 'aspect-square w-full')}
            {renderTileButton(images[2], 2, 'aspect-square w-full')}
          </div>
        )}

        {images.length > 4 && renderIzubrinayaRemainder(images.slice(4), 4)}
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className="flex flex-col gap-gallery-gap">
        {renderTileButton(images[0], 0, 'aspect-gallery-hero w-full')}
      </div>
    );
  }

  const heroSrc = images[0];
  const rest = images.slice(1);

  return (
    <div className="flex flex-col gap-gallery-gap">
      {renderTileButton(heroSrc, 0, 'aspect-gallery-hero w-full')}
      {renderRestGrid(rest, 1)}
    </div>
  );
};

export default TourDetailGallery;
