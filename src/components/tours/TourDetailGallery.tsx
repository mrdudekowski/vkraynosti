import { memo, type ReactNode } from 'react';
import PlaceholderImage from '../shared/PlaceholderImage';
import GalleryGridVideo from './GalleryGridVideo';
import {
  TOUR_SPRING_2_LAKE1_IMAGE,
  TOUR_SPRING_3_GROUP_IMAGE,
  TOUR_SPRING_4_GROUP_IMAGE,
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
} from '../../constants/images';
import { UI } from '../../constants/ui';
import { isVideoAssetUrl } from '../../utils/isVideoAssetUrl';

export type TourGalleryLayoutVariant =
  | 'default'
  | 'izubrinaya'
  | 'arsgora'
  | 'lysy-ded'
  | 'olkhovaya'
  | 'pidan'
  | 'sestra';

export interface TourDetailGalleryProps {
  /** Кадры для сетки (без главного фото hero страницы). */
  images: string[];
  /** Индекс в полном `tour.galleryImages` для `images[0]` (обычно `1`). */
  firstImageIndexInTourGallery: number;
  tourTitle: string;
  /** Индекс в полном `tour.galleryImages` (для полноэкранного просмотра и стрелок). */
  onOpenPhoto: (indexInFullGallery: number) => void;
  layoutVariant?: TourGalleryLayoutVariant;
  /** Уменьшить движение: в сетке только постер для видео. */
  prefersReducedMotion?: boolean;
  /** Постер webp для grid-webm по URL сетки (например winter-3). */
  getVideoPosterForGridSrc?: (gridSrc: string) => string | undefined;
}

const openAriaForHumanNumber = (humanNumber: string) =>
  UI.tourDetail.galleryPhoto.openPhotoAria.replace('{n}', humanNumber);

