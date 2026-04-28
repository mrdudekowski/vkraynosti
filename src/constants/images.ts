import { PUBLIC_ASSET_BASE } from './fonts';
import type { Season } from '../types';

const BASE = 'https://placehold.co';

/** Папки туров: `public/tours/{tourId}/` — обложка и галерея одного маршрута. */
const TOURS_ASSET_BASE = `${PUBLIC_ASSET_BASE}tours`;

/**
 * Стартовый экран главной (`HomeSeasonBanner`): `public/banners_winter/`, `banners_spring/`, …
 * Видео-лупы и постеры сезона — только в своей папке.
 */
export const HOME_SEASON_BANNER_MEDIA_BASE: Record<Season, string> = {
  winter: `${PUBLIC_ASSET_BASE}banners_winter`,
  spring: `${PUBLIC_ASSET_BASE}banners_spring`,
  summer: `${PUBLIC_ASSET_BASE}banners_summer`,
  fall: `${PUBLIC_ASSET_BASE}banners_fall`,
} as const;

const TOUR_WINTER_1 = `${TOURS_ASSET_BASE}/winter-1`;

/** Галерея «Восхождение на Изюбриную» — полное качество (просмотрщик). */
export const TOUR_WINTER_1_GALLERY_VIEWER = [
  `${TOUR_WINTER_1}/iz.ava.webp`,
  `${TOUR_WINTER_1}/iz.close.webp`,
  `${TOUR_WINTER_1}/iz.peoplewalk.webp`,
  `${TOUR_WINTER_1}/trees2.webp`,
  `${TOUR_WINTER_1}/trees.webp`,
  `${TOUR_WINTER_1}/iz.top.webp`,
  `${TOUR_WINTER_1}/iz.rest2.webp`,
  `${TOUR_WINTER_1}/iz.pan2.webp`,
  `${TOUR_WINTER_1}/iz.rest4.webp`,
] as const;

/** Сетка: webp ≤900px — сравнение веток в `TourDetailGallery` только по grid-URL. */
export const TOUR_WINTER_1_GALLERY_GRID = [
  `${TOUR_WINTER_1}/iz.ava.grid.webp`,
  `${TOUR_WINTER_1}/iz.close.grid.webp`,
  `${TOUR_WINTER_1}/iz.peoplewalk.grid.webp`,
  `${TOUR_WINTER_1}/trees2.grid.webp`,
  `${TOUR_WINTER_1}/trees.grid.webp`,
  `${TOUR_WINTER_1}/iz.top.grid.webp`,
  `${TOUR_WINTER_1}/iz.rest2.grid.webp`,
  `${TOUR_WINTER_1}/iz.pan2.grid.webp`,
  `${TOUR_WINTER_1}/iz.rest4.grid.webp`,
] as const;

/** Верхний ряд рядом с панорамой — растягивание по высоте строки (`sm+`). */
export const TOUR_WINTER_1_TOP_IMAGE = TOUR_WINTER_1_GALLERY_GRID[5];

/** Кадр с посадкой / людьми — отдельное кадрирование в `TourDetailGallery`. */
export const TOUR_WINTER_1_REST4_IMAGE = TOUR_WINTER_1_GALLERY_GRID[8];

/** Совпадает с `TOUR_WINTER_1_GALLERY_VIEWER`. */
export const TOUR_WINTER_1_GALLERY = TOUR_WINTER_1_GALLERY_VIEWER;

export const TOUR_WINTER_1_COVER_GRID = TOUR_WINTER_1_GALLERY_GRID[0];
export const TOUR_WINTER_1_COVER = TOUR_WINTER_1_COVER_GRID;

const TOUR_WINTER_2 = `${TOURS_ASSET_BASE}/winter-2`;

/** Галерея «Восхождение на г. Голец» — полное качество. */
export const TOUR_WINTER_2_GALLERY_VIEWER = [
  `${TOUR_WINTER_2}/les.webp`,
  `${TOUR_WINTER_2}/podnimaem.webp`,
  `${TOUR_WINTER_2}/les2.webp`,
  `${TOUR_WINTER_2}/les3.webp`,
  `${TOUR_WINTER_2}/les4.webp`,
  `${TOUR_WINTER_2}/peak.webp`,
  `${TOUR_WINTER_2}/kushat.webp`,
  `${TOUR_WINTER_2}/kushat2.webp`,
] as const;

export const TOUR_WINTER_2_GALLERY_GRID = [
  `${TOUR_WINTER_2}/les.grid.webp`,
  `${TOUR_WINTER_2}/podnimaem.grid.webp`,
  `${TOUR_WINTER_2}/les2.grid.webp`,
  `${TOUR_WINTER_2}/les3.grid.webp`,
  `${TOUR_WINTER_2}/les4.grid.webp`,
  `${TOUR_WINTER_2}/peak.grid.webp`,
  `${TOUR_WINTER_2}/kushat.grid.webp`,
  `${TOUR_WINTER_2}/kushat2.grid.webp`,
] as const;

/** Кадр вершины — полная ширина сетки (`TourDetailGallery`, Голец). */
export const TOUR_WINTER_2_PEAK_IMAGE = TOUR_WINTER_2_GALLERY_GRID[5];

export const TOUR_WINTER_2_GALLERY = TOUR_WINTER_2_GALLERY_VIEWER;

export const TOUR_WINTER_2_COVER_GRID = TOUR_WINTER_2_GALLERY_GRID[0];
export const TOUR_WINTER_2_COVER = TOUR_WINTER_2_COVER_GRID;

const TOUR_WINTER_3 = `${TOURS_ASSET_BASE}/winter-3`;

/**
 * Галерея «Фалаза × Грибановка» — полное качество (просмотрщик, индексы как в данных тура).
 * [0] обложка, [1] второй кадр; `gr.boarder` не в массиве — `TOUR_WINTER_3_PREFACE_BACKGROUND`.
 */
export const TOUR_WINTER_3_GALLERY_VIEWER = [
  `${TOUR_WINTER_3}/gr.falaza.webp`,
  `${TOUR_WINTER_3}/gr.griba.webp`,
  `${TOUR_WINTER_3}/gr.lift.webp`,
  `${TOUR_WINTER_3}/gr.clip1.webm`,
  `${TOUR_WINTER_3}/gr.board.webp`,
  `${TOUR_WINTER_3}/gr.board2.webp`,
  `${TOUR_WINTER_3}/gr.clip2.webm`,
  `${TOUR_WINTER_3}/gr.elya.webp`,
  `${TOUR_WINTER_3}/gr.instr.webp`,
  `${TOUR_WINTER_3}/gr.clip3.webm`,
  `${TOUR_WINTER_3}/gr.bbq.webp`,
  `${TOUR_WINTER_3}/gr.clip4.webm`,
  `${TOUR_WINTER_3}/gr.clip5.webm`,
] as const;

