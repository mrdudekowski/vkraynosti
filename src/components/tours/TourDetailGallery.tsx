import { memo, type ReactNode } from 'react';
import PlaceholderImage from '../shared/PlaceholderImage';
import GalleryGridVideo from './GalleryGridVideo';
import {
  TOUR_SPRING_2_LAKE1_IMAGE,
  TOUR_SPRING_3_GROUP_IMAGE,
  TOUR_SPRING_4_GROUP_IMAGE,
  TOUR_SPRING_5_GROUP_IMAGE,
  TOUR_SPRING_6_GROUP_IMAGE,
  TOUR_WINTER_1_REST4_IMAGE,
  TOUR_WINTER_1_TOP_IMAGE,
  TOUR_WINTER_2_PEAK_IMAGE,
  TOUR_WINTER_3_CLIP1_VIDEO,
  TOUR_WINTER_3_CLIP2_VIDEO,
  TOUR_WINTER_3_CLIP3_VIDEO,
  TOUR_WINTER_3_LIFT_IMAGE,
  TOUR_WINTER_4_CLIP1_VIDEO,
  TOUR_WINTER_4_DOGGO_IMAGE,
  TOUR_WINTER_4_DOGGOS_IMAGE,
  TOUR_WINTER_4_GORA_IMAGE,
  TOUR_SPRING_10_VIEW2_GRID,
  TOUR_SPRING_10_VIEW3_GRID,
} from '../../constants/images';
import { isVideoAssetUrl } from '../../utils/isVideoAssetUrl';
import type { TourGalleryLayoutVariant } from '../../constants/tourGalleryLayoutVariant';
import {
  GALLERY_GRID_BENTO_LEFT_BOTTOM_SQUARE,
  GALLERY_GRID_BENTO_LEFT_TOP_SQUARE,
  GALLERY_GRID_BENTO_RIGHT_BOTTOM_SQUARE,
  GALLERY_GRID_BENTO_RIGHT_TOP_SQUARE,
  GALLERY_GRID_BENTO_TALL_LEFT,
  GALLERY_GRID_BENTO_TALL_RIGHT,
  GALLERY_GRID_FULL_WIDTH_SQUARE,
  GALLERY_GRID_SQUARE_TILE,
} from '../../constants/tourDetailGalleryGridClasses';

export type { TourGalleryLayoutVariant } from '../../constants/tourGalleryLayoutVariant';

export interface TourDetailGalleryProps {
  /** Кадры для сетки (без главного фото hero страницы). */
  images: string[];
  tourTitle: string;
  layoutVariant?: TourGalleryLayoutVariant;
  /** Уменьшить движение: в сетке только постер для видео. */
  prefersReducedMotion?: boolean;
  /** Постер webp для grid-webm по URL сетки (например winter-3). */
  getVideoPosterForGridSrc?: (gridSrc: string) => string | undefined;
}

