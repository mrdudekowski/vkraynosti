import { PUBLIC_ASSET_BASE } from './fonts';
import type { Season } from '../types';

const BASE = 'https://placehold.co';

/** Папка `public/spring tours/` — пробел в URL кодируется. */
const SPRING_TOUR_PUBLIC = `${PUBLIC_ASSET_BASE}spring%20tours`;

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

/** «Пидан» — полное качество (просмотрщик). */
export const TOUR_SPRING_3_GALLERY_VIEWER = [
  `${TOUR_SPRING_3}/pd.hero.webp`,
  `${TOUR_SPRING_3}/pd.preface.webp`,
  `${TOUR_SPRING_3}/pd.group.webp`,
  `${TOUR_SPRING_3}/pd.taiga.webp`,
  `${TOUR_SPRING_3}/pd.clip1.webm`,
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
  `${TOUR_SPRING_3}/pd.clip1.grid.webm`,
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
  [TOUR_SPRING_3_GALLERY_GRID[4]]: `${TOUR_SPRING_3}/pd.clip1.poster.webp`,
  [TOUR_SPRING_3_GALLERY_GRID[5]]: `${TOUR_SPRING_3}/pd.clip2.poster.webp`,
  [TOUR_SPRING_3_GALLERY_GRID[7]]: `${TOUR_SPRING_3}/pd.clip5.poster.webp`,
  [TOUR_SPRING_3_GALLERY_GRID[9]]: `${TOUR_SPRING_3}/pd.clip4.poster.webp`,
  [TOUR_SPRING_3_GALLERY_GRID[11]]: `${TOUR_SPRING_3}/pd.clip3.poster.webp`,
  [TOUR_SPRING_3_GALLERY_GRID[12]]: `${TOUR_SPRING_3}/pd.clip6.poster.webp`,
  [TOUR_SPRING_3_GALLERY_GRID[13]]: `${TOUR_SPRING_3}/pd.clip7.poster.webp`,
};

export const TOUR_SPRING_3_COVER_GRID = TOUR_SPRING_3_GALLERY_GRID[0];
export const TOUR_SPRING_3_COVER = TOUR_SPRING_3_COVER_GRID;

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
  `${TOUR_SPRING_3}/pd.clip1.grid.webm`,
  `${TOUR_SPRING_3}/pd.clip2.grid.webm`,
  `${TOUR_SPRING_3}/pd.clip5.grid.webm`,
  `${TOUR_SPRING_3}/pd.clip4.grid.webm`,
  `${TOUR_SPRING_3}/pd.clip3.grid.webm`,
  `${TOUR_SPRING_3}/pd.clip6.grid.webm`,
  `${TOUR_SPRING_3}/pd.clip7.grid.webm`,
  `${TOUR_SPRING_3}/pd.clip1.grid.webm`,
  `${TOUR_SPRING_3}/pd.clip4.grid.webm`,
] as const;

export const HOME_SEASON_BANNER_SPRING_LOOP_VIDEO_POSTERS: Record<string, string> = {
  [HOME_SEASON_BANNER_SPRING_LOOP_VIDEOS[0]]: `${TOUR_SPRING_2}/olv.clip1.poster.webp`,
  [HOME_SEASON_BANNER_SPRING_LOOP_VIDEOS[1]]: `${TOUR_SPRING_3}/pd.clip1.poster.webp`,
  [HOME_SEASON_BANNER_SPRING_LOOP_VIDEOS[2]]: `${TOUR_SPRING_3}/pd.clip2.poster.webp`,
  [HOME_SEASON_BANNER_SPRING_LOOP_VIDEOS[3]]: `${TOUR_SPRING_3}/pd.clip5.poster.webp`,
  [HOME_SEASON_BANNER_SPRING_LOOP_VIDEOS[4]]: `${TOUR_SPRING_3}/pd.clip4.poster.webp`,
  [HOME_SEASON_BANNER_SPRING_LOOP_VIDEOS[5]]: `${TOUR_SPRING_3}/pd.clip3.poster.webp`,
  [HOME_SEASON_BANNER_SPRING_LOOP_VIDEOS[6]]: `${TOUR_SPRING_3}/pd.clip6.poster.webp`,
  [HOME_SEASON_BANNER_SPRING_LOOP_VIDEOS[7]]: `${TOUR_SPRING_3}/pd.clip7.poster.webp`,
  [HOME_SEASON_BANNER_SPRING_LOOP_VIDEOS[8]]: `${TOUR_SPRING_3}/pd.clip1.poster.webp`,
  [HOME_SEASON_BANNER_SPRING_LOOP_VIDEOS[9]]: `${TOUR_SPRING_3}/pd.clip4.poster.webp`,
};

/** Логотип мессенджера MAX в модалке заявки — файл в `public/max-messenger-sign-logo.svg`. */
export const MAX_MESSENGER_SIGN_LOGO = `${PUBLIC_ASSET_BASE}max-messenger-sign-logo.svg` as const;

/** Графический знак Вкрайности (лес), не текстовый вордмарк — `public/vkrai-logo.png`. */
export const VKRAI_FOREST_LOGO = `${PUBLIC_ASSET_BASE}vkrai-logo.png` as const;

/**
 * Обложки весенних туров: spring-1…3 — оптимизированный первый кадр из `public/tours/spring-N/`;
 * spring-4…7 — `public/spring tours/` (пока общие webp).
 */
export const SPRING_TOUR_COVERS = {
  'spring-1': TOUR_SPRING_1_COVER,
  'spring-2': TOUR_SPRING_2_COVER,
  'spring-3': TOUR_SPRING_3_COVER,
  'spring-4': `${SPRING_TOUR_PUBLIC}/spring-4.webp`,
  'spring-5': `${SPRING_TOUR_PUBLIC}/spring-5.webp`,
  'spring-6': `${SPRING_TOUR_PUBLIC}/spring-6.webp`,
  'spring-7': `${SPRING_TOUR_PUBLIC}/spring-7.webp`,
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
