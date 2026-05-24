import { PUBLIC_ASSET_BASE } from './fonts';
import type { Season } from '../types';

const BASE = 'https://placehold.co';

/** Папки туров: `public/tours/{tourId}/` — обложка и галерея одного маршрута. */
const TOURS_ASSET_BASE = `${PUBLIC_ASSET_BASE}tours`;

/**
 * Стартовый экран главной (`HomeSeasonBanner`): базовые папки сезона (`public/banners_*`).
 * Зимние/весенние видео колонок — сжатые `*.grid.webm` из `public/tours/` (`HOME_SEASON_BANNER_*_LOOP_VIDEOS`).
 */
export const HOME_SEASON_BANNER_MEDIA_BASE: Record<Season, string> = {
  winter: `${PUBLIC_ASSET_BASE}banners_winter`,
  spring: `${PUBLIC_ASSET_BASE}banners_spring`,
  summer: `${PUBLIC_ASSET_BASE}banners_summer`,
  fall: `${PUBLIC_ASSET_BASE}banners_fall`,
} as const;

const TOUR_WINTER_1 = `${TOURS_ASSET_BASE}/winter-1`;
export const TOUR_WINTER_1_COVER = `${TOUR_WINTER_1}/hero.webp` as const;

/** Галерея «Восхождение на Изюбриную» — качественные фото и полные видео. */
export const TOUR_WINTER_1_GALLERY_VIEWER = [
  TOUR_WINTER_1_COVER,
  `${TOUR_WINTER_1}/iz.close.webp`,
  `${TOUR_WINTER_1}/iz.peoplewalk.webp`,
  `${TOUR_WINTER_1}/trees2.webp`,
  `${TOUR_WINTER_1}/trees.webp`,
  `${TOUR_WINTER_1}/iz.top.webp`,
  `${TOUR_WINTER_1}/iz.rest2.webp`,
  `${TOUR_WINTER_1}/iz.pan2.webp`,
  `${TOUR_WINTER_1}/iz.rest4.webp`,
] as const;

/** Медиа для сетки: фото берём из качественной галереи; grid-варианты оставляем только для видео. */
export const TOUR_WINTER_1_GALLERY_GRID = TOUR_WINTER_1_GALLERY_VIEWER;

/** Верхний ряд рядом с панорамой — растягивание по высоте строки (`sm+`). */
export const TOUR_WINTER_1_TOP_IMAGE = TOUR_WINTER_1_GALLERY_GRID[5];

/** Кадр с посадкой / людьми — отдельное кадрирование в `TourDetailGallery`. */
export const TOUR_WINTER_1_REST4_IMAGE = TOUR_WINTER_1_GALLERY_GRID[8];

/** Совпадает с `TOUR_WINTER_1_GALLERY_VIEWER`. */
export const TOUR_WINTER_1_GALLERY = TOUR_WINTER_1_GALLERY_VIEWER;

export const TOUR_WINTER_1_COVER_GRID = TOUR_WINTER_1_GALLERY_GRID[0];

const TOUR_WINTER_2 = `${TOURS_ASSET_BASE}/winter-2`;

/** Галерея «Восхождение на г. Голец» — качественные фото и полные видео. */
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

export const TOUR_WINTER_2_GALLERY_GRID = TOUR_WINTER_2_GALLERY_VIEWER;

/** Кадр вершины — полная ширина сетки (`TourDetailGallery`, Голец). */
export const TOUR_WINTER_2_PEAK_IMAGE = TOUR_WINTER_2_GALLERY_GRID[5];

export const TOUR_WINTER_2_GALLERY = TOUR_WINTER_2_GALLERY_VIEWER;

export const TOUR_WINTER_2_COVER_GRID = TOUR_WINTER_2_GALLERY_GRID[0];
export const TOUR_WINTER_2_COVER = `${TOUR_WINTER_2}/hero.webp` as const;

const TOUR_WINTER_3 = `${TOURS_ASSET_BASE}/winter-3`;

/**
 * Галерея «Фалаза × Грибановка» — still-кадры (webp; на видео-слотах — poster).
 * [0] обложка, [1] второй кадр; `gr.boarder` не в массиве — `TOUR_WINTER_3_PREFACE_BACKGROUND`.
 */
export const TOUR_WINTER_3_GALLERY_VIEWER = [
  `${TOUR_WINTER_3}/gr.falaza.webp`,
  `${TOUR_WINTER_3}/gr.griba.webp`,
  `${TOUR_WINTER_3}/gr.lift.webp`,
  `${TOUR_WINTER_3}/gr.clip1.poster.webp`,
  `${TOUR_WINTER_3}/gr.board.webp`,
  `${TOUR_WINTER_3}/gr.board2.webp`,
  `${TOUR_WINTER_3}/gr.clip2.poster.webp`,
  `${TOUR_WINTER_3}/gr.elya.webp`,
  `${TOUR_WINTER_3}/gr.instr.webp`,
  `${TOUR_WINTER_3}/gr.clip3.poster.webp`,
  `${TOUR_WINTER_3}/gr.bbq.webp`,
  `${TOUR_WINTER_3}/gr.clip4.poster.webp`,
  `${TOUR_WINTER_3}/gr.clip5.poster.webp`,
] as const;

/**
 * Те же индексы, что у `TOUR_WINTER_3_GALLERY_VIEWER`: фото качественные, видео — VP9 `*.grid.webm`.
 * Кадры склона, Эли и барбекю в сетке — `*.webp`; VP9 для баннера главной — `TOUR_WINTER_3_BOARD_GRID_WEBM` и др.
 */
export const TOUR_WINTER_3_GALLERY_GRID = [
  TOUR_WINTER_3_GALLERY_VIEWER[0],
  TOUR_WINTER_3_GALLERY_VIEWER[1],
  TOUR_WINTER_3_GALLERY_VIEWER[2],
  `${TOUR_WINTER_3}/gr.clip1.grid.webm`,
  TOUR_WINTER_3_GALLERY_VIEWER[4],
  TOUR_WINTER_3_GALLERY_VIEWER[5],
  `${TOUR_WINTER_3}/gr.clip2.grid.webm`,
  TOUR_WINTER_3_GALLERY_VIEWER[7],
  TOUR_WINTER_3_GALLERY_VIEWER[8],
  `${TOUR_WINTER_3}/gr.clip3.grid.webm`,
  TOUR_WINTER_3_GALLERY_VIEWER[10],
  `${TOUR_WINTER_3}/gr.clip4.grid.webm`,
  `${TOUR_WINTER_3}/gr.clip5.grid.webm`,
] as const;

/** Совпадает с `TOUR_WINTER_3_GALLERY_VIEWER` — для тестов и обратной совместимости импортов. */
export const TOUR_WINTER_3_GALLERY = TOUR_WINTER_3_GALLERY_VIEWER;

/** Обложка карточки и hero: оптимизированный кадр. */
export const TOUR_WINTER_3_COVER_GRID = TOUR_WINTER_3_GALLERY_GRID[0];

export const TOUR_WINTER_3_COVER = `${TOUR_WINTER_3}/hero.webp` as const;

/** После `galleryGridUrls.slice(2)` — ветка `TourDetailGallery` сравнивает с URL сеточного массива. */
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
/** Мобильная версия фона блока «О туре» (сниженный вес для раннего рендера tour detail). */
export const TOUR_WINTER_3_PREFACE_BACKGROUND_MOBILE =
  `${TOUR_WINTER_3}/gr.boarder.mobile.webp` as const;

/**
 * Сжатые VP9 для баннера главной (склон / Эля / барбекю). В сетке страницы тура — качественные `*.webp`.
 * Сборка: `scripts/generate-winter-3-banner-stub-videos.ps1`.
 */
export const TOUR_WINTER_3_BOARD_GRID_WEBM = `${TOUR_WINTER_3}/gr.board.grid.webm` as const;
export const TOUR_WINTER_3_ELYA_GRID_WEBM = `${TOUR_WINTER_3}/gr.elya.grid.webm` as const;
export const TOUR_WINTER_3_BBQ_GRID_WEBM = `${TOUR_WINTER_3}/gr.bbq.grid.webm` as const;

const TOUR_WINTER_4 = `${TOURS_ASSET_BASE}/winter-4`;

/** Главный кадр hero / карточка (полное качество; не обязан совпадать с [0] галереи). */
export const TOUR_WINTER_4_COVER = `${TOUR_WINTER_4}/hero.webp` as const;

/**
 * Галерея «Хаски-тур» — still-кадры (webp; на видео-слотах — poster).
 * [0] первый кадр после hero, [1] фон «О туре».
 */
export const TOUR_WINTER_4_GALLERY_VIEWER = [
  `${TOUR_WINTER_4}/hs.team.webp`,
  `${TOUR_WINTER_4}/hs.uprazh.webp`,
  `${TOUR_WINTER_4}/hs.clip1.poster.webp`,
  `${TOUR_WINTER_4}/hs.doggo.webp`,
  `${TOUR_WINTER_4}/hs.doggos.webp`,
  `${TOUR_WINTER_4}/hs.clip2.poster.webp`,
  `${TOUR_WINTER_4}/hs.gora2.webp`,
  `${TOUR_WINTER_4}/hs.gora.webp`,
] as const;