const TourDetailGalleryComponent = ({
  images,
  firstImageIndexInTourGallery,
  tourTitle,
  onOpenPhoto,
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
    return '';
  };

  const renderTileButton = (
    src: string,
    indexInGrid: number,
    tileClassName: string,
    additionalImgClass = ''
  ) => {
    const idxInTour = firstImageIndexInTourGallery + indexInGrid;
    const humanN = String(idxInTour + 1);
    const resolvedTileClass = tileClassesWithWinterHeroLift(tileClassName, src);
    const imgExtra = [imgClassesForWinterFraming(src), additionalImgClass]
      .filter(Boolean)
      .join(' ')
      .trim();
    const staggerIndex = staggerCount++;
    const isFirstTile = staggerIndex === 0;
    const deferSrcUntilVisible = !isFirstTile;

    const tileAlt = `${tourTitle} — фото ${humanN}`;

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
      <button
        key={`${src}-${indexInGrid}`}
        type="button"
        className={`cursor-pointer overflow-hidden rounded-card border-0 p-0 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary bg-transparent ${resolvedTileClass}`}
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

  /**
   * АрсГора (winter-5): портрет; bento — doggie и clip1 по два квадрата по вертикали; нижний bento — clip2 слева на 2 ряда, справа trans-tail и team.
   * Ровно 6 URL после `slice(2)` в `TourDetailPage`: lift, doggie, clip1, clip2, trans-tail, team.
   */
  if (layoutVariant === 'arsgora' && images.length === 6) {
    const arsgoraBentoTallTile =
      'col-start-1 row-span-2 row-start-1 h-full min-h-0 w-full';
    const arsgoraBentoTallTileRight =
      'col-start-2 row-span-2 row-start-1 h-full min-h-0 w-full';
    return (
      <div className="flex flex-col gap-gallery-gap">
        {renderTileButton(images[0], 0, 'aspect-gallery-portrait w-full')}
        <div className="grid grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[1], 1, arsgoraBentoTallTile)}
          {renderTileButton(images[2], 2, arsgoraBentoTallTileRight)}
        </div>
        <div className="grid grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[3], 3, arsgoraBentoTallTile)}
          {renderTileButton(images[4], 4, 'col-start-2 row-start-1 aspect-square w-full')}
          {renderTileButton(images[5], 5, 'col-start-2 row-start-2 aspect-square w-full')}
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

  /**
   * Лысый Дед (spring-1): после hero/preface в `images` четыре кадра —
   * спуск и подход — на всю ширину сетки (`grid-cols-2` + `col-span-2 aspect-square`, блок 2×2),
   * между ними гребень и вершина — два квадрата 1×1 в один ряд.
   * Порядок: descent, ridge, summit, approach (`galleryGridUrls.slice(2)`).
   */
  if (layoutVariant === 'lysy-ded' && images.length === 4) {
    const lysyBlockTwoByTwo = 'col-span-2 aspect-square w-full min-w-0';
    const lysyTileOneByOne = 'aspect-square w-full min-w-0';
    return (
      <div className="flex flex-col gap-gallery-gap">
        <div className="grid min-w-0 grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[0], 0, lysyBlockTwoByTwo)}
        </div>
        <div className="grid min-w-0 grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[1], 1, lysyTileOneByOne)}
          {renderTileButton(images[2], 2, lysyTileOneByOne)}
        </div>
        <div className="grid min-w-0 grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[3], 3, lysyBlockTwoByTwo)}
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
    const olkhLakeTwoByTwo = 'col-span-2 aspect-square w-full min-w-0';
    const olkhRidgeTallLeft =
      'col-start-1 row-span-2 row-start-1 h-full min-h-0 w-full';
    return (
      <div className="flex flex-col gap-gallery-gap">
        <div className="grid min-w-0 grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[0], 0, olkhLakeTwoByTwo)}
        </div>
        <div className="grid min-w-0 grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[1], 1, olkhRidgeTallLeft)}
          {renderTileButton(images[2], 2, 'col-start-2 row-start-1 aspect-square w-full min-h-0')}
          {renderTileButton(images[3], 3, 'col-start-2 row-start-2 aspect-square w-full min-h-0')}
        </div>
      </div>
    );
  }

  /**
   * Пидан (spring-3): чередование 2×2 и bento 1×2 + два квадрата справа.
   * Сверху — bento clip5 \| вершина \| clip4; групповое фото 2×2 — после гребня; внизу bento clip3 \| clip6 \| clip7.
   * Порядок `slice(2)`: group, taiga, clip1_poster (файл в `tours/spring-4/`), clip2, ridge, clip5, summit, clip4, sea, clip3, clip6, clip7.
   */
  if (
    layoutVariant === 'pidan' &&
    images.length === 12 &&
    images[0] === TOUR_SPRING_3_GROUP_IMAGE
  ) {
    const pidanTwoByTwo = 'col-span-2 aspect-square w-full min-w-0';
    const pidanTallLeft =
      'col-start-1 row-span-2 row-start-1 h-full min-h-0 w-full';
    const pidanRightTop = 'col-start-2 row-start-1 aspect-square w-full min-h-0';
    const pidanRightBot = 'col-start-2 row-start-2 aspect-square w-full min-h-0';

    const pidanFullWidthSquare = (sliceIndex: number) => (
      <div className="grid min-w-0 grid-cols-2 gap-gallery-gap">
        {renderTileButton(images[sliceIndex], sliceIndex, pidanTwoByTwo)}
      </div>
    );

    const pidanBentoRow = (left: number, rightTop: number, rightBottom: number) => (
      <div className="grid min-w-0 grid-cols-2 gap-gallery-gap">
        {renderTileButton(images[left], left, pidanTallLeft)}
        {renderTileButton(images[rightTop], rightTop, pidanRightTop)}
        {renderTileButton(images[rightBottom], rightBottom, pidanRightBot)}
      </div>
    );

    return (
      <div className="flex flex-col gap-gallery-gap">
        {pidanBentoRow(5, 6, 7)}
        {pidanBentoRow(1, 2, 3)}
        {pidanFullWidthSquare(4)}
        {pidanFullWidthSquare(0)}
        {pidanFullWidthSquare(8)}
        {pidanBentoRow(9, 10, 11)}
      </div>
    );
  }

  /**
   * Сестра (spring-4): как «Пидан» (`pidan`), другой якорный URL группового кадра; без clip7 (11 кадров после preface).
   * Порядок `slice(2)`: group, taiga, clip1…clip6, clip8; фото — pan, topping; нижний ряд — clip6 и clip8 по высоте bento.
   */
  if (
    layoutVariant === 'sestra' &&
    images.length === 11 &&
    images[0] === TOUR_SPRING_4_GROUP_IMAGE
  ) {
    const sestraTwoByTwo = 'col-span-2 aspect-square w-full min-w-0';
    const sestraTallLeft =
      'col-start-1 row-span-2 row-start-1 h-full min-h-0 w-full';
    const sestraTallRight =
      'col-start-2 row-span-2 row-start-1 h-full min-h-0 w-full';
    const sestraRightTop = 'col-start-2 row-start-1 aspect-square w-full min-h-0';
    const sestraRightBot = 'col-start-2 row-start-2 aspect-square w-full min-h-0';

    const sestraFullWidthSquare = (sliceIndex: number) => (
      <div className="grid min-w-0 grid-cols-2 gap-gallery-gap">
        {renderTileButton(images[sliceIndex], sliceIndex, sestraTwoByTwo)}
      </div>
    );

    const sestraBentoRow = (left: number, rightTop: number, rightBottom: number) => (
      <div className="grid min-w-0 grid-cols-2 gap-gallery-gap">
        {renderTileButton(images[left], left, sestraTallLeft)}
        {renderTileButton(images[rightTop], rightTop, sestraRightTop)}
        {renderTileButton(images[rightBottom], rightBottom, sestraRightBot)}
      </div>
    );

    return (
      <div className="flex flex-col gap-gallery-gap">
        {sestraBentoRow(5, 6, 7)}
        {sestraBentoRow(1, 2, 3)}
        {sestraFullWidthSquare(4)}
        {sestraFullWidthSquare(0)}
        {sestraFullWidthSquare(8)}
        <div className="grid min-w-0 grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[9], 9, sestraTallLeft)}
          {renderTileButton(images[10], 10, sestraTallRight)}
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
    const golecTile = 'aspect-square w-full min-h-0';
    return (
      <div className="flex flex-col gap-gallery-gap">
        <div className="grid grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[0], 0, `${golecTile} col-start-1`)}
          {renderTileButton(images[1], 1, `${golecTile} col-start-2`)}
        </div>
        <div className="grid grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[2], 2, `${golecTile} col-start-1`)}
          {renderTileButton(images[3], 3, `${golecTile} col-start-2`)}
        </div>
        <div className="grid grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[4], 4, `${golecTile} col-start-1`)}
          {renderTileButton(images[5], 5, `${golecTile} col-start-2`)}
        </div>
      </div>
    );
  }

  /**
   * Хаски-тур (winter-4): без верхней панорамы — сразу ролик слева на две строки сетки, справа doggo и doggos; ниже сетка clip2 / gora2 / `hs.gora.png`.
   * Порядок в `images` после `slice(2)`: clip1, doggo, doggos, clip2, gora2, gora.
   */
  if (
    layoutVariant === 'default' &&
    images.length === 6 &&
    images[0] === TOUR_WINTER_4_CLIP1_VIDEO &&
    images[1] === TOUR_WINTER_4_DOGGO_IMAGE &&
    images[2] === TOUR_WINTER_4_DOGGOS_IMAGE
  ) {
    const huskyBentoTile =
      'col-start-1 row-span-2 row-start-1 h-full min-h-0 w-full';
    return (
      <div className="flex flex-col gap-gallery-gap">
        <div className="grid grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[0], 0, huskyBentoTile)}
          {renderTileButton(images[1], 1, 'col-start-2 row-start-1 aspect-square w-full')}
          {renderTileButton(images[2], 2, 'col-start-2 row-start-2 aspect-square w-full')}
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
    const falazaBentoTallLeft =
      'col-start-1 row-span-2 row-start-1 h-full min-h-0 w-full';
    const falazaBentoTallRight =
      'col-start-2 row-span-2 row-start-1 h-full min-h-0 w-full';
    const squareTile = 'aspect-square w-full min-h-0';
    return (
      <div className="flex flex-col gap-gallery-gap">
        <div className="grid grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[4], 4, falazaBentoTallLeft)}
          {renderTileButton(images[7], 7, falazaBentoTallRight)}
        </div>
        <div className="grid grid-cols-4 gap-gallery-gap">
          {renderTileButton(images[0], 0, 'col-span-4 aspect-square w-full min-h-0')}
        </div>
        <div className="grid grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[2], 2, squareTile)}
          {renderTileButton(images[3], 3, squareTile)}
        </div>
        <div className="grid grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[5], 5, squareTile)}
          {renderTileButton(images[6], 6, squareTile)}
        </div>
        <div className="grid grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[1], 1, squareTile)}
          {renderTileButton(images[8], 8, squareTile)}
        </div>
        <div className="grid grid-cols-2 gap-gallery-gap">
          {renderTileButton(images[9], 9, squareTile)}
          {renderTileButton(images[10], 10, squareTile)}
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
