import { PUBLIC_ASSET_BASE } from './fonts';

const BASE = 'https://placehold.co';

/** Папка `public/spring tours/` — пробел в URL кодируется. */
const SPRING_TOUR_PUBLIC = `${PUBLIC_ASSET_BASE}spring%20tours`;

/** Папки туров: `public/tours/{tourId}/` — обложка и галерея одного маршрута. */
const TOURS_ASSET_BASE = `${PUBLIC_ASSET_BASE}tours`;

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
  `${TOUR_WINTER_3}/gr.clip1.mov`,
  `${TOUR_WINTER_3}/gr.board.webp`,
  `${TOUR_WINTER_3}/gr.board2.webp`,
  `${TOUR_WINTER_3}/gr.clip2.mov`,
  `${TOUR_WINTER_3}/gr.elya.webp`,
  `${TOUR_WINTER_3}/gr.instr.webp`,
  `${TOUR_WINTER_3}/gr.clip3.mov`,
  `${TOUR_WINTER_3}/gr.bbq.webp`,
  `${TOUR_WINTER_3}/gr.clip4.mov`,
  `${TOUR_WINTER_3}/gr.clip5.mp4`,
] as const;

/**
 * Те же индексы, что у `TOUR_WINTER_3_GALLERY_VIEWER`: сетка страницы / карточка (webp ≤900px, mp4 H.264 низкий битрейт).
 */
export const TOUR_WINTER_3_GALLERY_GRID = [
  `${TOUR_WINTER_3}/gr.falaza.grid.webp`,
  `${TOUR_WINTER_3}/gr.griba.grid.webp`,
  `${TOUR_WINTER_3}/gr.lift.grid.webp`,
  `${TOUR_WINTER_3}/gr.clip1.grid.mp4`,
  `${TOUR_WINTER_3}/gr.board.grid.mp4`,
  `${TOUR_WINTER_3}/gr.board2.grid.webp`,
  `${TOUR_WINTER_3}/gr.clip2.grid.mp4`,
  `${TOUR_WINTER_3}/gr.elya.grid.mp4`,
  `${TOUR_WINTER_3}/gr.instr.grid.webp`,
  `${TOUR_WINTER_3}/gr.clip3.grid.mp4`,
  `${TOUR_WINTER_3}/gr.bbq.grid.mp4`,
  `${TOUR_WINTER_3}/gr.clip4.grid.mp4`,
  `${TOUR_WINTER_3}/gr.clip5.grid.mp4`,
] as const;

/** Совпадает с `TOUR_WINTER_3_GALLERY_VIEWER` — для тестов и обратной совместимости импортов. */
export const TOUR_WINTER_3_GALLERY = TOUR_WINTER_3_GALLERY_VIEWER;

/** Обложка карточки и hero: оптимизированный кадр. */
export const TOUR_WINTER_3_COVER_GRID = TOUR_WINTER_3_GALLERY_GRID[0];

export const TOUR_WINTER_3_COVER = TOUR_WINTER_3_COVER_GRID;

/** После `galleryGridUrls.slice(2)` — ветка `TourDetailGallery` сравнивает с этими **grid**-URL. */
export const TOUR_WINTER_3_LIFT_IMAGE = TOUR_WINTER_3_GALLERY_GRID[2];
export const TOUR_WINTER_3_CLIP1_VIDEO = TOUR_WINTER_3_GALLERY_GRID[3];
export const TOUR_WINTER_3_CLIP2_VIDEO = TOUR_WINTER_3_GALLERY_GRID[6];
export const TOUR_WINTER_3_CLIP3_VIDEO = TOUR_WINTER_3_GALLERY_GRID[9];