/**
 * Те же индексы, что у `TOUR_WINTER_3_GALLERY_VIEWER`: сетка страницы / карточка (webp ≤900px, VP9 `*.grid.webm`).
 * Кадры склона, Эли и барбекю — только фото (`*.webp`); `*.grid.webm` для них ошибочно попадали в сетку как `GalleryGridVideo`
 * (сами файлы остаются в `public` — входы скриптов баннера главной).
 */
export const TOUR_WINTER_3_GALLERY_GRID = [
  `${TOUR_WINTER_3}/gr.falaza.grid.webp`,
  `${TOUR_WINTER_3}/gr.griba.grid.webp`,
  `${TOUR_WINTER_3}/gr.lift.grid.webp`,
  `${TOUR_WINTER_3}/gr.clip1.grid.webm`,
  `${TOUR_WINTER_3}/gr.board.webp`,
  `${TOUR_WINTER_3}/gr.board2.grid.webp`,
  `${TOUR_WINTER_3}/gr.clip2.grid.webm`,
  `${TOUR_WINTER_3}/gr.elya.webp`,
  `${TOUR_WINTER_3}/gr.instr.grid.webp`,
  `${TOUR_WINTER_3}/gr.clip3.grid.webm`,
  `${TOUR_WINTER_3}/gr.bbq.webp`,
  `${TOUR_WINTER_3}/gr.clip4.grid.webm`,
  `${TOUR_WINTER_3}/gr.clip5.grid.webm`,
] as const;

/** Совпадает с `TOUR_WINTER_3_GALLERY_VIEWER` — для тестов и обратной совместимости импортов. */
export const TOUR_WINTER_3_GALLERY = TOUR_WINTER_3_GALLERY_VIEWER;

/** Обложка карточки и hero: оптимизированный кадр. */
export const TOUR_WINTER_3_COVER_GRID = TOUR_WINTER_3_GALLERY_GRID[0];

export const TOUR_WINTER_3_COVER = TOUR_WINTER_3_COVER_GRID;

/** После `galleryGridUrls.slice(2)` — ветка `TourDetailGallery` сравнивает с этими **grid**-URL. */
export const TOUR_WINTER_3_LIFT_IMAGE = TOUR_WINTER_3_GALLERY_GRID[2];

/** Главная: секция «Безопасность» — герой (инструктаж в кадре, `gr.instr` сетки). */
export const HOME_SAFETY_SECTION_HERO_IMAGE = TOUR_WINTER_3_GALLERY_GRID[8];
export const TOUR_WINTER_3_CLIP1_VIDEO = TOUR_WINTER_3_GALLERY_GRID[3];
export const TOUR_WINTER_3_CLIP2_VIDEO = TOUR_WINTER_3_GALLERY_GRID[6];
export const TOUR_WINTER_3_CLIP3_VIDEO = TOUR_WINTER_3_GALLERY_GRID[9];

/** Кадр-постер для ленивого `<video>` в сетке (grid webm → webp). Только ролики clip1–clip5. */
export const TOUR_WINTER_3_GRID_VIDEO_POSTERS: Record<string, string> = {
  [TOUR_WINTER_3_GALLERY_GRID[3]]: `${TOUR_WINTER_3}/gr.clip1.poster.webp`,
  [TOUR_WINTER_3_GALLERY_GRID[6]]: `${TOUR_WINTER_3}/gr.clip2.poster.webp`,
  [TOUR_WINTER_3_GALLERY_GRID[9]]: `${TOUR_WINTER_3}/gr.clip3.poster.webp`,
  [TOUR_WINTER_3_GALLERY_GRID[11]]: `${TOUR_WINTER_3}/gr.clip4.poster.webp`,
  [TOUR_WINTER_3_GALLERY_GRID[12]]: `${TOUR_WINTER_3}/gr.clip5.poster.webp`,
};
/** `gr.boarder` — только фон блока «О туре» (`Tour.prefaceBackgroundImageUrl`), не в `TOUR_WINTER_3_GALLERY`. */
export const TOUR_WINTER_3_PREFACE_BACKGROUND = `${TOUR_WINTER_3}/gr.boarder.webp` as const;

const TOUR_WINTER_4 = `${TOURS_ASSET_BASE}/winter-4`;

/** Главный кадр hero / карточка (полное качество; не обязан совпадать с [0] галереи). */
export const TOUR_WINTER_4_COVER = `${TOUR_WINTER_4}/hs.doggos2.webp` as const;

/**
 * Галерея «Хаски-тур» — полное качество (просмотрщик).
 * [0] первый кадр после hero, [1] фон «О туре»; ролики `.webm` в просмотрщике — полные файлы (VP9).
 */
export const TOUR_WINTER_4_GALLERY_VIEWER = [
  `${TOUR_WINTER_4}/hs.team.webp`,
  `${TOUR_WINTER_4}/hs.uprazh.webp`,
  `${TOUR_WINTER_4}/hs.clip1.webm`,
  `${TOUR_WINTER_4}/hs.doggo.webp`,
  `${TOUR_WINTER_4}/hs.doggos.webp`,
  `${TOUR_WINTER_4}/hs.clip2.webm`,
  `${TOUR_WINTER_4}/hs.gora2.webp`,
  `${TOUR_WINTER_4}/hs.gora.png`,
] as const;

/** Сетка: webp ≤900px, клипы — VP9 `*.grid.webm`. */
export const TOUR_WINTER_4_GALLERY_GRID = [
  `${TOUR_WINTER_4}/hs.team.grid.webp`,
  `${TOUR_WINTER_4}/hs.uprazh.grid.webp`,
  `${TOUR_WINTER_4}/hs.clip1.grid.webm`,
  `${TOUR_WINTER_4}/hs.doggo.grid.webp`,
  `${TOUR_WINTER_4}/hs.doggos.grid.webp`,
  `${TOUR_WINTER_4}/hs.clip2.grid.webm`,
  `${TOUR_WINTER_4}/hs.gora2.grid.webp`,
  `${TOUR_WINTER_4}/hs.gora.grid.webp`,
] as const;

export const TOUR_WINTER_4_GALLERY = TOUR_WINTER_4_GALLERY_VIEWER;

/** Кадр горы в сетке; кадрирование — `object-gallery-winter-4-gora`. */
export const TOUR_WINTER_4_GORA_IMAGE = TOUR_WINTER_4_GALLERY_GRID[7];

/** После `galleryGridUrls.slice(2)`: bento clip1, doggo, doggos (`TourDetailGallery`). */
export const TOUR_WINTER_4_CLIP1_VIDEO = TOUR_WINTER_4_GALLERY_GRID[2];
export const TOUR_WINTER_4_DOGGO_IMAGE = TOUR_WINTER_4_GALLERY_GRID[3];
export const TOUR_WINTER_4_DOGGOS_IMAGE = TOUR_WINTER_4_GALLERY_GRID[4];

/** Постеры для ленивого видео в сетке (winter-4). */
export const TOUR_WINTER_4_GRID_VIDEO_POSTERS: Record<string, string> = {
  [TOUR_WINTER_4_GALLERY_GRID[2]]: `${TOUR_WINTER_4}/hs.clip1.poster.webp`,
  [TOUR_WINTER_4_GALLERY_GRID[5]]: `${TOUR_WINTER_4}/hs.clip2.poster.webp`,
};