const TourDetailGalleryComponent = ({
  images,
  tourTitle,
  layoutVariant = 'default',
  prefersReducedMotion = false,
  getVideoPosterForGridSrc,
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

  const imgClassesForWinterFraming = (imageSrc: string) => {
    if (imageSrc === TOUR_WINTER_1_REST4_IMAGE) return 'object-gallery-winter-rest4';
    if (imageSrc === TOUR_WINTER_4_GORA_IMAGE) return 'object-gallery-winter-4-gora';
    if (imageSrc === TOUR_SPRING_10_VIEW2_GRID || imageSrc === TOUR_SPRING_10_VIEW3_GRID) {
      return 'object-gallery-spring-10-tall-panorama';
    }
    return '';
  };

  const renderTileButton = (
    src: string,
    indexInGrid: number,
    tileClassName: string,
    additionalImgClass = ''
  ) => {
    const resolvedTileClass = tileClassesWithWinterHeroLift(tileClassName, src);
    const imgExtra = [imgClassesForWinterFraming(src), additionalImgClass]
      .filter(Boolean)
      .join(' ')
      .trim();
    const staggerIndex = staggerCount++;
    const isFirstTile = staggerIndex === 0;
    const deferSrcUntilVisible = !isFirstTile;

    const tileAlt = `${tourTitle} — фото ${indexInGrid + 1}`;

    if (isVideoAssetUrl(src)) {
      const poster = getVideoPosterForGridSrc?.(src);
      return (
        <GalleryGridVideo
          key={`${src}-${indexInGrid}`}
          gridSrc={src}
          posterSrc={poster}
          className={resolvedTileClass}
          prefersReducedMotion={prefersReducedMotion}
        />
      );
    }

    return (
      <div
        key={`${src}-${indexInGrid}`}
        className={`overflow-hidden rounded-card ${resolvedTileClass}`}
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
      </div>
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

  /**
   * АрсГора (winter-5): портрет; bento — doggie и clip1 по два квадрата по вертикали; нижний bento — clip2 слева на 2 ряда, справа trans-tail и team.
   * Ровно 6 URL после `slice(2)` в `TourDetailPage`: lift, doggie, clip1, clip2, trans-tail, team.
   */
  if (layoutVariant === 'arsgora' && images.length === 6) {
    return (
      <div className="flex flex-col gap-gallery-gap">
        {renderTileButton(images[0], 0, 'aspect-gallery-portrait w-full')}
        <div className="grid grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[1], 1, GALLERY_GRID_BENTO_TALL_LEFT)}
          {renderTileButton(images[2], 2, GALLERY_GRID_BENTO_TALL_RIGHT)}
        </div>
        <div className="grid grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[3], 3, GALLERY_GRID_BENTO_TALL_LEFT)}
          {renderTileButton(images[4], 4, GALLERY_GRID_BENTO_RIGHT_TOP_SQUARE)}
          {renderTileButton(images[5], 5, GALLERY_GRID_BENTO_RIGHT_BOTTOM_SQUARE)}
        </div>
      </div>
    );
  }

  if (layoutVariant === 'izubrinaya') {
    return (
      <div className="flex flex-col gap-gallery-gap">
        {renderTileButton(images[0], 0, 'aspect-gallery-portrait w-full')}

        {images.length >= 4 && (
          <div className="grid grid-cols-2 gap-gallery-gap">
            {renderTileButton(images[1], 1, GALLERY_GRID_BENTO_TALL_LEFT)}
            {renderTileButton(images[2], 2, GALLERY_GRID_BENTO_RIGHT_TOP_SQUARE)}
            {renderTileButton(images[3], 3, GALLERY_GRID_BENTO_RIGHT_BOTTOM_SQUARE)}
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

  /**
   * Лысый Дед (spring-1): после hero/preface в `images` четыре кадра —
   * спуск и подход — на всю ширину сетки (`grid-cols-2` + `col-span-2 aspect-square`, блок 2×2),
   * между ними гребень и вершина — два квадрата 1×1 в один ряд.
   * Порядок: descent, ridge, summit, approach (`galleryGridUrls.slice(2)`).
   */
  if (layoutVariant === 'lysy-ded' && images.length === 4) {
    return (
      <div className="flex flex-col gap-gallery-gap">
        <div className="grid min-w-0 grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[0], 0, GALLERY_GRID_FULL_WIDTH_SQUARE)}
        </div>
        <div className="grid min-w-0 grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[1], 1, GALLERY_GRID_SQUARE_TILE)}
          {renderTileButton(images[2], 2, GALLERY_GRID_SQUARE_TILE)}
        </div>
        <div className="grid min-w-0 grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[3], 3, GALLERY_GRID_FULL_WIDTH_SQUARE)}
        </div>
      </div>
    );
  }

  /**
   * Ольховая (spring-2): после hero/preface — озеро на всю ширину (`col-span-2 aspect-square`);
   * ниже гребень слева на две строки, справа вершина и клип — два квадрата (`slice(2)`: lake, ridge, summit, clip1).
   */
  if (
    layoutVariant === 'olkhovaya' &&
    images.length === 4 &&
    images[0] === TOUR_SPRING_2_LAKE1_IMAGE
  ) {
    return (
      <div className="flex flex-col gap-gallery-gap">
        <div className="grid min-w-0 grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[0], 0, GALLERY_GRID_FULL_WIDTH_SQUARE)}
        </div>
        <div className="grid min-w-0 grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[1], 1, GALLERY_GRID_BENTO_TALL_LEFT)}
          {renderTileButton(images[2], 2, GALLERY_GRID_BENTO_RIGHT_TOP_SQUARE)}
          {renderTileButton(images[3], 3, GALLERY_GRID_BENTO_RIGHT_BOTTOM_SQUARE)}
        </div>
      </div>
    );
  }

  /**
   * Пидан (spring-3): открывающий `clip3` — полноширинный 2×2; под ним два столбца на 2 ряда — `clip5|summit` (тайга в макете не показываем);
   * море 2×2; `clip6|clip7`; внизу bento `clip2|ridge|group` (слева `clip2` на 2 ряда, справа гребень и группа) (`clip4` не показываем).
   * Порядок `slice(2)`: group, clip3, clip2, ridge, clip5, summit, clip4, sea, taiga, clip6, clip7.
   */
  if (
    layoutVariant === 'pidan' &&
    images.length === 11 &&
    images[0] === TOUR_SPRING_3_GROUP_IMAGE
  ) {
    const pidanFullWidthSquare = (sliceIndex: number) => (
      <div className="grid min-w-0 grid-cols-2 gap-gallery-gap">
        {renderTileButton(images[sliceIndex], sliceIndex, GALLERY_GRID_FULL_WIDTH_SQUARE)}
      </div>
    );

    const pidanBentoRow = (left: number, rightTop: number, rightBottom: number) => (
      <div className="grid min-w-0 grid-cols-2 gap-gallery-gap">
        {renderTileButton(images[left], left, GALLERY_GRID_BENTO_TALL_LEFT)}
        {renderTileButton(images[rightTop], rightTop, GALLERY_GRID_BENTO_RIGHT_TOP_SQUARE)}
        {renderTileButton(images[rightBottom], rightBottom, GALLERY_GRID_BENTO_RIGHT_BOTTOM_SQUARE)}
      </div>
    );

    const pidanClip5SummitTwoTallColumns = (
      <div className="grid min-w-0 grid-cols-2 gap-gallery-gap">
        {renderTileButton(images[4], 4, GALLERY_GRID_BENTO_TALL_LEFT)}
        {renderTileButton(images[5], 5, GALLERY_GRID_BENTO_TALL_RIGHT)}
      </div>
    );

    const pidanClosingVideosRow = (
      <div className="grid min-w-0 grid-cols-2 gap-gallery-gap">
        {renderTileButton(images[9], 9, GALLERY_GRID_SQUARE_TILE)}
        {renderTileButton(images[10], 10, GALLERY_GRID_SQUARE_TILE)}
      </div>
    );

    return (
      <div className="flex flex-col gap-gallery-gap">
        {pidanFullWidthSquare(1)}
        {pidanClip5SummitTwoTallColumns}
        {pidanFullWidthSquare(7)}
        {pidanClosingVideosRow}
        {pidanBentoRow(2, 3, 0)}
      </div>
    );
  }

  /**
   * Сестра (spring-4): `clip5` (2×2); bento clip3|clip2|team; bento clip1|pan|clip8;
   * `clip4` 2×2 на всю ширину; ряд clip6 (высокий слева) | taiga и topping по 1×1 справа вертикально.
   */
  if (
    layoutVariant === 'sestra' &&
    images.length === 11 &&
    images[0] === TOUR_SPRING_4_GROUP_IMAGE
  ) {
    const sestraClipWideTwoByTwo =
      'col-span-2 aspect-gallery-tile-2x2 w-full min-w-0';
    const sestraBentoRow = (left: number, rightTop: number, rightBottom: number) => (
      <div className="grid min-w-0 grid-cols-2 gap-gallery-gap">
        {renderTileButton(images[left], left, GALLERY_GRID_BENTO_TALL_LEFT)}
        {renderTileButton(images[rightTop], rightTop, GALLERY_GRID_BENTO_RIGHT_TOP_SQUARE)}
        {renderTileButton(images[rightBottom], rightBottom, GALLERY_GRID_BENTO_RIGHT_BOTTOM_SQUARE)}
      </div>
    );

    return (
      <div className="flex flex-col gap-gallery-gap">
        <div className="grid min-w-0 grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[7], 7, sestraClipWideTwoByTwo)}
        </div>
        {sestraBentoRow(5, 3, 0)}
        {sestraBentoRow(2, 4, 10)}
        <div className="grid min-w-0 grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[6], 6, sestraClipWideTwoByTwo)}
        </div>
        <div className="grid min-w-0 grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[9], 9, GALLERY_GRID_BENTO_TALL_LEFT)}
          {renderTileButton(images[1], 1, GALLERY_GRID_BENTO_RIGHT_TOP_SQUARE)}
          {renderTileButton(images[8], 8, GALLERY_GRID_BENTO_RIGHT_BOTTOM_SQUARE)}
        </div>
      </div>
    );
  }

  /**
   * Читинза (spring-5) и Маралы х Драконы (spring-6): ритм как у «Сестра» (`sestra`), 11 кадров после hero/preface.
   * spring-5 `slice(2)`: woods, yar, clip1…clip4, peak, forest, peak5, peak2, hike.
   * spring-6 `slice(2)`: hills, deer, clip1, clip2, drag, clip3, clip4, hills5, deer2, clip5, deer3.
   */
  if (
    layoutVariant === 'chitinza' &&
    images.length === 11 &&
    (images[0] === TOUR_SPRING_5_GROUP_IMAGE || images[0] === TOUR_SPRING_6_GROUP_IMAGE)
  ) {
    const chitinzaFullWidthSquare = (sliceIndex: number) => (
      <div className="grid min-w-0 grid-cols-2 gap-gallery-gap">
        {renderTileButton(images[sliceIndex], sliceIndex, GALLERY_GRID_FULL_WIDTH_SQUARE)}
      </div>
    );

    const chitinzaBentoRow = (left: number, rightTop: number, rightBottom: number) => (
      <div className="grid min-w-0 grid-cols-2 gap-gallery-gap">
        {renderTileButton(images[left], left, GALLERY_GRID_BENTO_TALL_LEFT)}
        {renderTileButton(images[rightTop], rightTop, GALLERY_GRID_BENTO_RIGHT_TOP_SQUARE)}
        {renderTileButton(images[rightBottom], rightBottom, GALLERY_GRID_BENTO_RIGHT_BOTTOM_SQUARE)}
      </div>
    );

    return (
      <div className="flex flex-col gap-gallery-gap">
        {chitinzaBentoRow(5, 6, 7)}
        {chitinzaBentoRow(1, 2, 3)}
        {chitinzaFullWidthSquare(4)}
        {chitinzaFullWidthSquare(0)}
        {chitinzaFullWidthSquare(8)}
        <div className="grid min-w-0 grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[9], 9, GALLERY_GRID_BENTO_TALL_LEFT)}
          {renderTileButton(images[10], 10, GALLERY_GRID_BENTO_TALL_RIGHT)}
        </div>
      </div>
    );
  }

  /**
   * Аскольд (spring-10): 9 кадров после hero/preface (без `ask.clip1`, `ask.clip3` в галерее).
   * Сетка собрана из 2×2-блоков и одного широкого ряда:
   * 1) `intro` вертикально слева; справа два 1×1 (`rock`, `clip5`).
   * 2) Слева два 1×1 (`clip4`, `view2`); справа вертикальный `beacon`.
   * 3) `clip6` на всю ширину (`aspect-gallery-tile-2x2`).
   * 4) Нижний ряд: `clip5` (1×1), ниже `view3` на всю ширину (`2×2`).
   * Порядок `slice(2)`: intro, clip2, clip4, clip5, clip6, beacon, rock, view2, view3.
   */
  if (layoutVariant === 'askold' && images.length === 9) {
    const askoldClip6WideTwoByTwo =
      'col-span-2 aspect-gallery-tile-2x2 w-full min-w-0';
    return (
      <div className="flex flex-col gap-gallery-gap">
        <div className="grid min-w-0 grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[8], 8, askoldClip6WideTwoByTwo)}
        </div>
        <div className="grid min-w-0 grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[0], 0, GALLERY_GRID_BENTO_TALL_LEFT)}
          {renderTileButton(images[6], 6, GALLERY_GRID_BENTO_RIGHT_TOP_SQUARE)}
          {renderTileButton(images[3], 3, GALLERY_GRID_BENTO_RIGHT_BOTTOM_SQUARE)}
        </div>
        <div className="grid min-w-0 grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[2], 2, GALLERY_GRID_BENTO_LEFT_TOP_SQUARE)}
          {renderTileButton(images[7], 7, GALLERY_GRID_BENTO_LEFT_BOTTOM_SQUARE)}
          {renderTileButton(images[5], 5, GALLERY_GRID_BENTO_TALL_RIGHT)}
        </div>
        <div className="grid min-w-0 grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[4], 4, askoldClip6WideTwoByTwo)}
        </div>
      </div>
    );
  }

  /**
   * Фалаза (spring-8): сторителлинг из 5 кадров после hero/preface —
   * 2x2 панорама, затем bento с клипом слева (1x2), справа два квадрата, и финальный широкий кадр.
   * Порядок `slice(2)`: top, view2, clip1, top2, love_actually.
   */
  if (layoutVariant === 'falaza' && images.length === 5) {
    return (
      <div className="flex flex-col gap-gallery-gap">
        <div className="grid min-w-0 grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[0], 0, GALLERY_GRID_FULL_WIDTH_SQUARE)}
        </div>
        <div className="grid min-w-0 grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[2], 2, GALLERY_GRID_BENTO_TALL_LEFT)}
          {renderTileButton(images[1], 1, GALLERY_GRID_BENTO_RIGHT_TOP_SQUARE)}
          {renderTileButton(images[3], 3, GALLERY_GRID_BENTO_RIGHT_BOTTOM_SQUARE)}
        </div>
        <div className="grid min-w-0 grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[4], 4, GALLERY_GRID_FULL_WIDTH_SQUARE)}
        </div>
      </div>
    );
  }

  /**
   * Воробей + Винодельня (spring-9): 9 кадров после hero/preface, где все 3 вертикальных видео идут как 1x2.
   * Порядок `slice(2)`: top, view2, clip1, rocks, clip2, forest, clip3, sign, top2.
   */
  if (layoutVariant === 'vorobey-winery' && images.length === 9) {
    return (
      <div className="flex flex-col gap-gallery-gap">
        <div className="grid min-w-0 grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[2], 2, GALLERY_GRID_BENTO_TALL_LEFT)}
          {renderTileButton(images[0], 0, GALLERY_GRID_BENTO_RIGHT_TOP_SQUARE)}
          {renderTileButton(images[1], 1, GALLERY_GRID_BENTO_RIGHT_BOTTOM_SQUARE)}
        </div>
        <div className="grid min-w-0 grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[3], 3, GALLERY_GRID_BENTO_LEFT_TOP_SQUARE)}
          {renderTileButton(images[5], 5, GALLERY_GRID_BENTO_LEFT_BOTTOM_SQUARE)}
          {renderTileButton(images[4], 4, GALLERY_GRID_BENTO_TALL_RIGHT)}
        </div>
        <div className="grid min-w-0 grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[6], 6, GALLERY_GRID_BENTO_TALL_LEFT)}
          {renderTileButton(images[7], 7, GALLERY_GRID_BENTO_RIGHT_TOP_SQUARE)}
          {renderTileButton(images[8], 8, GALLERY_GRID_BENTO_RIGHT_BOTTOM_SQUARE)}
        </div>
      </div>
    );
  }

  /**
   * Дарданеллы (spring-7): 6 кадров после hero/preface.
   * Правило тура: `camp` внизу — плитка на всю ширину сетки (`aspect-gallery-tile-2x2`); клипы `ddn.clip1/2` — 1x2;
   * первый ряд — клип слева и `view2` справа (оба 1x2).
   * Порядок `slice(2)`: clip1, view2, clip2, yarchill, exit2, camp.
   */
  if (layoutVariant === 'dardanelles' && images.length === 6) {
    /** Полная ширина двух колонок, высота как у «двух квадратов» (`aspect-gallery-tile-2x2`). */
    const dardanellesCampTwoByTwo = 'col-span-2 aspect-gallery-tile-2x2 w-full min-w-0';

    return (
      <div className="flex flex-col gap-gallery-gap">
        <div className="grid min-w-0 grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[0], 0, GALLERY_GRID_BENTO_TALL_LEFT)}
          {renderTileButton(images[1], 1, GALLERY_GRID_BENTO_TALL_RIGHT)}
        </div>
        <div className="grid min-w-0 grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[3], 3, GALLERY_GRID_BENTO_LEFT_TOP_SQUARE)}
          {renderTileButton(images[4], 4, GALLERY_GRID_BENTO_LEFT_BOTTOM_SQUARE)}
          {renderTileButton(images[2], 2, GALLERY_GRID_BENTO_TALL_RIGHT)}
        </div>
        <div className="grid min-w-0 grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[5], 5, dardanellesCampTwoByTwo)}
        </div>
      </div>
    );
  }

  /**
   * Голец (winter-2): первый ряд — les2 слева, les3 справа; далее les4 и peak; перекусы внизу.
   * Порядок в `images`: les2, les3, les4, peak, kushat, kushat2.
   */
  if (
    layoutVariant === 'default' &&
    images.length === 6 &&
    images[3] === TOUR_WINTER_2_PEAK_IMAGE
  ) {
    return (
      <div className="flex flex-col gap-gallery-gap">
        <div className="grid grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[0], 0, `${GALLERY_GRID_SQUARE_TILE} col-start-1`)}
          {renderTileButton(images[1], 1, `${GALLERY_GRID_SQUARE_TILE} col-start-2`)}
        </div>
        <div className="grid grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[2], 2, `${GALLERY_GRID_SQUARE_TILE} col-start-1`)}
          {renderTileButton(images[3], 3, `${GALLERY_GRID_SQUARE_TILE} col-start-2`)}
        </div>
        <div className="grid grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[4], 4, `${GALLERY_GRID_SQUARE_TILE} col-start-1`)}
          {renderTileButton(images[5], 5, `${GALLERY_GRID_SQUARE_TILE} col-start-2`)}
        </div>
      </div>
    );
  }

  /**
   * Хаски-тур (winter-4): без верхней панорамы — сразу ролик слева на две строки сетки, справа doggo и doggos; ниже сетка clip2 / gora2 / `hs.gora.webp`.
   * Порядок в `images` после `slice(2)`: clip1, doggo, doggos, clip2, gora2, gora.
   */
  if (
    layoutVariant === 'default' &&
    images.length === 6 &&
    images[0] === TOUR_WINTER_4_CLIP1_VIDEO &&
    images[1] === TOUR_WINTER_4_DOGGO_IMAGE &&
    images[2] === TOUR_WINTER_4_DOGGOS_IMAGE
  ) {
    return (
      <div className="flex flex-col gap-gallery-gap">
        <div className="grid grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[0], 0, GALLERY_GRID_BENTO_TALL_LEFT)}
          {renderTileButton(images[1], 1, GALLERY_GRID_BENTO_RIGHT_TOP_SQUARE)}
          {renderTileButton(images[2], 2, GALLERY_GRID_BENTO_RIGHT_BOTTOM_SQUARE)}
        </div>
        {renderRestGrid(images.slice(3), 3)}
      </div>
    );
  }

  /**
   * Фалаза × Грибановка (winter-3): сверху bento — clip2 и clip3 по два квадрата по вертикали; под ними lift в сетке `grid-cols-4`, кадр на всю ширину (`col-span-4`) и `aspect-square` (1:1); два фото склона (board, board2; `gr.boarder` только в префейсе); elya/instr; clip1 и bbq; clip4/clip5.
   * Порядок в `images` после `slice(2)`: lift, clip1, board, board2, clip2, elya, instr, clip3, bbq, clip4, clip5.
   */
  if (
    layoutVariant === 'default' &&
    images.length === 11 &&
    images[0] === TOUR_WINTER_3_LIFT_IMAGE &&
    images[1] === TOUR_WINTER_3_CLIP1_VIDEO &&
    images[4] === TOUR_WINTER_3_CLIP2_VIDEO &&
    images[7] === TOUR_WINTER_3_CLIP3_VIDEO
  ) {
    return (
      <div className="flex flex-col gap-gallery-gap">
        <div className="grid grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[4], 4, GALLERY_GRID_BENTO_TALL_LEFT)}
          {renderTileButton(images[7], 7, GALLERY_GRID_BENTO_TALL_RIGHT)}
        </div>
        <div className="grid grid-cols-4 gap-gallery-gap">
          {renderTileButton(images[0], 0, 'col-span-4 aspect-square w-full min-h-0')}
        </div>
        <div className="grid grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[2], 2, GALLERY_GRID_SQUARE_TILE)}
          {renderTileButton(images[3], 3, GALLERY_GRID_SQUARE_TILE)}
        </div>
        <div className="grid grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[5], 5, GALLERY_GRID_SQUARE_TILE)}
          {renderTileButton(images[6], 6, GALLERY_GRID_SQUARE_TILE)}
        </div>
        <div className="grid grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[1], 1, GALLERY_GRID_SQUARE_TILE)}
          {renderTileButton(images[8], 8, GALLERY_GRID_SQUARE_TILE)}
        </div>
        <div className="grid grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[9], 9, GALLERY_GRID_SQUARE_TILE)}
          {renderTileButton(images[10], 10, GALLERY_GRID_SQUARE_TILE)}
        </div>
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

const TourDetailGallery = memo(TourDetailGalleryComponent);

export default TourDetailGallery;