/** Кадр-постер для ленивого `<video>` в сетке (grid mp4 → webp). */
export const TOUR_WINTER_3_GRID_VIDEO_POSTERS: Record<string, string> = {
  [TOUR_WINTER_3_GALLERY_GRID[3]]: `${TOUR_WINTER_3}/gr.clip1.poster.webp`,
  [TOUR_WINTER_3_GALLERY_GRID[4]]: `${TOUR_WINTER_3}/gr.board.poster.webp`,
  [TOUR_WINTER_3_GALLERY_GRID[6]]: `${TOUR_WINTER_3}/gr.clip2.poster.webp`,
  [TOUR_WINTER_3_GALLERY_GRID[7]]: `${TOUR_WINTER_3}/gr.elya.poster.webp`,
  [TOUR_WINTER_3_GALLERY_GRID[9]]: `${TOUR_WINTER_3}/gr.clip3.poster.webp`,
  [TOUR_WINTER_3_GALLERY_GRID[10]]: `${TOUR_WINTER_3}/gr.bbq.poster.webp`,
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
 * [0] первый кадр после hero, [1] фон «О туре»; ролики `.mp4` в просмотрщике — полные файлы.
 */
export const TOUR_WINTER_4_GALLERY_VIEWER = [
  `${TOUR_WINTER_4}/hs.team.webp`,
  `${TOUR_WINTER_4}/hs.uprazh.webp`,
  `${TOUR_WINTER_4}/hs.clip1.mp4`,
  `${TOUR_WINTER_4}/hs.doggo.webp`,
  `${TOUR_WINTER_4}/hs.doggos.webp`,
  `${TOUR_WINTER_4}/hs.clip2.mp4`,
  `${TOUR_WINTER_4}/hs.gora2.webp`,
  `${TOUR_WINTER_4}/hs.gora.png`,
] as const;

/** Сетка: webp ≤900px, клипы — H.264 `*.grid.mp4`. */
export const TOUR_WINTER_4_GALLERY_GRID = [
  `${TOUR_WINTER_4}/hs.team.grid.webp`,
  `${TOUR_WINTER_4}/hs.uprazh.grid.webp`,
  `${TOUR_WINTER_4}/hs.clip1.grid.mp4`,
  `${TOUR_WINTER_4}/hs.doggo.grid.webp`,
  `${TOUR_WINTER_4}/hs.doggos.grid.webp`,
  `${TOUR_WINTER_4}/hs.clip2.grid.mp4`,
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
  `${TOUR_WINTER_5}/ars.clip1.mov`,
  `${TOUR_WINTER_5}/ars.clip2.mov`,
  `${TOUR_WINTER_5}/ars.trans-tail.webp`,
  `${TOUR_WINTER_5}/ars.team.png`,
] as const;

/** Те же индексы: сетка (webp ≤900px, mp4 H.264 для клипов). */
export const TOUR_WINTER_5_GALLERY_GRID = [
  `${TOUR_WINTER_5}/ars.main.grid.webp`,
  `${TOUR_WINTER_5}/ars.preface.grid.webp`,
  `${TOUR_WINTER_5}/ars.lift.grid.webp`,
  `${TOUR_WINTER_5}/ars.doggie.grid.webp`,
  `${TOUR_WINTER_5}/ars.clip1.grid.mp4`,
  `${TOUR_WINTER_5}/ars.clip2.grid.mp4`,
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

/**
 * Короткие лупы для баннера главной (колонки 0…9 ↔ `UI.homeSeasonBannerWordmark`).
 * Генерация: `scripts/generate-home-season-banner-loop-videos.ps1` (флаг `-Posters` — кадр-постер из первого кадра лупа).
 * Синхронизировать с таблицей `$Cuts` в том скрипте и с `src/data/homeSeasonBannerClips.ts`.
 */
export const HOME_SEASON_BANNER_WINTER_LOOP_VIDEOS = [
  `${TOUR_WINTER_3}/gr.clip1.banner-loop.mp4`,
  `${TOUR_WINTER_3}/gr.clip3.banner-loop.mp4`,
  `${TOUR_WINTER_3}/gr.clip4.banner-loop.mp4`,
  `${TOUR_WINTER_3}/gr.clip5.banner-loop.mp4`,
  `${TOUR_WINTER_4}/hs.clip1.banner-loop.mp4`,
  `${TOUR_WINTER_5}/ars.clip1.banner-loop.mp4`,
  `${TOUR_WINTER_5}/ars.clip2.banner-loop.mp4`,
  `${TOUR_WINTER_3}/gr.board.banner-loop.mp4`,
  `${TOUR_WINTER_3}/gr.elya.banner-loop.mp4`,
  `${TOUR_WINTER_3}/gr.bbq.banner-loop.mp4`,
] as const;

/** Постеры для `<video poster>` лупов баннера (первый кадр нарезки). */
export const HOME_SEASON_BANNER_WINTER_LOOP_VIDEO_POSTERS: Record<string, string> = {
  [HOME_SEASON_BANNER_WINTER_LOOP_VIDEOS[0]]: `${TOUR_WINTER_3}/gr.clip1.banner-loop.poster.webp`,
  [HOME_SEASON_BANNER_WINTER_LOOP_VIDEOS[1]]: `${TOUR_WINTER_3}/gr.clip3.banner-loop.poster.webp`,
  [HOME_SEASON_BANNER_WINTER_LOOP_VIDEOS[2]]: `${TOUR_WINTER_3}/gr.clip4.banner-loop.poster.webp`,
  [HOME_SEASON_BANNER_WINTER_LOOP_VIDEOS[3]]: `${TOUR_WINTER_3}/gr.clip5.banner-loop.poster.webp`,
  [HOME_SEASON_BANNER_WINTER_LOOP_VIDEOS[4]]: `${TOUR_WINTER_4}/hs.clip1.banner-loop.poster.webp`,
  [HOME_SEASON_BANNER_WINTER_LOOP_VIDEOS[5]]: `${TOUR_WINTER_5}/ars.clip1.banner-loop.poster.webp`,
  [HOME_SEASON_BANNER_WINTER_LOOP_VIDEOS[6]]: `${TOUR_WINTER_5}/ars.clip2.banner-loop.poster.webp`,
  [HOME_SEASON_BANNER_WINTER_LOOP_VIDEOS[7]]: `${TOUR_WINTER_3}/gr.board.banner-loop.poster.webp`,
  [HOME_SEASON_BANNER_WINTER_LOOP_VIDEOS[8]]: `${TOUR_WINTER_3}/gr.elya.banner-loop.poster.webp`,
  [HOME_SEASON_BANNER_WINTER_LOOP_VIDEOS[9]]: `${TOUR_WINTER_3}/gr.bbq.banner-loop.poster.webp`,
};

/** Логотип мессенджера MAX в модалке заявки — файл в `public/max-messenger-sign-logo.svg`. */
export const MAX_MESSENGER_SIGN_LOGO = `${PUBLIC_ASSET_BASE}max-messenger-sign-logo.svg` as const;

/** Обложки весенних туров в `public/spring tours/` (сейчас все `.webp`). */
export const SPRING_TOUR_COVERS = {
  'spring-1': `${SPRING_TOUR_PUBLIC}/spring-1.webp`,
  'spring-2': `${SPRING_TOUR_PUBLIC}/spring-2.webp`,
  'spring-3': `${SPRING_TOUR_PUBLIC}/spring-3.webp`,
  'spring-4': `${SPRING_TOUR_PUBLIC}/spring-4.webp`,
} as const;

export const IMAGES = {
  hero: {
    winter: `${BASE}/1920x1080/7BA7BC/ffffff?text=Зима+·+Вкрайности`,
    /** Фон плейсхолдера — `colors.season.spring` (без `#`). */
    spring: `${BASE}/1920x1080/C76B7E/ffffff?text=Весна+·+Вкрайности`,
    summer: `${BASE}/1920x1080/E8A838/ffffff?text=Лето+·+Вкрайности`,
    fall:   `${BASE}/1920x1080/C8622A/ffffff?text=Осень+·+Вкрайности`,
  },
  seasonSection: {
    winter: `${PUBLIC_ASSET_BASE}imagesraw/winter.png`,
    spring: `${PUBLIC_ASSET_BASE}imagesraw/spring.png`,
    summer: `${PUBLIC_ASSET_BASE}imagesraw/Summer.png`,
    fall:   `${PUBLIC_ASSET_BASE}imagesraw/fall.png`,
  },
  team: {
    placeholder: `${BASE}/400x500/1A3C2E/C8A96E?text=Эксперт`,
  },
  tours: {
    placeholder: `${BASE}/600x400/1A3C2E/C8A96E?text=Тур`,
    gallery:     `${BASE}/800x600/1A3C2E/C8A96E?text=Фото+тура`,
  },
} as const;