const TOUR_WINTER_5 = `${TOURS_ASSET_BASE}/winter-5`;

/**
 * Галерея «АрсГора» — полное качество (просмотрщик).
 * [0] обложка, [1] preface; сетка `arsgora` — портрет; bento doggie|clip1; низ — clip2, trans-tail, team.
 */
export const TOUR_WINTER_5_GALLERY_VIEWER = [
  `${TOUR_WINTER_5}/ars.main.webp`,
  `${TOUR_WINTER_5}/ars.preface.webp`,
  `${TOUR_WINTER_5}/ars.lift.webp`,
  `${TOUR_WINTER_5}/ars.doggie.webp`,
  `${TOUR_WINTER_5}/ars.clip1.webm`,
  `${TOUR_WINTER_5}/ars.clip2.webm`,
  `${TOUR_WINTER_5}/ars.trans-tail.webp`,
  `${TOUR_WINTER_5}/ars.team.png`,
] as const;

/** Те же индексы: сетка (webp ≤900px, VP9 для клипов). */
export const TOUR_WINTER_5_GALLERY_GRID = [
  `${TOUR_WINTER_5}/ars.main.grid.webp`,
  `${TOUR_WINTER_5}/ars.preface.grid.webp`,
  `${TOUR_WINTER_5}/ars.lift.grid.webp`,
  `${TOUR_WINTER_5}/ars.doggie.grid.webp`,
  `${TOUR_WINTER_5}/ars.clip1.grid.webm`,
  `${TOUR_WINTER_5}/ars.clip2.grid.webm`,
  `${TOUR_WINTER_5}/ars.trans-tail.grid.webp`,
  `${TOUR_WINTER_5}/ars.team.grid.webp`,
] as const;

/** Совпадает с `TOUR_WINTER_5_GALLERY_VIEWER`. */
export const TOUR_WINTER_5_GALLERY = TOUR_WINTER_5_GALLERY_VIEWER;

export const TOUR_WINTER_5_COVER_GRID = TOUR_WINTER_5_GALLERY_GRID[0];
export const TOUR_WINTER_5_COVER = TOUR_WINTER_5_COVER_GRID;

/** Постеры для ленивого видео в сетке (winter-5). */
export const TOUR_WINTER_5_GRID_VIDEO_POSTERS: Record<string, string> = {
  [TOUR_WINTER_5_GALLERY_GRID[4]]: `${TOUR_WINTER_5}/ars.clip1.poster.webp`,
  [TOUR_WINTER_5_GALLERY_GRID[5]]: `${TOUR_WINTER_5}/ars.clip2.poster.webp`,
};

const TOUR_SPRING_1 = `${TOURS_ASSET_BASE}/spring-1`;

/** «Лысый Дед» — полное качество (просмотрщик). */
export const TOUR_SPRING_1_GALLERY_VIEWER = [
  `${TOUR_SPRING_1}/ld.hero.webp`,
  `${TOUR_SPRING_1}/ld.preface.webp`,
  `${TOUR_SPRING_1}/ld.descent.webp`,
  `${TOUR_SPRING_1}/ld.ridge.webp`,
  `${TOUR_SPRING_1}/ld.summit.webp`,
  `${TOUR_SPRING_1}/ld.approach.webp`,
] as const;

/** Сетка: webp ≤900px (`scripts/generate-spring-1-2-3-grid-assets.ps1`). */
export const TOUR_SPRING_1_GALLERY_GRID = [
  `${TOUR_SPRING_1}/ld.hero.grid.webp`,
  `${TOUR_SPRING_1}/ld.preface.grid.webp`,
  `${TOUR_SPRING_1}/ld.descent.grid.webp`,
  `${TOUR_SPRING_1}/ld.ridge.grid.webp`,
  `${TOUR_SPRING_1}/ld.summit.grid.webp`,
  `${TOUR_SPRING_1}/ld.approach.grid.webp`,
] as const;

export const TOUR_SPRING_1_COVER_GRID = TOUR_SPRING_1_GALLERY_GRID[0];
export const TOUR_SPRING_1_COVER = TOUR_SPRING_1_COVER_GRID;

const TOUR_SPRING_2 = `${TOURS_ASSET_BASE}/spring-2`;

/** «Ольховая» — полное качество (просмотрщик). */
export const TOUR_SPRING_2_GALLERY_VIEWER = [
  `${TOUR_SPRING_2}/olv.hero.webp`,
  `${TOUR_SPRING_2}/olv.preface.webp`,
  `${TOUR_SPRING_2}/olv.lake1.webp`,
  `${TOUR_SPRING_2}/olv.ridge.webp`,
  `${TOUR_SPRING_2}/olv.summit.webp`,
  `${TOUR_SPRING_2}/olv.clip1.webm`,
] as const;

export const TOUR_SPRING_2_GALLERY_GRID = [
  `${TOUR_SPRING_2}/olv.hero.grid.webp`,
  `${TOUR_SPRING_2}/olv.preface.grid.webp`,
  `${TOUR_SPRING_2}/olv.lake1.grid.webp`,
  `${TOUR_SPRING_2}/olv.ridge.grid.webp`,
  `${TOUR_SPRING_2}/olv.summit.grid.webp`,
  `${TOUR_SPRING_2}/olv.clip1.grid.webm`,
] as const;

/** Первый кадр сетки после hero/preface — `galleryGridUrls.slice(2)` [0] («Ольховая»). */
export const TOUR_SPRING_2_LAKE1_IMAGE = TOUR_SPRING_2_GALLERY_GRID[2];

export const TOUR_SPRING_2_GRID_VIDEO_POSTERS: Record<string, string> = {
  [TOUR_SPRING_2_GALLERY_GRID[5]]: `${TOUR_SPRING_2}/olv.clip1.poster.webp`,
};

export const TOUR_SPRING_2_COVER_GRID = TOUR_SPRING_2_GALLERY_GRID[0];
export const TOUR_SPRING_2_COVER = TOUR_SPRING_2_COVER_GRID;

const TOUR_SPRING_3 = `${TOURS_ASSET_BASE}/spring-3`;
const TOUR_SPRING_4 = `${TOURS_ASSET_BASE}/spring-4`;
const TOUR_SPRING_5 = `${TOURS_ASSET_BASE}/spring-5`;

/** Первый ролик «Сестра» (`ss.clip1.*`); постер — в плейсхолдере сетки «Пидан» и в баннере главной. */
export const TOUR_SPRING_4_CLIP1_GRID_WEBM = `${TOUR_SPRING_4}/ss.clip1.grid.webm` as const;
export const TOUR_SPRING_4_CLIP1_VIEWER_WEBM = `${TOUR_SPRING_4}/ss.clip1.webm` as const;
export const TOUR_SPRING_4_CLIP1_POSTER_WEBP = `${TOUR_SPRING_4}/ss.clip1.poster.webp` as const;
export const TOUR_SPRING_4_CLIP3_GRID_WEBM = `${TOUR_SPRING_4}/ss.clip3.grid.webm` as const;
export const TOUR_SPRING_4_CLIP5_GRID_WEBM = `${TOUR_SPRING_4}/ss.clip5.grid.webm` as const;