/** Сетка: фото качественные, клипы — VP9 `*.grid.webm`. */
export const TOUR_WINTER_4_GALLERY_GRID = [
  TOUR_WINTER_4_GALLERY_VIEWER[0],
  TOUR_WINTER_4_GALLERY_VIEWER[1],
  `${TOUR_WINTER_4}/hs.clip1.grid.webm`,
  TOUR_WINTER_4_GALLERY_VIEWER[3],
  TOUR_WINTER_4_GALLERY_VIEWER[4],
  `${TOUR_WINTER_4}/hs.clip2.grid.webm`,
  TOUR_WINTER_4_GALLERY_VIEWER[6],
  TOUR_WINTER_4_GALLERY_VIEWER[7],
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
export const TOUR_WINTER_4_GRID_VIDEO_POSTERS_MOBILE: Record<string, string> = {
  [TOUR_WINTER_4_GALLERY_GRID[2]]: `${TOUR_WINTER_4}/hs.clip1.poster.mobile.webp`,
  [TOUR_WINTER_4_GALLERY_GRID[5]]: `${TOUR_WINTER_4}/hs.clip2.poster.mobile.webp`,
};

const TOUR_WINTER_5 = `${TOURS_ASSET_BASE}/winter-5`;

/**
 * Галерея «АрсГора» — качественные фото и полные видео.
 * [0] обложка, [1] preface; сетка `arsgora` — портрет; bento doggie|clip1; низ — clip2, trans-tail, team.
 */
export const TOUR_WINTER_5_GALLERY_VIEWER = [
  `${TOUR_WINTER_5}/ars.main.webp`,
  `${TOUR_WINTER_5}/ars.preface.webp`,
  `${TOUR_WINTER_5}/ars.lift.webp`,
  `${TOUR_WINTER_5}/ars.doggie.webp`,
  `${TOUR_WINTER_5}/ars.clip1.poster.webp`,
  `${TOUR_WINTER_5}/ars.clip2.poster.webp`,
  `${TOUR_WINTER_5}/ars.trans-tail.webp`,
  `${TOUR_WINTER_5}/ars.team.webp`,
] as const;

/** Те же индексы: фото качественные, для клипов — VP9 `*.grid.webm`. */
export const TOUR_WINTER_5_GALLERY_GRID = [
  TOUR_WINTER_5_GALLERY_VIEWER[0],
  TOUR_WINTER_5_GALLERY_VIEWER[1],
  TOUR_WINTER_5_GALLERY_VIEWER[2],
  TOUR_WINTER_5_GALLERY_VIEWER[3],
  `${TOUR_WINTER_5}/ars.clip1.grid.webm`,
  `${TOUR_WINTER_5}/ars.clip2.grid.webm`,
  TOUR_WINTER_5_GALLERY_VIEWER[6],
  TOUR_WINTER_5_GALLERY_VIEWER[7],
] as const;

/** Совпадает с `TOUR_WINTER_5_GALLERY_VIEWER`. */
export const TOUR_WINTER_5_GALLERY = TOUR_WINTER_5_GALLERY_VIEWER;

export const TOUR_WINTER_5_COVER_GRID = TOUR_WINTER_5_GALLERY_GRID[0];
export const TOUR_WINTER_5_COVER = `${TOUR_WINTER_5}/hero.webp` as const;

/** Постеры для ленивого видео в сетке (winter-5). */
export const TOUR_WINTER_5_GRID_VIDEO_POSTERS: Record<string, string> = {
  [TOUR_WINTER_5_GALLERY_GRID[4]]: `${TOUR_WINTER_5}/ars.clip1.poster.webp`,
  [TOUR_WINTER_5_GALLERY_GRID[5]]: `${TOUR_WINTER_5}/ars.clip2.poster.webp`,
};

const TOUR_SPRING_1 = `${TOURS_ASSET_BASE}/spring-1`;

/** «Лысый Дед» — качественные фото. */
export const TOUR_SPRING_1_GALLERY_VIEWER = [
  `${TOUR_SPRING_1}/ld.hero.webp`,
  `${TOUR_SPRING_1}/ld.preface.webp`,
  `${TOUR_SPRING_1}/ld.descent.webp`,
  `${TOUR_SPRING_1}/ld.ridge.webp`,
  `${TOUR_SPRING_1}/ld.summit.webp`,
  `${TOUR_SPRING_1}/ld.approach.webp`,
] as const;

/** Медиа для сетки: фото берём из качественной галереи. */
export const TOUR_SPRING_1_GALLERY_GRID = TOUR_SPRING_1_GALLERY_VIEWER;

export const TOUR_SPRING_1_COVER_GRID = TOUR_SPRING_1_GALLERY_GRID[0];
export const TOUR_SPRING_1_COVER = `${TOUR_SPRING_1}/hero.webp` as const;

const TOUR_SPRING_2 = `${TOURS_ASSET_BASE}/spring-2`;

/** «Ольховая» — still-кадры (webp; clip1 — poster). */
export const TOUR_SPRING_2_GALLERY_VIEWER = [
  `${TOUR_SPRING_2}/olv.hero.webp`,
  `${TOUR_SPRING_2}/olv.preface.webp`,
  `${TOUR_SPRING_2}/olv.lake1.webp`,
  `${TOUR_SPRING_2}/olv.ridge.webp`,
  `${TOUR_SPRING_2}/olv.summit.webp`,
  `${TOUR_SPRING_2}/olv.clip1.poster.webp`,
] as const;

export const TOUR_SPRING_2_GALLERY_GRID = [
  TOUR_SPRING_2_GALLERY_VIEWER[0],
  TOUR_SPRING_2_GALLERY_VIEWER[1],
  TOUR_SPRING_2_GALLERY_VIEWER[2],
  TOUR_SPRING_2_GALLERY_VIEWER[3],
  TOUR_SPRING_2_GALLERY_VIEWER[4],
  `${TOUR_SPRING_2}/olv.clip1.grid.webm`,
] as const;

/** Первый кадр сетки после hero/preface — `galleryGridUrls.slice(2)` [0] («Ольховая»). */
export const TOUR_SPRING_2_LAKE1_IMAGE = TOUR_SPRING_2_GALLERY_GRID[2];

export const TOUR_SPRING_2_GRID_VIDEO_POSTERS: Record<string, string> = {
  [TOUR_SPRING_2_GALLERY_GRID[5]]: `${TOUR_SPRING_2}/olv.clip1.poster.webp`,
};

export const TOUR_SPRING_2_COVER_GRID = TOUR_SPRING_2_GALLERY_GRID[0];
export const TOUR_SPRING_2_COVER = `${TOUR_SPRING_2}/hero.webp` as const;

const TOUR_SPRING_3 = `${TOURS_ASSET_BASE}/spring-3`;
const TOUR_SPRING_4 = `${TOURS_ASSET_BASE}/spring-4`;
const TOUR_SPRING_5 = `${TOURS_ASSET_BASE}/spring-5`;

/** Первый ролик «Сестра» (`ss.clip1.*`); постер — для grid-webm в сетке и баннере главной. */
export const TOUR_SPRING_4_CLIP1_GRID_WEBM = `${TOUR_SPRING_4}/ss.clip1.grid.webm` as const;
export const TOUR_SPRING_4_CLIP1_POSTER_WEBP = `${TOUR_SPRING_4}/ss.clip1.poster.webp` as const;
export const TOUR_SPRING_4_CLIP3_GRID_WEBM = `${TOUR_SPRING_4}/ss.clip3.grid.webm` as const;
export const TOUR_SPRING_4_CLIP5_GRID_WEBM = `${TOUR_SPRING_4}/ss.clip5.grid.webm` as const;

/** «Пидан» — качественные фото и полные видео. `taiga` и `clip3` переставлены относительно исходного порядка ассетов. */
export const TOUR_SPRING_3_GALLERY_VIEWER = [
  `${TOUR_SPRING_3}/pd.hero.webp`,
  `${TOUR_SPRING_3}/pd.preface.webp`,
  `${TOUR_SPRING_3}/pd.group.webp`,
  `${TOUR_SPRING_3}/pd.clip3.poster.webp`,
  `${TOUR_SPRING_3}/pd.clip2.poster.webp`,
  `${TOUR_SPRING_3}/pd.ridge.webp`,
  `${TOUR_SPRING_3}/pd.clip5.poster.webp`,
  `${TOUR_SPRING_3}/pd.summit.webp`,
  `${TOUR_SPRING_3}/pd.clip4.poster.webp`,
  `${TOUR_SPRING_3}/pd.sea.webp`,
  `${TOUR_SPRING_3}/pd.taiga.webp`,
  `${TOUR_SPRING_3}/pd.clip6.poster.webp`,
  `${TOUR_SPRING_3}/pd.clip7.poster.webp`,
] as const;

/** Фон блока «О туре», когда hero/обложка берут кадр `pd.preface` (`tour.prefaceBackgroundImageUrl`). */
export const TOUR_SPRING_3_PREFACE_BLOCK_BACKGROUND_VIEWER =
  TOUR_SPRING_3_GALLERY_VIEWER[0];

export const TOUR_SPRING_3_GALLERY_GRID = [
  TOUR_SPRING_3_GALLERY_VIEWER[0],
  TOUR_SPRING_3_GALLERY_VIEWER[1],
  TOUR_SPRING_3_GALLERY_VIEWER[2],
  `${TOUR_SPRING_3}/pd.clip3.grid.webm`,
  `${TOUR_SPRING_3}/pd.clip2.grid.webm`,
  TOUR_SPRING_3_GALLERY_VIEWER[5],
  `${TOUR_SPRING_3}/pd.clip5.grid.webm`,
  TOUR_SPRING_3_GALLERY_VIEWER[7],
  `${TOUR_SPRING_3}/pd.clip4.grid.webm`,
  TOUR_SPRING_3_GALLERY_VIEWER[9],
  TOUR_SPRING_3_GALLERY_VIEWER[10],
  `${TOUR_SPRING_3}/pd.clip6.grid.webm`,
  `${TOUR_SPRING_3}/pd.clip7.grid.webm`,
] as const;

/** Первый кадр сетки после hero/preface — `slice(2)` [0] («Пидан», макет `pidan`). */
export const TOUR_SPRING_3_GROUP_IMAGE = TOUR_SPRING_3_GALLERY_GRID[2];

export const TOUR_SPRING_3_GRID_VIDEO_POSTERS: Record<string, string> = {
  [TOUR_SPRING_3_GALLERY_GRID[3]]: `${TOUR_SPRING_3}/pd.clip3.poster.webp`,
  [TOUR_SPRING_3_GALLERY_GRID[4]]: `${TOUR_SPRING_3}/pd.clip2.poster.webp`,
  [TOUR_SPRING_3_GALLERY_GRID[6]]: `${TOUR_SPRING_3}/pd.clip5.poster.webp`,
  [TOUR_SPRING_3_GALLERY_GRID[8]]: `${TOUR_SPRING_3}/pd.clip4.poster.webp`,
  [TOUR_SPRING_3_GALLERY_GRID[11]]: `${TOUR_SPRING_3}/pd.clip6.poster.webp`,
  [TOUR_SPRING_3_GALLERY_GRID[12]]: `${TOUR_SPRING_3}/pd.clip7.poster.webp`,
};

/** Карточка и hero страницы — отдельный hero-баннер; `pd.hero` остаётся в сетке как [0]. */
export const TOUR_SPRING_3_COVER_GRID = TOUR_SPRING_3_GALLERY_GRID[1];
export const TOUR_SPRING_3_COVER = `${TOUR_SPRING_3}/hero.webp` as const;

/**
 * Обложка карточки и hero — отдельный hero-баннер; вершина `ss.topping` — фон блока «О туре»
 * (`tour.prefaceBackgroundImageUrl`, см. `toursData` spring-4).
 */
export const TOUR_SPRING_4_COVER_GRID = `${TOUR_SPRING_4}/hero.webp` as const;

/** Фон блока «О туре» для «Сестры» (viewer, полное качество). */
export const TOUR_SPRING_4_PREFACE_BACKGROUND = `${TOUR_SPRING_4}/ss.topping.webp` as const;

/**
 * «Сестра» — качественные фото и полные видео. Макет `sestra` (как «Пидан»): после hero/preface
 * group, taiga, clip1…clip6 и clip8 в слотах 2,3,5,6,7,9,10,11; фото — topping, pan между роликами (clip7 исключён).
 */
export const TOUR_SPRING_4_GALLERY_VIEWER = [
  `${TOUR_SPRING_4}/ss.topping.webp`,
  `${TOUR_SPRING_4}/ss.pan.webp`,
  `${TOUR_SPRING_4}/ss.team.webp`,
  `${TOUR_SPRING_4}/ss.taiga.webp`,
  TOUR_SPRING_4_CLIP1_POSTER_WEBP,
  `${TOUR_SPRING_4}/ss.clip2.poster.webp`,
  `${TOUR_SPRING_4}/ss.pan.webp`,
  `${TOUR_SPRING_4}/ss.clip3.poster.webp`,
  `${TOUR_SPRING_4}/ss.clip4.poster.webp`,
  `${TOUR_SPRING_4}/ss.clip5.poster.webp`,
  `${TOUR_SPRING_4}/ss.topping.webp`,
  `${TOUR_SPRING_4}/ss.clip6.poster.webp`,
  `${TOUR_SPRING_4}/ss.clip8.poster.webp`,
] as const;

/** Сетка «Сестра»: фото качественные, VP9 grid-webm для клипов; clip7 исключён из тура. */
export const TOUR_SPRING_4_GALLERY_GRID = [
  TOUR_SPRING_4_GALLERY_VIEWER[0],
  TOUR_SPRING_4_GALLERY_VIEWER[1],
  TOUR_SPRING_4_GALLERY_VIEWER[2],
  TOUR_SPRING_4_GALLERY_VIEWER[3],
  TOUR_SPRING_4_CLIP1_GRID_WEBM,
  `${TOUR_SPRING_4}/ss.clip2.grid.webm`,
  TOUR_SPRING_4_GALLERY_VIEWER[6],
  TOUR_SPRING_4_CLIP3_GRID_WEBM,
  `${TOUR_SPRING_4}/ss.clip4.grid.webm`,
  TOUR_SPRING_4_CLIP5_GRID_WEBM,
  TOUR_SPRING_4_GALLERY_VIEWER[10],
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
 * «Читинза» (spring-5): hero/preface, затем 10 кадров сетки (`slice(2)`).
 * Первый в сетке — `ctz.clip4` (2×2 в макете); hero — `peak2`; `peak.webp` исключён.
 * Клипы: `scripts/encode-chitinza-tour-movs.ps1` → `ctz.clip1..4` (.webm / .grid.webm / .poster.webp).
 */
export const TOUR_SPRING_5_GALLERY_VIEWER = [
  `${TOUR_SPRING_5}/peak2.webp`,
  `${TOUR_SPRING_5}/view.webp`,
  `${TOUR_SPRING_5}/ctz.clip4.poster.webp`,
  `${TOUR_SPRING_5}/woods.webp`,
  `${TOUR_SPRING_5}/yar.webp`,
  `${TOUR_SPRING_5}/ctz.clip1.poster.webp`,
  `${TOUR_SPRING_5}/ctz.clip2.poster.webp`,
  `${TOUR_SPRING_5}/ctz.clip3.poster.webp`,
  `${TOUR_SPRING_5}/forest.webp`,
  `${TOUR_SPRING_5}/top.webp`,
  `${TOUR_SPRING_5}/peak5.webp`,
  `${TOUR_SPRING_5}/hike.webp`,
] as const;

export const TOUR_SPRING_5_GALLERY_GRID = [
  `${TOUR_SPRING_5}/peak2.webp`,
  `${TOUR_SPRING_5}/view.webp`,
  `${TOUR_SPRING_5}/ctz.clip4.grid.webm`,
  `${TOUR_SPRING_5}/woods.webp`,
  `${TOUR_SPRING_5}/yar.webp`,
  `${TOUR_SPRING_5}/ctz.clip1.grid.webm`,
  `${TOUR_SPRING_5}/ctz.clip2.grid.webm`,
  `${TOUR_SPRING_5}/ctz.clip3.grid.webm`,
  `${TOUR_SPRING_5}/forest.webp`,
  `${TOUR_SPRING_5}/top.webp`,
  `${TOUR_SPRING_5}/peak5.webp`,
  `${TOUR_SPRING_5}/hike.webp`,
] as const;

/** Первый кадр сетки после hero/preface — `ctz.clip4` (макет `chitinza`, плитка 2×2). */
export const TOUR_SPRING_5_GROUP_IMAGE = TOUR_SPRING_5_GALLERY_GRID[2];

export const TOUR_SPRING_5_GRID_VIDEO_POSTERS: Record<string, string> = {
  [`${TOUR_SPRING_5}/ctz.clip1.grid.webm`]: `${TOUR_SPRING_5}/ctz.clip1.poster.webp`,
  [`${TOUR_SPRING_5}/ctz.clip2.grid.webm`]: `${TOUR_SPRING_5}/ctz.clip2.poster.webp`,
  [`${TOUR_SPRING_5}/ctz.clip3.grid.webm`]: `${TOUR_SPRING_5}/ctz.clip3.poster.webp`,
  [`${TOUR_SPRING_5}/ctz.clip4.grid.webm`]: `${TOUR_SPRING_5}/ctz.clip4.poster.webp`,
};

export const TOUR_SPRING_5_COVER_GRID = `${TOUR_SPRING_5}/hero.webp` as const;

const TOUR_SPRING_6 = `${TOURS_ASSET_BASE}/spring-6`;

/**
 * «Маралы х Драконы» (spring-6). Исходники: `content/МаралыXДраконы/webp/`.
 * Клипы: `scripts/encode-spring-6-maral-dragon-movs.ps1` → `mnd.clip1..5`.
 * Макет сетки — как «Читинза» (`chitinza`): 11 кадров после hero/preface; `hills3` только фон «О туре».
 */
export const TOUR_SPRING_6_PREFACE_BACKGROUND = `${TOUR_SPRING_6}/hills3.webp` as const;

export const TOUR_SPRING_6_GALLERY_VIEWER = [
  `${TOUR_SPRING_6}/deerlol.webp`,
  `${TOUR_SPRING_6}/view.webp`,
  `${TOUR_SPRING_6}/hills.webp`,
  `${TOUR_SPRING_6}/deer.webp`,
  `${TOUR_SPRING_6}/mnd.clip1.poster.webp`,
  `${TOUR_SPRING_6}/mnd.clip2.poster.webp`,
  `${TOUR_SPRING_6}/drag.webp`,
  `${TOUR_SPRING_6}/mnd.clip3.poster.webp`,
  `${TOUR_SPRING_6}/mnd.clip4.poster.webp`,
  `${TOUR_SPRING_6}/hills5.webp`,
  `${TOUR_SPRING_6}/deer2.webp`,
  `${TOUR_SPRING_6}/mnd.clip5.poster.webp`,
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
export const TOUR_SPRING_6_GRID_VIDEO_POSTERS_MOBILE: Record<string, string> = {
  [`${TOUR_SPRING_6}/mnd.clip1.grid.webm`]: `${TOUR_SPRING_6}/mnd.clip1.poster.mobile.webp`,
  [`${TOUR_SPRING_6}/mnd.clip2.grid.webm`]: `${TOUR_SPRING_6}/mnd.clip2.poster.mobile.webp`,
  [`${TOUR_SPRING_6}/mnd.clip3.grid.webm`]: `${TOUR_SPRING_6}/mnd.clip3.poster.mobile.webp`,
  [`${TOUR_SPRING_6}/mnd.clip4.grid.webm`]: `${TOUR_SPRING_6}/mnd.clip4.poster.mobile.webp`,
  [`${TOUR_SPRING_6}/mnd.clip5.grid.webm`]: `${TOUR_SPRING_6}/mnd.clip5.poster.webp`,
};

export const TOUR_SPRING_6_COVER_GRID = `${TOUR_SPRING_6}/hero.webp` as const;

const TOUR_SPRING_7 = `${TOURS_ASSET_BASE}/spring-7`;
const TOUR_SPRING_8 = `${TOURS_ASSET_BASE}/spring-8`;
const TOUR_SPRING_9 = `${TOURS_ASSET_BASE}/spring-9`;
const TOUR_SPRING_10 = `${TOURS_ASSET_BASE}/spring-10`;
export const TOUR_SPRING_11_ASSET_BASE = `${TOURS_ASSET_BASE}/spring-11` as const;
export const TOUR_SPRING_12_ASSET_BASE = `${TOURS_ASSET_BASE}/spring-12` as const;
export const TOUR_SPRING_13_ASSET_BASE = `${TOURS_ASSET_BASE}/spring-13` as const;

/**
 * «Ущелье Дарданеллы» (spring-7). Исходники: `content/Дарданелла (все сезоны кроме зимы)/`.
 * Клипы: `scripts/encode-spring-7-dardanelle-movs.ps1` → `ddn.clip1..2`.
 * Макет `dardanelles` в `TourDetailGallery`: `camp` внизу (плитка 2×2 по сетке), клипы — 1x2.
 * Hero — `view`, фон «О туре» — `view3` (см. `prefaceBackgroundImageUrl` в данных тура).
 */
export const TOUR_SPRING_7_GALLERY_VIEWER = [
  `${TOUR_SPRING_7}/view.webp`,
  `${TOUR_SPRING_7}/view3.webp`,
  `${TOUR_SPRING_7}/ddn.clip1.poster.webp`,
  `${TOUR_SPRING_7}/view2.webp`,
  `${TOUR_SPRING_7}/ddn.clip2.poster.webp`,
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

export const TOUR_SPRING_7_COVER_GRID = `${TOUR_SPRING_7}/hero.webp` as const;
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
  `${TOUR_SPRING_8}/flz.clip1.poster.webp`,
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

/** Карточка/hero spring-8: отдельный hero-баннер. */
export const TOUR_SPRING_8_COVER_GRID = `${TOUR_SPRING_8}/hero.webp` as const;
export const TOUR_SPRING_8_PREFACE_BACKGROUND = `${TOUR_SPRING_8}/view.webp` as const;

/**
 * «Восхождение на г. Воробей + Дегустация» (spring-9).
 * Макет: hero вершины + отдельный preface кадр винодельни, далее 9 кадров сетки с 3 вертикальными клипами.
 */
export const TOUR_SPRING_9_GALLERY_VIEWER = [
  `${TOUR_SPRING_9}/top3.webp`,
  `${TOUR_SPRING_9}/wine.webp`,
  `${TOUR_SPRING_9}/top.webp`,
  `${TOUR_SPRING_9}/view2.webp`,
  `${TOUR_SPRING_9}/vrb.clip1.poster.webp`,
  `${TOUR_SPRING_9}/rocks.webp`,
  `${TOUR_SPRING_9}/vrb.clip2.poster.webp`,
  `${TOUR_SPRING_9}/forest.webp`,
  `${TOUR_SPRING_9}/vrb.clip3.poster.webp`,
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
export const TOUR_SPRING_9_GRID_VIDEO_POSTERS_MOBILE: Record<string, string> = {
  [`${TOUR_SPRING_9}/vrb.clip1.grid.webm`]: `${TOUR_SPRING_9}/vrb.clip1.poster.mobile.webp`,
  [`${TOUR_SPRING_9}/vrb.clip2.grid.webm`]: `${TOUR_SPRING_9}/vrb.clip2.poster.mobile.webp`,
  [`${TOUR_SPRING_9}/vrb.clip3.grid.webm`]: `${TOUR_SPRING_9}/vrb.clip3.poster.mobile.webp`,
};

export const TOUR_SPRING_9_COVER_GRID = `${TOUR_SPRING_9}/hero.webp` as const;
export const TOUR_SPRING_9_PREFACE_BACKGROUND = `${TOUR_SPRING_9}/wine.webp` as const;

/**
 * «Остров Аскольд» (spring-10). Фото: все шесть из `content/Аскольд/webp/`; MP4 (6 с): `encode-spring-10-askold-trimmed-mp4.ps1` → `ask.intro`; MOV: `encode-spring-10-askold-movs.ps1` → `ask.clip1..6` (в галерее не показываем `ask.clip1`, `ask.clip3`).
 * Hero — `view`, фон «О туре» — `beach`. В данных по порядку: intro, clip2, clip4–6, beacon, rock, view2, view3; раскладка `askold` — в `TourDetailGallery`.
 */
export const TOUR_SPRING_10_GALLERY_VIEWER = [
  `${TOUR_SPRING_10}/view.webp`,
  `${TOUR_SPRING_10}/beach.webp`,
  `${TOUR_SPRING_10}/ask.intro.poster.webp`,
  `${TOUR_SPRING_10}/ask.clip2.poster.webp`,
  `${TOUR_SPRING_10}/ask.clip4.poster.webp`,
  `${TOUR_SPRING_10}/ask.clip5.poster.webp`,
  `${TOUR_SPRING_10}/ask.clip6.poster.webp`,
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
export const TOUR_SPRING_10_GRID_VIDEO_POSTERS_MOBILE: Record<string, string> = {
  [`${TOUR_SPRING_10}/ask.intro.grid.webm`]: `${TOUR_SPRING_10}/ask.intro.poster.webp`,
  [`${TOUR_SPRING_10}/ask.clip2.grid.webm`]: `${TOUR_SPRING_10}/ask.clip2.poster.mobile.webp`,
  [`${TOUR_SPRING_10}/ask.clip4.grid.webm`]: `${TOUR_SPRING_10}/ask.clip4.poster.mobile.webp`,
  [`${TOUR_SPRING_10}/ask.clip5.grid.webm`]: `${TOUR_SPRING_10}/ask.clip5.poster.mobile.webp`,
  [`${TOUR_SPRING_10}/ask.clip6.grid.webm`]: `${TOUR_SPRING_10}/ask.clip6.poster.mobile.webp`,
};

export const TOUR_SPRING_10_COVER_GRID = `${TOUR_SPRING_10}/hero.webp` as const;
export const TOUR_SPRING_10_PREFACE_BACKGROUND = `${TOUR_SPRING_10}/beach.webp` as const;
export const TOUR_SPRING_10_PREFACE_BACKGROUND_MOBILE = `${TOUR_SPRING_10}/beach.mobile.webp` as const;

/** Сетка `askold`: вертикальные панорамы — якорь обрезки в `TourDetailGallery`. */
export const TOUR_SPRING_10_VIEW2_GRID = `${TOUR_SPRING_10}/view2.webp` as const;
export const TOUR_SPRING_10_VIEW3_GRID = `${TOUR_SPRING_10}/view3.webp` as const;

/**
 * «Остров Шкота» (spring-11).
 * Фото: `content/Шкота/webp/`, hero: `content/HERO/Весна/shkota.webp`.
 * Видео: `scripts/encode-spring-11-shkota-movs.ps1` -> `shk.clip1..3`.
 */
export const TOUR_SPRING_11_COVER_GRID =
  `${TOUR_SPRING_11_ASSET_BASE}/hero.webp` as const;
export const TOUR_SPRING_11_PREFACE_BACKGROUND =
  `${TOUR_SPRING_11_ASSET_BASE}/view.webp` as const;

export const TOUR_SPRING_11_CLIP1_GRID_WEBM =
  `${TOUR_SPRING_11_ASSET_BASE}/shk.clip1.grid.webm` as const;
export const TOUR_SPRING_11_CLIP2_GRID_WEBM =
  `${TOUR_SPRING_11_ASSET_BASE}/shk.clip2.grid.webm` as const;
export const TOUR_SPRING_11_CLIP3_GRID_WEBM =
  `${TOUR_SPRING_11_ASSET_BASE}/shk.clip3.grid.webm` as const;

export const TOUR_SPRING_11_GALLERY_VIEWER = [
  TOUR_SPRING_11_COVER_GRID,
  TOUR_SPRING_11_PREFACE_BACKGROUND,
  `${TOUR_SPRING_11_ASSET_BASE}/shk.clip1.poster.webp`,
  `${TOUR_SPRING_11_ASSET_BASE}/view2.webp`,
  `${TOUR_SPRING_11_ASSET_BASE}/view3.webp`,
  `${TOUR_SPRING_11_ASSET_BASE}/shk.clip2.poster.webp`,
  `${TOUR_SPRING_11_ASSET_BASE}/climb.webp`,
  `${TOUR_SPRING_11_ASSET_BASE}/view4.webp`,
  `${TOUR_SPRING_11_ASSET_BASE}/shk.clip3.poster.webp`,
  `${TOUR_SPRING_11_ASSET_BASE}/view5.webp`,
  `${TOUR_SPRING_11_ASSET_BASE}/view6.webp`,
  `${TOUR_SPRING_11_ASSET_BASE}/wow.webp`,
  `${TOUR_SPRING_11_ASSET_BASE}/scallops.webp`,
  `${TOUR_SPRING_11_ASSET_BASE}/earchin.webp`,
] as const;

export const TOUR_SPRING_11_GALLERY_GRID = [
  TOUR_SPRING_11_COVER_GRID,
  TOUR_SPRING_11_PREFACE_BACKGROUND,
  TOUR_SPRING_11_CLIP1_GRID_WEBM,
  `${TOUR_SPRING_11_ASSET_BASE}/view2.webp`,
  `${TOUR_SPRING_11_ASSET_BASE}/view3.webp`,
  TOUR_SPRING_11_CLIP2_GRID_WEBM,
  `${TOUR_SPRING_11_ASSET_BASE}/climb.webp`,
  `${TOUR_SPRING_11_ASSET_BASE}/view4.webp`,
  TOUR_SPRING_11_CLIP3_GRID_WEBM,
  `${TOUR_SPRING_11_ASSET_BASE}/view5.webp`,
  `${TOUR_SPRING_11_ASSET_BASE}/view6.webp`,
  `${TOUR_SPRING_11_ASSET_BASE}/wow.webp`,
  `${TOUR_SPRING_11_ASSET_BASE}/scallops.webp`,
  `${TOUR_SPRING_11_ASSET_BASE}/earchin.webp`,
] as const;

export const TOUR_SPRING_11_GRID_VIDEO_POSTERS: Record<string, string> = {
  [TOUR_SPRING_11_CLIP1_GRID_WEBM]: `${TOUR_SPRING_11_ASSET_BASE}/shk.clip1.poster.webp`,
  [TOUR_SPRING_11_CLIP2_GRID_WEBM]: `${TOUR_SPRING_11_ASSET_BASE}/shk.clip2.poster.webp`,
  [TOUR_SPRING_11_CLIP3_GRID_WEBM]: `${TOUR_SPRING_11_ASSET_BASE}/shk.clip3.poster.webp`,
};

/**
 * «Мыс Тобизина» (spring-12).
 * Cover: `content/HERO/Весна/tobizina.webp` -> `public/tours/spring-12/cover.webp`.
 * Остальные кадры пока placeholder до добавления материалов тура.
 */
export const TOUR_SPRING_12_COVER_GRID =
  `${TOUR_SPRING_12_ASSET_BASE}/cover.webp` as const;
export const TOUR_SPRING_12_PREFACE_BACKGROUND =
  `${BASE}/1200x800/1A3C2E/ffffff?text=Тобизина+·+край+моря` as const;

export const TOUR_SPRING_12_GALLERY_VIEWER = [
  TOUR_SPRING_12_COVER_GRID,
  TOUR_SPRING_12_PREFACE_BACKGROUND,
  `${BASE}/900x900/7BA7BC/ffffff?text=Тропа+к+мысу`,
  `${BASE}/900x900/1A3C2E/ffffff?text=Каменное+плато`,
  `${BASE}/900x900/C8A96E/1A3C2E?text=Скалы`,
  `${BASE}/1200x800/7BA7BC/ffffff?text=Бухта+Карпинского`,
  `${BASE}/900x900/E8A838/1A3C2E?text=Обед+на+берегу`,
] as const;

export const TOUR_SPRING_12_GALLERY_GRID = TOUR_SPRING_12_GALLERY_VIEWER;

/** «Полуостров Гамова» (spring-13). Исходники: `content/Весна/Гамова 1 д/`. Полный прогон фото+видео — `encode-spring-13-gamova-media.ps1`; только `gam.clip5`/`gam.clip6` — `encode-spring-13-gamova-two-clips.ps1`. */
export const TOUR_SPRING_13_COVER_GRID =
  `${TOUR_SPRING_13_ASSET_BASE}/cover.webp` as const;
export const TOUR_SPRING_13_PREFACE_BACKGROUND =
  `${TOUR_SPRING_13_ASSET_BASE}/preface.webp` as const;
export const TOUR_SPRING_13_VIEW7_IMAGE =
  `${TOUR_SPRING_13_ASSET_BASE}/view7.webp` as const;
export const TOUR_SPRING_13_ROCKS_IMAGE =
  `${TOUR_SPRING_13_ASSET_BASE}/rocks.webp` as const;
export const TOUR_SPRING_13_SUMMIT_VIEW_IMAGE =
  `${TOUR_SPRING_13_ASSET_BASE}/summit-view.webp` as const;
export const TOUR_SPRING_13_ASTAFIEV_BAY_IMAGE =
  `${TOUR_SPRING_13_ASSET_BASE}/astafiev-bay.webp` as const;
export const TOUR_SPRING_13_SOSNA2_IMAGE =
  `${TOUR_SPRING_13_ASSET_BASE}/sosna2.webp` as const;
/** Две сосны — исходник `dve_sosna.webp`. */
export const TOUR_SPRING_13_DVE_SOSNA_IMAGE =
  `${TOUR_SPRING_13_ASSET_BASE}/dve-sosna.webp` as const;

export const TOUR_SPRING_13_CLIP1_GRID_WEBM =
  `${TOUR_SPRING_13_ASSET_BASE}/gam.clip1.grid.webm` as const;
export const TOUR_SPRING_13_CLIP3_GRID_WEBM =
  `${TOUR_SPRING_13_ASSET_BASE}/gam.clip3.grid.webm` as const;
/** Исходник: `2022-07-20 13-29-54.MOV`. */
export const TOUR_SPRING_13_CLIP5_GRID_WEBM =
  `${TOUR_SPRING_13_ASSET_BASE}/gam.clip5.grid.webm` as const;
/** Исходник: `GX012405.MP4`. */
export const TOUR_SPRING_13_CLIP6_GRID_WEBM =
  `${TOUR_SPRING_13_ASSET_BASE}/gam.clip6.grid.webm` as const;

export const TOUR_SPRING_13_GALLERY_VIEWER = [
  TOUR_SPRING_13_COVER_GRID,
  TOUR_SPRING_13_PREFACE_BACKGROUND,
  `${TOUR_SPRING_13_ASSET_BASE}/gam.clip6.poster.webp`,
  `${TOUR_SPRING_13_ASSET_BASE}/gam.clip1.poster.webp`,
  `${TOUR_SPRING_13_ASSET_BASE}/gam.clip3.poster.webp`,
  TOUR_SPRING_13_VIEW7_IMAGE,
  TOUR_SPRING_13_ROCKS_IMAGE,
  `${TOUR_SPRING_13_ASSET_BASE}/gam.clip5.poster.webp`,
  TOUR_SPRING_13_SOSNA2_IMAGE,
  TOUR_SPRING_13_DVE_SOSNA_IMAGE,
  TOUR_SPRING_13_SUMMIT_VIEW_IMAGE,
  TOUR_SPRING_13_ASTAFIEV_BAY_IMAGE,
] as const;

export const TOUR_SPRING_13_GALLERY_GRID = [
  TOUR_SPRING_13_COVER_GRID,
  TOUR_SPRING_13_PREFACE_BACKGROUND,
  TOUR_SPRING_13_CLIP6_GRID_WEBM,
  TOUR_SPRING_13_CLIP1_GRID_WEBM,
  TOUR_SPRING_13_CLIP3_GRID_WEBM,
  TOUR_SPRING_13_VIEW7_IMAGE,
  TOUR_SPRING_13_ROCKS_IMAGE,
  TOUR_SPRING_13_CLIP5_GRID_WEBM,
  TOUR_SPRING_13_SOSNA2_IMAGE,
  TOUR_SPRING_13_DVE_SOSNA_IMAGE,
  TOUR_SPRING_13_SUMMIT_VIEW_IMAGE,
  TOUR_SPRING_13_ASTAFIEV_BAY_IMAGE,
] as const;

export const TOUR_SPRING_13_GRID_VIDEO_POSTERS: Record<string, string> = {
  [TOUR_SPRING_13_CLIP1_GRID_WEBM]: `${TOUR_SPRING_13_ASSET_BASE}/gam.clip1.poster.webp`,
  [TOUR_SPRING_13_CLIP3_GRID_WEBM]: `${TOUR_SPRING_13_ASSET_BASE}/gam.clip3.poster.webp`,
  [TOUR_SPRING_13_CLIP5_GRID_WEBM]: `${TOUR_SPRING_13_ASSET_BASE}/gam.clip5.poster.webp`,
  [TOUR_SPRING_13_CLIP6_GRID_WEBM]: `${TOUR_SPRING_13_ASSET_BASE}/gam.clip6.poster.webp`,
};

/** «Заповедная Та-Чингоуза» (summer-1). Медиа: `scripts/encode-summer-1-tachingouza-media.ps1`. */
export const TOUR_SUMMER_1_ASSET_BASE = `${TOURS_ASSET_BASE}/summer-1` as const;

/** Hero карточки и страницы тура — бухта с бирюзовой водой (`first.webp`). */
export const TOUR_SUMMER_1_FIRST_IMAGE = `${TOUR_SUMMER_1_ASSET_BASE}/first.webp` as const;
export const TOUR_SUMMER_1_COVER_GRID = TOUR_SUMMER_1_FIRST_IMAGE;

export const TOUR_SUMMER_1_PREFACE_BACKGROUND =
  `${TOUR_SUMMER_1_ASSET_BASE}/preface.webp` as const;

export const TOUR_SUMMER_1_VODA_IMAGE = `${TOUR_SUMMER_1_ASSET_BASE}/voda.webp` as const;
export const TOUR_SUMMER_1_PESOCHEK_IMAGE = `${TOUR_SUMMER_1_ASSET_BASE}/pesochek.webp` as const;
export const TOUR_SUMMER_1_SKALA_IMAGE = `${TOUR_SUMMER_1_ASSET_BASE}/skala.webp` as const;
export const TOUR_SUMMER_1_DLINNI_IMAGE = `${TOUR_SUMMER_1_ASSET_BASE}/dlinni.webp` as const;
export const TOUR_SUMMER_1_MOST_IMAGE = `${TOUR_SUMMER_1_ASSET_BASE}/most.webp` as const;
export const TOUR_SUMMER_1_SAPONI_IMAGE = `${TOUR_SUMMER_1_ASSET_BASE}/saponi.webp` as const;
export const TOUR_SUMMER_1_STOIT_IMAGE = `${TOUR_SUMMER_1_ASSET_BASE}/stoit.webp` as const;
export const TOUR_SUMMER_1_STONE_IMAGE = `${TOUR_SUMMER_1_ASSET_BASE}/stone.webp` as const;

export const TOUR_SUMMER_1_CLIP1_GRID_WEBM =
  `${TOUR_SUMMER_1_ASSET_BASE}/tch.clip1.grid.webm` as const;
export const TOUR_SUMMER_1_CLIP2_GRID_WEBM =
  `${TOUR_SUMMER_1_ASSET_BASE}/tch.clip2.grid.webm` as const;
export const TOUR_SUMMER_1_CLIP3_GRID_WEBM =
  `${TOUR_SUMMER_1_ASSET_BASE}/tch.clip3.grid.webm` as const;
export const TOUR_SUMMER_1_CLIP4_GRID_WEBM =
  `${TOUR_SUMMER_1_ASSET_BASE}/tch.clip4.grid.webm` as const;
export const TOUR_SUMMER_1_CLIP5_GRID_WEBM =
  `${TOUR_SUMMER_1_ASSET_BASE}/tch.clip5.grid.webm` as const;
export const TOUR_SUMMER_1_CLIP6_GRID_WEBM =
  `${TOUR_SUMMER_1_ASSET_BASE}/tch.clip6.grid.webm` as const;
export const TOUR_SUMMER_1_CLIP7_GRID_WEBM =
  `${TOUR_SUMMER_1_ASSET_BASE}/tch.clip7.grid.webm` as const;

/**
 * Порядок: обложка → префейс → кадры для bento `tachingouza` в `TourDetailGallery`.
 * После `slice(2)` (15 слотов): clip1–clip7, voda, pesochek, dlinni, most, saponi, stoit, stone.
 * Без `hero.webp`, `shiroki2.webp`, `cave.webp`. Bento: clip3 2×2 → clip4|pesochek+clip7 → …
 */
export const TOUR_SUMMER_1_GALLERY_VIEWER = [
  TOUR_SUMMER_1_COVER_GRID,
  TOUR_SUMMER_1_PREFACE_BACKGROUND,
  `${TOUR_SUMMER_1_ASSET_BASE}/tch.clip1.poster.webp`,
  `${TOUR_SUMMER_1_ASSET_BASE}/tch.clip2.poster.webp`,
  TOUR_SUMMER_1_VODA_IMAGE,
  `${TOUR_SUMMER_1_ASSET_BASE}/tch.clip3.poster.webp`,
  TOUR_SUMMER_1_PESOCHEK_IMAGE,
  `${TOUR_SUMMER_1_ASSET_BASE}/tch.clip4.poster.webp`,
  `${TOUR_SUMMER_1_ASSET_BASE}/tch.clip5.poster.webp`,
  `${TOUR_SUMMER_1_ASSET_BASE}/tch.clip6.poster.webp`,
  TOUR_SUMMER_1_SKALA_IMAGE,
  `${TOUR_SUMMER_1_ASSET_BASE}/tch.clip7.poster.webp`,
  TOUR_SUMMER_1_DLINNI_IMAGE,
  TOUR_SUMMER_1_MOST_IMAGE,
  TOUR_SUMMER_1_SAPONI_IMAGE,
  TOUR_SUMMER_1_STOIT_IMAGE,
  TOUR_SUMMER_1_STONE_IMAGE,
] as const;

export const TOUR_SUMMER_1_GALLERY_GRID = [
  TOUR_SUMMER_1_COVER_GRID,
  TOUR_SUMMER_1_PREFACE_BACKGROUND,
  TOUR_SUMMER_1_CLIP1_GRID_WEBM,
  TOUR_SUMMER_1_CLIP2_GRID_WEBM,
  TOUR_SUMMER_1_VODA_IMAGE,
  TOUR_SUMMER_1_CLIP3_GRID_WEBM,
  TOUR_SUMMER_1_PESOCHEK_IMAGE,
  TOUR_SUMMER_1_CLIP4_GRID_WEBM,
  TOUR_SUMMER_1_CLIP5_GRID_WEBM,
  TOUR_SUMMER_1_CLIP6_GRID_WEBM,
  TOUR_SUMMER_1_SKALA_IMAGE,
  TOUR_SUMMER_1_CLIP7_GRID_WEBM,
  TOUR_SUMMER_1_DLINNI_IMAGE,
  TOUR_SUMMER_1_MOST_IMAGE,
  TOUR_SUMMER_1_SAPONI_IMAGE,
  TOUR_SUMMER_1_STOIT_IMAGE,
  TOUR_SUMMER_1_STONE_IMAGE,
] as const;

export const TOUR_SUMMER_1_GRID_VIDEO_POSTERS: Record<string, string> = {
  [TOUR_SUMMER_1_CLIP1_GRID_WEBM]: `${TOUR_SUMMER_1_ASSET_BASE}/tch.clip1.poster.webp`,
  [TOUR_SUMMER_1_CLIP2_GRID_WEBM]: `${TOUR_SUMMER_1_ASSET_BASE}/tch.clip2.poster.webp`,
  [TOUR_SUMMER_1_CLIP3_GRID_WEBM]: `${TOUR_SUMMER_1_ASSET_BASE}/tch.clip3.poster.webp`,
  [TOUR_SUMMER_1_CLIP4_GRID_WEBM]: `${TOUR_SUMMER_1_ASSET_BASE}/tch.clip4.poster.webp`,
  [TOUR_SUMMER_1_CLIP5_GRID_WEBM]: `${TOUR_SUMMER_1_ASSET_BASE}/tch.clip5.poster.webp`,
  [TOUR_SUMMER_1_CLIP6_GRID_WEBM]: `${TOUR_SUMMER_1_ASSET_BASE}/tch.clip6.poster.webp`,
  [TOUR_SUMMER_1_CLIP7_GRID_WEBM]: `${TOUR_SUMMER_1_ASSET_BASE}/tch.clip7.poster.webp`,
};

/** «Северное Приморье» (summer-7). Медиа: `scripts/encode-summer-7-sever-media.ps1`. */
export const TOUR_SUMMER_7_ASSET_BASE = `${TOURS_ASSET_BASE}/summer-7` as const;

export const TOUR_SUMMER_7_COVER = `${TOUR_SUMMER_7_ASSET_BASE}/bazi.webp` as const;
export const TOUR_SUMMER_7_COVER_GRID = TOUR_SUMMER_7_COVER;
export const TOUR_SUMMER_7_PREFACE_BACKGROUND =
  `${TOUR_SUMMER_7_ASSET_BASE}/preface.webp` as const;

export const TOUR_SUMMER_7_DUB_IMAGE = `${TOUR_SUMMER_7_ASSET_BASE}/dub.webp` as const;
export const TOUR_SUMMER_7_BAZI_IMAGE = TOUR_SUMMER_7_COVER;
export const TOUR_SUMMER_7_SKAL_POINT3_IMAGE =
  `${TOUR_SUMMER_7_ASSET_BASE}/skal-point3.webp` as const;
export const TOUR_SUMMER_7_SKAL_34_IMAGE = `${TOUR_SUMMER_7_ASSET_BASE}/skal-34.webp` as const;
export const TOUR_SUMMER_7_SKAL_44_IMAGE = `${TOUR_SUMMER_7_ASSET_BASE}/skal-44.webp` as const;
export const TOUR_SUMMER_7_SKAL_45_IMAGE = `${TOUR_SUMMER_7_ASSET_BASE}/skal-45.webp` as const;
export const TOUR_SUMMER_7_SKAL_46_IMAGE = `${TOUR_SUMMER_7_ASSET_BASE}/skal-46.webp` as const;
export const TOUR_SUMMER_7_FIN_IMAGE = `${TOUR_SUMMER_7_ASSET_BASE}/fin.webp` as const;

export const TOUR_SUMMER_7_CLIP1_GRID_WEBM =
  `${TOUR_SUMMER_7_ASSET_BASE}/sev.clip1.grid.webm` as const;
export const TOUR_SUMMER_7_CLIP2_GRID_WEBM =
  `${TOUR_SUMMER_7_ASSET_BASE}/sev.clip2.grid.webm` as const;
export const TOUR_SUMMER_7_CLIP3_GRID_WEBM =
  `${TOUR_SUMMER_7_ASSET_BASE}/sev.clip3.grid.webm` as const;
export const TOUR_SUMMER_7_CLIP4_GRID_WEBM =
  `${TOUR_SUMMER_7_ASSET_BASE}/sev.clip4.grid.webm` as const;

/**
 * Порядок: cover → preface → bento `severCoast` после `slice(2)` (11 слотов):
 * clip1, dub, clip2, skal-point3, skal-34..46, clip3, clip4, fin.
 */
export const TOUR_SUMMER_7_GALLERY_VIEWER = [
  TOUR_SUMMER_7_COVER_GRID,
  TOUR_SUMMER_7_PREFACE_BACKGROUND,
  `${TOUR_SUMMER_7_ASSET_BASE}/sev.clip1.poster.webp`,
  TOUR_SUMMER_7_DUB_IMAGE,
  `${TOUR_SUMMER_7_ASSET_BASE}/sev.clip2.poster.webp`,
  TOUR_SUMMER_7_SKAL_POINT3_IMAGE,
  TOUR_SUMMER_7_SKAL_34_IMAGE,
  TOUR_SUMMER_7_SKAL_44_IMAGE,
  TOUR_SUMMER_7_SKAL_45_IMAGE,
  TOUR_SUMMER_7_SKAL_46_IMAGE,
  `${TOUR_SUMMER_7_ASSET_BASE}/sev.clip3.poster.webp`,
  `${TOUR_SUMMER_7_ASSET_BASE}/sev.clip4.poster.webp`,
  TOUR_SUMMER_7_FIN_IMAGE,
] as const;

export const TOUR_SUMMER_7_GALLERY_GRID = [
  TOUR_SUMMER_7_COVER_GRID,
  TOUR_SUMMER_7_PREFACE_BACKGROUND,
  TOUR_SUMMER_7_CLIP1_GRID_WEBM,
  TOUR_SUMMER_7_DUB_IMAGE,
  TOUR_SUMMER_7_CLIP2_GRID_WEBM,
  TOUR_SUMMER_7_SKAL_POINT3_IMAGE,
  TOUR_SUMMER_7_SKAL_34_IMAGE,
  TOUR_SUMMER_7_SKAL_44_IMAGE,
  TOUR_SUMMER_7_SKAL_45_IMAGE,
  TOUR_SUMMER_7_SKAL_46_IMAGE,
  TOUR_SUMMER_7_CLIP3_GRID_WEBM,
  TOUR_SUMMER_7_CLIP4_GRID_WEBM,
  TOUR_SUMMER_7_FIN_IMAGE,
] as const;

export const TOUR_SUMMER_7_GRID_VIDEO_POSTERS: Record<string, string> = {
  [TOUR_SUMMER_7_CLIP1_GRID_WEBM]: `${TOUR_SUMMER_7_ASSET_BASE}/sev.clip1.poster.webp`,
  [TOUR_SUMMER_7_CLIP2_GRID_WEBM]: `${TOUR_SUMMER_7_ASSET_BASE}/sev.clip2.poster.webp`,
  [TOUR_SUMMER_7_CLIP3_GRID_WEBM]: `${TOUR_SUMMER_7_ASSET_BASE}/sev.clip3.poster.webp`,
  [TOUR_SUMMER_7_CLIP4_GRID_WEBM]: `${TOUR_SUMMER_7_ASSET_BASE}/sev.clip4.poster.webp`,
};

/** «Полуостров Краббе» (summer-8). Медиа: `public/tours/summer-8/` (временные кадры до съёмки тура). */
export const TOUR_SUMMER_8_ASSET_BASE = `${TOURS_ASSET_BASE}/summer-8` as const;

export const TOUR_SUMMER_8_COVER = `${TOUR_SUMMER_8_ASSET_BASE}/cover.webp` as const;
export const TOUR_SUMMER_8_COVER_GRID = TOUR_SUMMER_8_COVER;
export const TOUR_SUMMER_8_PREFACE_BACKGROUND =
  `${TOUR_SUMMER_8_ASSET_BASE}/preface.webp` as const;

export const TOUR_SUMMER_8_VIEW_IMAGE = `${TOUR_SUMMER_8_ASSET_BASE}/view.webp` as const;
export const TOUR_SUMMER_8_COAST_IMAGE = `${TOUR_SUMMER_8_ASSET_BASE}/coast.webp` as const;
export const TOUR_SUMMER_8_ROCKS_IMAGE = `${TOUR_SUMMER_8_ASSET_BASE}/rocks.webp` as const;
export const TOUR_SUMMER_8_RIDGE_IMAGE = `${TOUR_SUMMER_8_ASSET_BASE}/ridge.webp` as const;
export const TOUR_SUMMER_8_FOREST_IMAGE = `${TOUR_SUMMER_8_ASSET_BASE}/forest.webp` as const;
export const TOUR_SUMMER_8_PICNIC_IMAGE = `${TOUR_SUMMER_8_ASSET_BASE}/picnic.webp` as const;
export const TOUR_SUMMER_8_TRAIL_IMAGE = `${TOUR_SUMMER_8_ASSET_BASE}/trail.webp` as const;

export const TOUR_SUMMER_8_GALLERY_VIEWER = [
  TOUR_SUMMER_8_COVER_GRID,
  TOUR_SUMMER_8_PREFACE_BACKGROUND,
  TOUR_SUMMER_8_VIEW_IMAGE,
  TOUR_SUMMER_8_COAST_IMAGE,
  TOUR_SUMMER_8_ROCKS_IMAGE,
  TOUR_SUMMER_8_RIDGE_IMAGE,
  TOUR_SUMMER_8_FOREST_IMAGE,
  TOUR_SUMMER_8_PICNIC_IMAGE,
  TOUR_SUMMER_8_TRAIL_IMAGE,
] as const;

export const TOUR_SUMMER_8_GALLERY_GRID = TOUR_SUMMER_8_GALLERY_VIEWER;

/**
 * Секунда входа 5-секундного сегмента в исходном `*.grid.webm` для баннера зимы (колонки 0…9).
 * Синхронно с `cuts[].startSec` в `scripts/generate-home-season-banner-loop-videos.cjs`.
 */
export const HOME_SEASON_BANNER_WINTER_CLIP_SOURCE_START_SEC = [
  3, 0, 16, 1, 5, 2, 7, 0, 0, 0,
] as const;

/**
 * Зимний баннер: те же сжатые `*.grid.webm`, что в турах (`public/tours/…`), без дублей в `banners_winter/`.
 * Зацикливание сегмента — `BannerColumnVideo` (`startSec` + `HOME_SEASON_BANNER_COLUMN_VIDEO_PLAY_SEC`).
 * Раньше: отдельные `*.banner-loop.poster.webp` из `npm run generate:banner-loops`.
 */

export const HOME_SEASON_BANNER_WINTER_LOOP_VIDEOS = [
  TOUR_WINTER_3_GALLERY_GRID[3],
  TOUR_WINTER_3_GALLERY_GRID[9],
  TOUR_WINTER_3_GALLERY_GRID[11],
  TOUR_WINTER_3_GALLERY_GRID[12],
  TOUR_WINTER_4_GALLERY_GRID[2],
  TOUR_WINTER_5_GALLERY_GRID[4],
  TOUR_WINTER_5_GALLERY_GRID[5],
  TOUR_WINTER_3_BOARD_GRID_WEBM,
  TOUR_WINTER_3_ELYA_GRID_WEBM,
  TOUR_WINTER_3_BBQ_GRID_WEBM,
] as const;

/**
 * Постеры для `<video poster>` зимних клипов баннера — те же webp, что в турах.
 */
export const HOME_SEASON_BANNER_WINTER_LOOP_VIDEO_POSTERS: Record<string, string> = {
  [TOUR_WINTER_3_GALLERY_GRID[3]]: TOUR_WINTER_3_GRID_VIDEO_POSTERS[TOUR_WINTER_3_GALLERY_GRID[3]],
  [TOUR_WINTER_3_GALLERY_GRID[9]]: TOUR_WINTER_3_GRID_VIDEO_POSTERS[TOUR_WINTER_3_GALLERY_GRID[9]],
  [TOUR_WINTER_3_GALLERY_GRID[11]]: TOUR_WINTER_3_GRID_VIDEO_POSTERS[TOUR_WINTER_3_GALLERY_GRID[11]],
  [TOUR_WINTER_3_GALLERY_GRID[12]]: TOUR_WINTER_3_GRID_VIDEO_POSTERS[TOUR_WINTER_3_GALLERY_GRID[12]],
  [TOUR_WINTER_4_GALLERY_GRID[2]]: TOUR_WINTER_4_GRID_VIDEO_POSTERS_MOBILE[TOUR_WINTER_4_GALLERY_GRID[2]],
  [TOUR_WINTER_5_GALLERY_GRID[4]]: TOUR_WINTER_5_GRID_VIDEO_POSTERS[TOUR_WINTER_5_GALLERY_GRID[4]],
  [TOUR_WINTER_5_GALLERY_GRID[5]]: TOUR_WINTER_5_GRID_VIDEO_POSTERS[TOUR_WINTER_5_GALLERY_GRID[5]],
  [TOUR_WINTER_3_BOARD_GRID_WEBM]: TOUR_WINTER_3_GALLERY_GRID[4],
  [TOUR_WINTER_3_ELYA_GRID_WEBM]: TOUR_WINTER_3_GALLERY_GRID[7],
  [TOUR_WINTER_3_BBQ_GRID_WEBM]: TOUR_WINTER_3_GALLERY_GRID[10],
};

/**
 * Весна: баннер ворот — только `*.grid.webm` туров (spring-2/3/4), без отдельной папки `banners_spring/`.
 * Десять разных URL (раньше повторялись `ss.clip1` и `pd.clip4`).
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
  TOUR_SPRING_4_CLIP3_GRID_WEBM,
  TOUR_SPRING_4_CLIP5_GRID_WEBM,
] as const;

/** Постеры — уже пути туров (`TOUR_SPRING_*`), дублей в `banners_spring/` нет. */
export const HOME_SEASON_BANNER_SPRING_LOOP_VIDEO_POSTERS: Record<string, string> = {
  [HOME_SEASON_BANNER_SPRING_LOOP_VIDEOS[0]]: `${TOUR_SPRING_2}/olv.clip1.poster.webp`,
  [HOME_SEASON_BANNER_SPRING_LOOP_VIDEOS[1]]: TOUR_SPRING_4_CLIP1_POSTER_WEBP,
  [HOME_SEASON_BANNER_SPRING_LOOP_VIDEOS[2]]: `${TOUR_SPRING_3}/pd.clip2.poster.webp`,
  [HOME_SEASON_BANNER_SPRING_LOOP_VIDEOS[3]]: `${TOUR_SPRING_3}/pd.clip5.poster.webp`,
  [HOME_SEASON_BANNER_SPRING_LOOP_VIDEOS[4]]: `${TOUR_SPRING_3}/pd.clip4.poster.webp`,
  [HOME_SEASON_BANNER_SPRING_LOOP_VIDEOS[5]]: `${TOUR_SPRING_3}/pd.clip3.poster.webp`,
  [HOME_SEASON_BANNER_SPRING_LOOP_VIDEOS[6]]: `${TOUR_SPRING_3}/pd.clip6.poster.webp`,
  [HOME_SEASON_BANNER_SPRING_LOOP_VIDEOS[7]]: `${TOUR_SPRING_3}/pd.clip7.poster.webp`,
  [HOME_SEASON_BANNER_SPRING_LOOP_VIDEOS[8]]: TOUR_SPRING_4_GRID_VIDEO_POSTERS[TOUR_SPRING_4_CLIP3_GRID_WEBM],
  [HOME_SEASON_BANNER_SPRING_LOOP_VIDEOS[9]]: TOUR_SPRING_4_GRID_VIDEO_POSTERS[TOUR_SPRING_4_CLIP5_GRID_WEBM],
};

/** Логотип мессенджера MAX в модалке заявки — файл в `public/max-messenger-sign-logo.svg`. */
export const MAX_MESSENGER_SIGN_LOGO = `${PUBLIC_ASSET_BASE}max-messenger-sign-logo.svg` as const;

/** Графический знак Вкрайности (лес), не текстовый вордмарк — `public/vkrai-logo.webp`. */
export const VKRAI_FOREST_LOGO = `${PUBLIC_ASSET_BASE}vkrai-logo.webp` as const;

/**
 * Обложки весенних туров: spring-1…13 — реальные файлы в `public/tours/spring-N/`.
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
  'spring-11': TOUR_SPRING_11_COVER_GRID,
  'spring-12': TOUR_SPRING_12_COVER_GRID,
  'spring-13': TOUR_SPRING_13_COVER_GRID,
} as const;

/** Исключения: mobile URL не следует правилу `{name}.mobile.webp` от desktop. */
export const TOUR_COVER_MOBILE_OVERRIDES: Record<string, string> = {
  [TOUR_WINTER_3_PREFACE_BACKGROUND]: TOUR_WINTER_3_PREFACE_BACKGROUND_MOBILE,
  [TOUR_SPRING_10_PREFACE_BACKGROUND]: TOUR_SPRING_10_PREFACE_BACKGROUND_MOBILE,
};

/** @deprecated Use resolveTourCoverMobileUrl + TOUR_COVER_MOBILE_OVERRIDES */
export const TOUR_MOBILE_IMAGE_VARIANTS = TOUR_COVER_MOBILE_OVERRIDES;

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
    winter: `${HOME_SEASON_BANNER_MEDIA_BASE.winter}/winter.webp`,
    spring: `${HOME_SEASON_BANNER_MEDIA_BASE.spring}/spring.webp`,
    summer: `${HOME_SEASON_BANNER_MEDIA_BASE.summer}/Summer.webp`,
    fall:   `${HOME_SEASON_BANNER_MEDIA_BASE.fall}/fall.webp`,
  },
  team: {
    placeholder: `${BASE}/400x500/1A3C2E/C8A96E?text=Эксперт`,
  },
  tours: {
    placeholder: `${BASE}/600x400/1A3C2E/C8A96E?text=Тур`,
    gallery:     `${BASE}/800x600/1A3C2E/C8A96E?text=Фото+тура`,
  },
} as const;