/** «Пидан» — полное качество (просмотрщик). */
export const TOUR_SPRING_3_GALLERY_VIEWER = [
  `${TOUR_SPRING_3}/pd.hero.webp`,
  `${TOUR_SPRING_3}/pd.preface.webp`,
  `${TOUR_SPRING_3}/pd.group.webp`,
  `${TOUR_SPRING_3}/pd.taiga.webp`,
  TOUR_SPRING_4_CLIP1_POSTER_WEBP,
  `${TOUR_SPRING_3}/pd.clip2.webm`,
  `${TOUR_SPRING_3}/pd.ridge.webp`,
  `${TOUR_SPRING_3}/pd.clip5.webm`,
  `${TOUR_SPRING_3}/pd.summit.webp`,
  `${TOUR_SPRING_3}/pd.clip4.webm`,
  `${TOUR_SPRING_3}/pd.sea.webp`,
  `${TOUR_SPRING_3}/pd.clip3.webm`,
  `${TOUR_SPRING_3}/pd.clip6.webm`,
  `${TOUR_SPRING_3}/pd.clip7.webm`,
] as const;

export const TOUR_SPRING_3_GALLERY_GRID = [
  `${TOUR_SPRING_3}/pd.hero.grid.webp`,
  `${TOUR_SPRING_3}/pd.preface.grid.webp`,
  `${TOUR_SPRING_3}/pd.group.grid.webp`,
  `${TOUR_SPRING_3}/pd.taiga.grid.webp`,
  TOUR_SPRING_4_CLIP1_POSTER_WEBP,
  `${TOUR_SPRING_3}/pd.clip2.grid.webm`,
  `${TOUR_SPRING_3}/pd.ridge.grid.webp`,
  `${TOUR_SPRING_3}/pd.clip5.grid.webm`,
  `${TOUR_SPRING_3}/pd.summit.grid.webp`,
  `${TOUR_SPRING_3}/pd.clip4.grid.webm`,
  `${TOUR_SPRING_3}/pd.sea.grid.webp`,
  `${TOUR_SPRING_3}/pd.clip3.grid.webm`,
  `${TOUR_SPRING_3}/pd.clip6.grid.webm`,
  `${TOUR_SPRING_3}/pd.clip7.grid.webm`,
] as const;

/** Первый кадр сетки после hero/preface — `slice(2)` [0] («Пидан», макет `pidan`). */
export const TOUR_SPRING_3_GROUP_IMAGE = TOUR_SPRING_3_GALLERY_GRID[2];

export const TOUR_SPRING_3_GRID_VIDEO_POSTERS: Record<string, string> = {
  [TOUR_SPRING_3_GALLERY_GRID[5]]: `${TOUR_SPRING_3}/pd.clip2.poster.webp`,
  [TOUR_SPRING_3_GALLERY_GRID[7]]: `${TOUR_SPRING_3}/pd.clip5.poster.webp`,
  [TOUR_SPRING_3_GALLERY_GRID[9]]: `${TOUR_SPRING_3}/pd.clip4.poster.webp`,
  [TOUR_SPRING_3_GALLERY_GRID[11]]: `${TOUR_SPRING_3}/pd.clip3.poster.webp`,
  [TOUR_SPRING_3_GALLERY_GRID[12]]: `${TOUR_SPRING_3}/pd.clip6.poster.webp`,
  [TOUR_SPRING_3_GALLERY_GRID[13]]: `${TOUR_SPRING_3}/pd.clip7.poster.webp`,
};

export const TOUR_SPRING_3_COVER_GRID = TOUR_SPRING_3_GALLERY_GRID[0];
export const TOUR_SPRING_3_COVER = TOUR_SPRING_3_COVER_GRID;

/** Обложка карточки и первый кадр сетки — панорама (`ss.pan`). */
export const TOUR_SPRING_4_COVER_GRID = `${TOUR_SPRING_4}/ss.pan.grid.webp` as const;

/**
 * «Сестра» — полное качество (просмотрщик). Макет `sestra` (как «Пидан»): после hero/preface
 * group, taiga, clip1…clip6 и clip8 в слотах 2,3,5,6,7,9,10,11; фото — pan, topping между роликами (clip7 исключён).
 */
export const TOUR_SPRING_4_GALLERY_VIEWER = [
  `${TOUR_SPRING_4}/ss.pan.webp`,
  `${TOUR_SPRING_4}/ss.topping.webp`,
  `${TOUR_SPRING_4}/ss.team.webp`,
  `${TOUR_SPRING_4}/ss.taiga.webp`,
  TOUR_SPRING_4_CLIP1_VIEWER_WEBM,
  `${TOUR_SPRING_4}/ss.clip2.webm`,
  `${TOUR_SPRING_4}/ss.pan.webp`,
  `${TOUR_SPRING_4}/ss.clip3.webm`,
  `${TOUR_SPRING_4}/ss.clip4.webm`,
  `${TOUR_SPRING_4}/ss.clip5.webm`,
  `${TOUR_SPRING_4}/ss.topping.webp`,
  `${TOUR_SPRING_4}/ss.clip6.webm`,
  `${TOUR_SPRING_4}/ss.clip8.webm`,
] as const;

/** Сетка «Сестра» (VP9 grid-webm для клипов; clip7 исключён из тура). */
export const TOUR_SPRING_4_GALLERY_GRID = [
  `${TOUR_SPRING_4}/ss.pan.grid.webp`,
  `${TOUR_SPRING_4}/ss.topping.grid.webp`,
  `${TOUR_SPRING_4}/ss.team.grid.webp`,
  `${TOUR_SPRING_4}/ss.taiga.grid.webp`,
  TOUR_SPRING_4_CLIP1_GRID_WEBM,
  `${TOUR_SPRING_4}/ss.clip2.grid.webm`,
  `${TOUR_SPRING_4}/ss.pan.grid.webp`,
  TOUR_SPRING_4_CLIP3_GRID_WEBM,
  `${TOUR_SPRING_4}/ss.clip4.grid.webm`,
  TOUR_SPRING_4_CLIP5_GRID_WEBM,
  `${TOUR_SPRING_4}/ss.topping.grid.webp`,
  `${TOUR_SPRING_4}/ss.clip6.grid.webm`,
  `${TOUR_SPRING_4}/ss.clip8.grid.webm`,
] as const;

/** Первый кадр сетки после hero/preface — `slice(2)` [0] («Сестра», макет `sestra`). */
export const TOUR_SPRING_4_GROUP_IMAGE = TOUR_SPRING_4_GALLERY_GRID[2];

export const TOUR_SPRING_4_GRID_VIDEO_POSTERS: Record<string, string> = {
  [TOUR_SPRING_4_CLIP1_GRID_WEBM]: TOUR_SPRING_4_CLIP1_POSTER_WEBP,
  [`${TOUR_SPRING_4}/ss.clip2.grid.webm`]: `${TOUR_SPRING_4}/ss.clip2.poster.webp`,
  [TOUR_SPRING_4_CLIP3_GRID_WEBM]: `${TOUR_SPRING_4}/ss.clip3.poster.webp`,
  [`${TOUR_SPRING_4}/ss.clip4.grid.webm`]: `${TOUR_SPRING_4}/ss.clip4.poster.webp`,
  [TOUR_SPRING_4_CLIP5_GRID_WEBM]: `${TOUR_SPRING_4}/ss.clip5.poster.webp`,
  [`${TOUR_SPRING_4}/ss.clip6.grid.webm`]: `${TOUR_SPRING_4}/ss.clip6.poster.webp`,
  [`${TOUR_SPRING_4}/ss.clip8.grid.webm`]: `${TOUR_SPRING_4}/ss.clip8.poster.webp`,
};

/**
 * «Читинза» (spring-5): порядок как у макета `sestra` — hero/preface, затем 11 кадров сетки.
 * Клипы: `scripts/encode-chitinza-tour-movs.ps1` → `ctz.clip1..4` (.webm / .grid.webm / .poster.webp).
 */
export const TOUR_SPRING_5_GALLERY_VIEWER = [
  `${TOUR_SPRING_5}/top.webp`,
  `${TOUR_SPRING_5}/view.webp`,
  `${TOUR_SPRING_5}/woods.webp`,
  `${TOUR_SPRING_5}/yar.webp`,
  `${TOUR_SPRING_5}/ctz.clip1.webm`,
  `${TOUR_SPRING_5}/ctz.clip2.webm`,
  `${TOUR_SPRING_5}/peak.webp`,
  `${TOUR_SPRING_5}/ctz.clip3.webm`,
  `${TOUR_SPRING_5}/ctz.clip4.webm`,
  `${TOUR_SPRING_5}/forest.webp`,
  `${TOUR_SPRING_5}/peak5.webp`,
  `${TOUR_SPRING_5}/peak2.webp`,
  `${TOUR_SPRING_5}/hike.webp`,
] as const;

export const TOUR_SPRING_5_GALLERY_GRID = [
  `${TOUR_SPRING_5}/top.webp`,
  `${TOUR_SPRING_5}/view.webp`,
  `${TOUR_SPRING_5}/woods.webp`,
  `${TOUR_SPRING_5}/yar.webp`,
  `${TOUR_SPRING_5}/ctz.clip1.grid.webm`,
  `${TOUR_SPRING_5}/ctz.clip2.grid.webm`,
  `${TOUR_SPRING_5}/peak.webp`,
  `${TOUR_SPRING_5}/ctz.clip3.grid.webm`,
  `${TOUR_SPRING_5}/ctz.clip4.grid.webm`,
  `${TOUR_SPRING_5}/forest.webp`,
  `${TOUR_SPRING_5}/peak5.webp`,
  `${TOUR_SPRING_5}/peak2.webp`,
  `${TOUR_SPRING_5}/hike.webp`,
] as const;

/** Первый кадр сетки после hero/preface — `slice(2)` [0] (макет `chitinza`). */
export const TOUR_SPRING_5_GROUP_IMAGE = TOUR_SPRING_5_GALLERY_GRID[2];

export const TOUR_SPRING_5_GRID_VIDEO_POSTERS: Record<string, string> = {
  [`${TOUR_SPRING_5}/ctz.clip1.grid.webm`]: `${TOUR_SPRING_5}/ctz.clip1.poster.webp`,
  [`${TOUR_SPRING_5}/ctz.clip2.grid.webm`]: `${TOUR_SPRING_5}/ctz.clip2.poster.webp`,
  [`${TOUR_SPRING_5}/ctz.clip3.grid.webm`]: `${TOUR_SPRING_5}/ctz.clip3.poster.webp`,
  [`${TOUR_SPRING_5}/ctz.clip4.grid.webm`]: `${TOUR_SPRING_5}/ctz.clip4.poster.webp`,
};

export const TOUR_SPRING_5_COVER_GRID = `${TOUR_SPRING_5}/top.webp` as const;

const TOUR_SPRING_6 = `${TOURS_ASSET_BASE}/spring-6`;

/**
 * «Мараловая ферма и Парк Драконов» (spring-6). Исходники: `content/МаралыXДраконы/webp/`.
 * Клипы: `scripts/encode-spring-6-maral-dragon-movs.ps1` → `mnd.clip1..5`.
 * Макет сетки — как «Читинза» (`chitinza`): 11 кадров после hero/preface; `hills3` только фон «О туре».
 */
export const TOUR_SPRING_6_PREFACE_BACKGROUND = `${TOUR_SPRING_6}/hills3.webp` as const;

export const TOUR_SPRING_6_GALLERY_VIEWER = [
  `${TOUR_SPRING_6}/deerlol.webp`,
  `${TOUR_SPRING_6}/view.webp`,
  `${TOUR_SPRING_6}/hills.webp`,
  `${TOUR_SPRING_6}/deer.webp`,
  `${TOUR_SPRING_6}/mnd.clip1.webm`,
  `${TOUR_SPRING_6}/mnd.clip2.webm`,
  `${TOUR_SPRING_6}/drag.webp`,
  `${TOUR_SPRING_6}/mnd.clip3.webm`,
  `${TOUR_SPRING_6}/mnd.clip4.webm`,
  `${TOUR_SPRING_6}/hills5.webp`,
  `${TOUR_SPRING_6}/deer2.webp`,
  `${TOUR_SPRING_6}/mnd.clip5.webm`,
  `${TOUR_SPRING_6}/deer3.webp`,
] as const;

export const TOUR_SPRING_6_GALLERY_GRID = [
  `${TOUR_SPRING_6}/deerlol.webp`,
  `${TOUR_SPRING_6}/view.webp`,
  `${TOUR_SPRING_6}/hills.webp`,
  `${TOUR_SPRING_6}/deer.webp`,
  `${TOUR_SPRING_6}/mnd.clip1.grid.webm`,
  `${TOUR_SPRING_6}/mnd.clip2.grid.webm`,
  `${TOUR_SPRING_6}/drag.webp`,
  `${TOUR_SPRING_6}/mnd.clip3.grid.webm`,
  `${TOUR_SPRING_6}/mnd.clip4.grid.webm`,
  `${TOUR_SPRING_6}/hills5.webp`,
  `${TOUR_SPRING_6}/deer2.webp`,
  `${TOUR_SPRING_6}/mnd.clip5.grid.webm`,
  `${TOUR_SPRING_6}/deer3.webp`,
] as const;

/** Первый кадр сетки после hero/preface — `slice(2)` [0] (макет `chitinza`). */
export const TOUR_SPRING_6_GROUP_IMAGE = TOUR_SPRING_6_GALLERY_GRID[2];

export const TOUR_SPRING_6_GRID_VIDEO_POSTERS: Record<string, string> = {
  [`${TOUR_SPRING_6}/mnd.clip1.grid.webm`]: `${TOUR_SPRING_6}/mnd.clip1.poster.webp`,
  [`${TOUR_SPRING_6}/mnd.clip2.grid.webm`]: `${TOUR_SPRING_6}/mnd.clip2.poster.webp`,
  [`${TOUR_SPRING_6}/mnd.clip3.grid.webm`]: `${TOUR_SPRING_6}/mnd.clip3.poster.webp`,
  [`${TOUR_SPRING_6}/mnd.clip4.grid.webm`]: `${TOUR_SPRING_6}/mnd.clip4.poster.webp`,
  [`${TOUR_SPRING_6}/mnd.clip5.grid.webm`]: `${TOUR_SPRING_6}/mnd.clip5.poster.webp`,
};

export const TOUR_SPRING_6_COVER_GRID = `${TOUR_SPRING_6}/deerlol.webp` as const;

const TOUR_SPRING_7 = `${TOURS_ASSET_BASE}/spring-7`;
const TOUR_SPRING_8 = `${TOURS_ASSET_BASE}/spring-8`;
const TOUR_SPRING_9 = `${TOURS_ASSET_BASE}/spring-9`;
const TOUR_SPRING_10 = `${TOURS_ASSET_BASE}/spring-10`;

/**
 * «Ущелье Дарданеллы» (spring-7). Исходники: `content/Дарданелла (все сезоны кроме зимы)/`.
 * Клипы: `scripts/encode-spring-7-dardanelle-movs.ps1` → `ddn.clip1..2`.
 * Макет `dardanelles` в `TourDetailGallery`: `camp` внизу (плитка 2×2 по сетке), клипы — 1x2.
 * Hero — `view`, фон «О туре» — `view3` (см. `prefaceBackgroundImageUrl` в данных тура).
 */
export const TOUR_SPRING_7_GALLERY_VIEWER = [
  `${TOUR_SPRING_7}/view.webp`,
  `${TOUR_SPRING_7}/view3.webp`,
  `${TOUR_SPRING_7}/ddn.clip1.webm`,
  `${TOUR_SPRING_7}/view2.webp`,
  `${TOUR_SPRING_7}/ddn.clip2.webm`,
  `${TOUR_SPRING_7}/yarchill.webp`,
  `${TOUR_SPRING_7}/exit2.webp`,
  `${TOUR_SPRING_7}/camp.webp`,
] as const;

export const TOUR_SPRING_7_GALLERY_GRID = [
  `${TOUR_SPRING_7}/view.webp`,
  `${TOUR_SPRING_7}/view3.webp`,
  `${TOUR_SPRING_7}/ddn.clip1.grid.webm`,
  `${TOUR_SPRING_7}/view2.webp`,
  `${TOUR_SPRING_7}/ddn.clip2.grid.webm`,
  `${TOUR_SPRING_7}/yarchill.webp`,
  `${TOUR_SPRING_7}/exit2.webp`,
  `${TOUR_SPRING_7}/camp.webp`,
] as const;

export const TOUR_SPRING_7_GRID_VIDEO_POSTERS: Record<string, string> = {
  [`${TOUR_SPRING_7}/ddn.clip1.grid.webm`]: `${TOUR_SPRING_7}/ddn.clip1.poster.webp`,
  [`${TOUR_SPRING_7}/ddn.clip2.grid.webm`]: `${TOUR_SPRING_7}/ddn.clip2.poster.webp`,
};

export const TOUR_SPRING_7_COVER_GRID = `${TOUR_SPRING_7}/view.webp` as const;
export const TOUR_SPRING_7_PREFACE_BACKGROUND = `${TOUR_SPRING_7}/view3.webp` as const;

/**
 * «Восхождение на г. Фалаза» (spring-8). Исходники: `content/Фалаза/`.
 * Макет: hero-панорама + отдельный фон «О туре», далее 5 кадров (включая клип).
 */
export const TOUR_SPRING_8_GALLERY_VIEWER = [
  `${TOUR_SPRING_8}/view3.webp`,
  `${TOUR_SPRING_8}/view.webp`,
  `${TOUR_SPRING_8}/top.webp`,
  `${TOUR_SPRING_8}/view2.webp`,
  `${TOUR_SPRING_8}/flz.clip1.webm`,
  `${TOUR_SPRING_8}/top2.webp`,
  `${TOUR_SPRING_8}/love_actually.webp`,
] as const;

export const TOUR_SPRING_8_GALLERY_GRID = [
  `${TOUR_SPRING_8}/view3.webp`,
  `${TOUR_SPRING_8}/view.webp`,
  `${TOUR_SPRING_8}/top.webp`,
  `${TOUR_SPRING_8}/view2.webp`,
  `${TOUR_SPRING_8}/flz.clip1.grid.webm`,
  `${TOUR_SPRING_8}/top2.webp`,
  `${TOUR_SPRING_8}/love_actually.webp`,
] as const;

export const TOUR_SPRING_8_GRID_VIDEO_POSTERS: Record<string, string> = {
  [`${TOUR_SPRING_8}/flz.clip1.grid.webm`]: `${TOUR_SPRING_8}/flz.clip1.poster.webp`,
};

export const TOUR_SPRING_8_COVER_GRID = `${TOUR_SPRING_8}/view3.webp` as const;
export const TOUR_SPRING_8_PREFACE_BACKGROUND = `${TOUR_SPRING_8}/view.webp` as const;

/**
 * «Восхождение на г. Воробей + Винодельня» (spring-9).
 * Макет: hero вершины + отдельный preface кадр винодельни, далее 9 кадров сетки с 3 вертикальными клипами.
 */
export const TOUR_SPRING_9_GALLERY_VIEWER = [
  `${TOUR_SPRING_9}/top3.webp`,
  `${TOUR_SPRING_9}/wine.webp`,
  `${TOUR_SPRING_9}/top.webp`,
  `${TOUR_SPRING_9}/view2.webp`,
  `${TOUR_SPRING_9}/vrb.clip1.webm`,
  `${TOUR_SPRING_9}/rocks.webp`,
  `${TOUR_SPRING_9}/vrb.clip2.webm`,
  `${TOUR_SPRING_9}/forest.webp`,
  `${TOUR_SPRING_9}/vrb.clip3.webm`,
  `${TOUR_SPRING_9}/sign.webp`,
  `${TOUR_SPRING_9}/top2.webp`,
] as const;

export const TOUR_SPRING_9_GALLERY_GRID = [
  `${TOUR_SPRING_9}/top3.webp`,
  `${TOUR_SPRING_9}/wine.webp`,
  `${TOUR_SPRING_9}/top.webp`,
  `${TOUR_SPRING_9}/view2.webp`,
  `${TOUR_SPRING_9}/vrb.clip1.grid.webm`,
  `${TOUR_SPRING_9}/rocks.webp`,
  `${TOUR_SPRING_9}/vrb.clip2.grid.webm`,
  `${TOUR_SPRING_9}/forest.webp`,
  `${TOUR_SPRING_9}/vrb.clip3.grid.webm`,
  `${TOUR_SPRING_9}/sign.webp`,
  `${TOUR_SPRING_9}/top2.webp`,
] as const;

export const TOUR_SPRING_9_GRID_VIDEO_POSTERS: Record<string, string> = {
  [`${TOUR_SPRING_9}/vrb.clip1.grid.webm`]: `${TOUR_SPRING_9}/vrb.clip1.poster.webp`,
  [`${TOUR_SPRING_9}/vrb.clip2.grid.webm`]: `${TOUR_SPRING_9}/vrb.clip2.poster.webp`,
  [`${TOUR_SPRING_9}/vrb.clip3.grid.webm`]: `${TOUR_SPRING_9}/vrb.clip3.poster.webp`,
};

export const TOUR_SPRING_9_COVER_GRID = `${TOUR_SPRING_9}/top3.webp` as const;
export const TOUR_SPRING_9_PREFACE_BACKGROUND = `${TOUR_SPRING_9}/wine.webp` as const;

/**
 * «Остров Аскольд» (spring-10). Фото: все шесть из `content/Аскольд/webp/`; MP4 (6 с): `encode-spring-10-askold-trimmed-mp4.ps1` → `ask.intro`; MOV: `encode-spring-10-askold-movs.ps1` → `ask.clip1..6` (в галерее не показываем `ask.clip1`, `ask.clip3`).
 * Hero — `view`, фон «О туре» — `beach`. В данных по порядку: intro, clip2, clip4–6, beacon, rock, view2, view3; раскладка `askold` — в `TourDetailGallery`.
 */
export const TOUR_SPRING_10_GALLERY_VIEWER = [
  `${TOUR_SPRING_10}/view.webp`,
  `${TOUR_SPRING_10}/beach.webp`,
  `${TOUR_SPRING_10}/ask.intro.webm`,
  `${TOUR_SPRING_10}/ask.clip2.webm`,
  `${TOUR_SPRING_10}/ask.clip4.webm`,
  `${TOUR_SPRING_10}/ask.clip5.webm`,
  `${TOUR_SPRING_10}/ask.clip6.webm`,
  `${TOUR_SPRING_10}/beacon.webp`,
  `${TOUR_SPRING_10}/rock.webp`,
  `${TOUR_SPRING_10}/view2.webp`,
  `${TOUR_SPRING_10}/view3.webp`,
] as const;

export const TOUR_SPRING_10_GALLERY_GRID = [
  `${TOUR_SPRING_10}/view.webp`,
  `${TOUR_SPRING_10}/beach.webp`,
  `${TOUR_SPRING_10}/ask.intro.grid.webm`,
  `${TOUR_SPRING_10}/ask.clip2.grid.webm`,
  `${TOUR_SPRING_10}/ask.clip4.grid.webm`,
  `${TOUR_SPRING_10}/ask.clip5.grid.webm`,
  `${TOUR_SPRING_10}/ask.clip6.grid.webm`,
  `${TOUR_SPRING_10}/beacon.webp`,
  `${TOUR_SPRING_10}/rock.webp`,
  `${TOUR_SPRING_10}/view2.webp`,
  `${TOUR_SPRING_10}/view3.webp`,
] as const;

export const TOUR_SPRING_10_GRID_VIDEO_POSTERS: Record<string, string> = {
  [`${TOUR_SPRING_10}/ask.intro.grid.webm`]: `${TOUR_SPRING_10}/ask.intro.poster.webp`,
  [`${TOUR_SPRING_10}/ask.clip2.grid.webm`]: `${TOUR_SPRING_10}/ask.clip2.poster.webp`,
  [`${TOUR_SPRING_10}/ask.clip4.grid.webm`]: `${TOUR_SPRING_10}/ask.clip4.poster.webp`,
  [`${TOUR_SPRING_10}/ask.clip5.grid.webm`]: `${TOUR_SPRING_10}/ask.clip5.poster.webp`,
  [`${TOUR_SPRING_10}/ask.clip6.grid.webm`]: `${TOUR_SPRING_10}/ask.clip6.poster.webp`,
};

export const TOUR_SPRING_10_COVER_GRID = `${TOUR_SPRING_10}/view.webp` as const;
export const TOUR_SPRING_10_PREFACE_BACKGROUND = `${TOUR_SPRING_10}/beach.webp` as const;

/** Сетка `askold`: вертикальные панорамы — якорь обрезки в `TourDetailGallery`. */
export const TOUR_SPRING_10_VIEW2_GRID = `${TOUR_SPRING_10}/view2.webp` as const;
export const TOUR_SPRING_10_VIEW3_GRID = `${TOUR_SPRING_10}/view3.webp` as const;

/**
 * Короткие лупы для баннера главной (колонки 0…9 ↔ `UI.homeSeasonBannerWordmark`).
 * Файлы в `public/banners_winter/`. Генерация: `npm run generate:banner-loops` / `scripts/generate-home-season-banner-loop-videos.ps1` (`-Posters`).
 * Синхронизировать таблицу нарезок в скриптах и `src/data/homeSeasonBannerClips.ts`.
 */
const BANNER_WINTER = HOME_SEASON_BANNER_MEDIA_BASE.winter;

export const HOME_SEASON_BANNER_WINTER_LOOP_VIDEOS = [
  `${BANNER_WINTER}/gr.clip1.banner-loop.webm`,
  `${BANNER_WINTER}/gr.clip3.banner-loop.webm`,
  `${BANNER_WINTER}/gr.clip4.banner-loop.webm`,
  `${BANNER_WINTER}/gr.clip5.banner-loop.webm`,
  `${BANNER_WINTER}/hs.clip1.banner-loop.webm`,
  `${BANNER_WINTER}/ars.clip1.banner-loop.webm`,
  `${BANNER_WINTER}/ars.clip2.banner-loop.webm`,
  `${BANNER_WINTER}/gr.board.banner-loop.webm`,
  `${BANNER_WINTER}/gr.elya.banner-loop.webm`,
  `${BANNER_WINTER}/gr.bbq.banner-loop.webm`,
] as const;

/** Постеры для `<video poster>` лупов баннера (первый кадр нарезки). */
export const HOME_SEASON_BANNER_WINTER_LOOP_VIDEO_POSTERS: Record<string, string> = {
  [HOME_SEASON_BANNER_WINTER_LOOP_VIDEOS[0]]: `${BANNER_WINTER}/gr.clip1.banner-loop.poster.webp`,
  [HOME_SEASON_BANNER_WINTER_LOOP_VIDEOS[1]]: `${BANNER_WINTER}/gr.clip3.banner-loop.poster.webp`,
  [HOME_SEASON_BANNER_WINTER_LOOP_VIDEOS[2]]: `${BANNER_WINTER}/gr.clip4.banner-loop.poster.webp`,
  [HOME_SEASON_BANNER_WINTER_LOOP_VIDEOS[3]]: `${BANNER_WINTER}/gr.clip5.banner-loop.poster.webp`,
  [HOME_SEASON_BANNER_WINTER_LOOP_VIDEOS[4]]: `${BANNER_WINTER}/hs.clip1.banner-loop.poster.webp`,
  [HOME_SEASON_BANNER_WINTER_LOOP_VIDEOS[5]]: `${BANNER_WINTER}/ars.clip1.banner-loop.poster.webp`,
  [HOME_SEASON_BANNER_WINTER_LOOP_VIDEOS[6]]: `${BANNER_WINTER}/ars.clip2.banner-loop.poster.webp`,
  [HOME_SEASON_BANNER_WINTER_LOOP_VIDEOS[7]]: `${BANNER_WINTER}/gr.board.banner-loop.poster.webp`,
  [HOME_SEASON_BANNER_WINTER_LOOP_VIDEOS[8]]: `${BANNER_WINTER}/gr.elya.banner-loop.poster.webp`,
  [HOME_SEASON_BANNER_WINTER_LOOP_VIDEOS[9]]: `${BANNER_WINTER}/gr.bbq.banner-loop.poster.webp`,
};

/**
 * Весна: баннер ворот главной из оптимизированных grid-клипов туров spring-2/spring-3.
 * До появления новых spring-лупов в `public/banners_spring/` дублируем клипы #2 и #5, чтобы закрыть 10 колонок.
 */
export const HOME_SEASON_BANNER_SPRING_LOOP_VIDEOS = [
  `${TOUR_SPRING_2}/olv.clip1.grid.webm`,
  TOUR_SPRING_4_CLIP1_GRID_WEBM,
  `${TOUR_SPRING_3}/pd.clip2.grid.webm`,
  `${TOUR_SPRING_3}/pd.clip5.grid.webm`,
  `${TOUR_SPRING_3}/pd.clip4.grid.webm`,
  `${TOUR_SPRING_3}/pd.clip3.grid.webm`,
  `${TOUR_SPRING_3}/pd.clip6.grid.webm`,
  `${TOUR_SPRING_3}/pd.clip7.grid.webm`,
  TOUR_SPRING_4_CLIP1_GRID_WEBM,
  `${TOUR_SPRING_3}/pd.clip4.grid.webm`,
] as const;

export const HOME_SEASON_BANNER_SPRING_LOOP_VIDEO_POSTERS: Record<string, string> = {
  [HOME_SEASON_BANNER_SPRING_LOOP_VIDEOS[0]]: `${TOUR_SPRING_2}/olv.clip1.poster.webp`,
  [HOME_SEASON_BANNER_SPRING_LOOP_VIDEOS[1]]: TOUR_SPRING_4_CLIP1_POSTER_WEBP,
  [HOME_SEASON_BANNER_SPRING_LOOP_VIDEOS[2]]: `${TOUR_SPRING_3}/pd.clip2.poster.webp`,
  [HOME_SEASON_BANNER_SPRING_LOOP_VIDEOS[3]]: `${TOUR_SPRING_3}/pd.clip5.poster.webp`,
  [HOME_SEASON_BANNER_SPRING_LOOP_VIDEOS[4]]: `${TOUR_SPRING_3}/pd.clip4.poster.webp`,
  [HOME_SEASON_BANNER_SPRING_LOOP_VIDEOS[5]]: `${TOUR_SPRING_3}/pd.clip3.poster.webp`,
  [HOME_SEASON_BANNER_SPRING_LOOP_VIDEOS[6]]: `${TOUR_SPRING_3}/pd.clip6.poster.webp`,
  [HOME_SEASON_BANNER_SPRING_LOOP_VIDEOS[7]]: `${TOUR_SPRING_3}/pd.clip7.poster.webp`,
  [HOME_SEASON_BANNER_SPRING_LOOP_VIDEOS[8]]: TOUR_SPRING_4_CLIP1_POSTER_WEBP,
  [HOME_SEASON_BANNER_SPRING_LOOP_VIDEOS[9]]: `${TOUR_SPRING_3}/pd.clip4.poster.webp`,
};

/** Логотип мессенджера MAX в модалке заявки — файл в `public/max-messenger-sign-logo.svg`. */
export const MAX_MESSENGER_SIGN_LOGO = `${PUBLIC_ASSET_BASE}max-messenger-sign-logo.svg` as const;

/** Графический знак Вкрайности (лес), не текстовый вордмарк — `public/vkrai-logo.png`. */
export const VKRAI_FOREST_LOGO = `${PUBLIC_ASSET_BASE}vkrai-logo.png` as const;

/**
 * Обложки весенних туров: spring-1…4 — первый кадр сетки из `public/tours/spring-N/`;
 * spring-5 — `public/tours/spring-5/`; spring-6 — `public/tours/spring-6/`; spring-7 — `public/tours/spring-7/` (VP9 `ddn.clip*`);
 * spring-10 — `public/tours/spring-10/` (`content/Аскольд/webp`, MOV → `encode-spring-10-askold-movs.ps1`).
 */
export const SPRING_TOUR_COVERS = {
  'spring-1': TOUR_SPRING_1_COVER,
  'spring-2': TOUR_SPRING_2_COVER,
  'spring-3': TOUR_SPRING_3_COVER,
  'spring-4': TOUR_SPRING_4_COVER_GRID,
  'spring-5': TOUR_SPRING_5_COVER_GRID,
  'spring-6': TOUR_SPRING_6_COVER_GRID,
  'spring-7': TOUR_SPRING_7_COVER_GRID,
  'spring-8': TOUR_SPRING_8_COVER_GRID,
  'spring-9': TOUR_SPRING_9_COVER_GRID,
  'spring-10': TOUR_SPRING_10_COVER_GRID,
} as const;

export const IMAGES = {
  hero: {
    winter: `${BASE}/1920x1080/7BA7BC/ffffff?text=Зима+·+Вкрайности`,
    /** Фон плейсхолдера — `colors.season.spring` (без `#`). */
    spring: `${BASE}/1920x1080/C76B7E/ffffff?text=Весна+·+Вкрайности`,
    summer: `${BASE}/1920x1080/E8A838/ffffff?text=Лето+·+Вкрайности`,
    fall:   `${BASE}/1920x1080/C8622A/ffffff?text=Осень+·+Вкрайности`,
  },
  /** Статичные постеры колонок баннера на стартовом экране (без видео-лупов). */
  seasonSection: {
    winter: `${HOME_SEASON_BANNER_MEDIA_BASE.winter}/winter.png`,
    spring: `${HOME_SEASON_BANNER_MEDIA_BASE.spring}/spring.png`,
    summer: `${HOME_SEASON_BANNER_MEDIA_BASE.summer}/Summer.png`,
    fall:   `${HOME_SEASON_BANNER_MEDIA_BASE.fall}/fall.png`,
  },
  team: {
    placeholder: `${BASE}/400x500/1A3C2E/C8A96E?text=Эксперт`,
  },
  tours: {
    placeholder: `${BASE}/600x400/1A3C2E/C8A96E?text=Тур`,
    gallery:     `${BASE}/800x600/1A3C2E/C8A96E?text=Фото+тура`,
  },
} as const;
