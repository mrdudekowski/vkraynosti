import { PUBLIC_ASSET_BASE } from './fonts';

const BASE = 'https://placehold.co';

/** Папка `public/spring tours/` — пробел в URL кодируется. */
const SPRING_TOUR_PUBLIC = `${PUBLIC_ASSET_BASE}spring%20tours`;

/** Папки туров: `public/tours/{tourId}/` — обложка и галерея одного маршрута. */
const TOURS_ASSET_BASE = `${PUBLIC_ASSET_BASE}tours`;

const TOUR_WINTER_1 = `${TOURS_ASSET_BASE}/winter-1`;

/** Кадр с посадкой / людьми — отдельное кадрирование в `TourDetailGallery`. */
export const TOUR_WINTER_1_REST4_IMAGE = `${TOUR_WINTER_1}/iz.rest4.webp` as const;

/** Верхний ряд рядом с панорамой — растягивание по высоте строки (`sm+`). */
export const TOUR_WINTER_1_TOP_IMAGE = `${TOUR_WINTER_1}/iz.top.webp` as const;

/** Галерея «Восхождение на Изюбриную» — [0] = обложка (iz.ava); [1] = первый кадр в сетке (iz.close); далее bento + остальные. */
export const TOUR_WINTER_1_GALLERY = [
  `${TOUR_WINTER_1}/iz.ava.webp`,
  `${TOUR_WINTER_1}/iz.close.webp`,
  `${TOUR_WINTER_1}/iz.peoplewalk.webp`,
  `${TOUR_WINTER_1}/trees2.webp`,
  `${TOUR_WINTER_1}/trees.webp`,
  TOUR_WINTER_1_TOP_IMAGE,
  `${TOUR_WINTER_1}/iz.rest2.webp`,
  `${TOUR_WINTER_1}/iz.pan2.webp`,
  TOUR_WINTER_1_REST4_IMAGE,
] as const;

export const TOUR_WINTER_1_COVER = TOUR_WINTER_1_GALLERY[0];

const TOUR_WINTER_2 = `${TOURS_ASSET_BASE}/winter-2`;

/** Кадр вершины — полная ширина сетки в `TourDetailGallery` для тура Голец. */
export const TOUR_WINTER_2_PEAK_IMAGE = `${TOUR_WINTER_2}/peak.webp` as const;

/** Галерея «Восхождение на г. Голец» — порядок: лес → подъём → лес → вершина → перекус; [0] = обложка. */
export const TOUR_WINTER_2_GALLERY = [
  `${TOUR_WINTER_2}/les.webp`,
  `${TOUR_WINTER_2}/podnimaem.webp`,
  `${TOUR_WINTER_2}/les2.webp`,
  `${TOUR_WINTER_2}/les3.webp`,
  `${TOUR_WINTER_2}/les4.webp`,
  TOUR_WINTER_2_PEAK_IMAGE,
  `${TOUR_WINTER_2}/kushat.webp`,
  `${TOUR_WINTER_2}/kushat2.webp`,
] as const;

export const TOUR_WINTER_2_COVER = TOUR_WINTER_2_GALLERY[0];

const TOUR_WINTER_3 = `${TOURS_ASSET_BASE}/winter-3`;

/**
 * Галерея «Фалаза × Грибановка» (winter-3): [0] обложка, [1] второй кадр в полноэкранном просмотре; `gr.boarder` не в массиве — только `TOUR_WINTER_3_PREFACE_BACKGROUND` для блока «О туре». После `slice(2)` — ветка в `TourDetailGallery`.
 * Ролики `.mov`/`.mp4` — зацикленные, некликабельные (см. `TourDetailGallery` + `isVideoAssetUrl`).
 */
export const TOUR_WINTER_3_GALLERY = [
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

export const TOUR_WINTER_3_COVER = TOUR_WINTER_3_GALLERY[0];

/** После `galleryImages.slice(2)`: [0] lift под bento — в сетке 4 колонки, квадратный кадр (`TourDetailGallery`). */
export const TOUR_WINTER_3_LIFT_IMAGE = TOUR_WINTER_3_GALLERY[2];
/** Индекс [1] в `slice(2)`; в сетке — ряд с bbq. */
export const TOUR_WINTER_3_CLIP1_VIDEO = TOUR_WINTER_3_GALLERY[3];
/** Индекс [4] в `slice(2)`; в bento — слева, два квадрата по вертикали. */
export const TOUR_WINTER_3_CLIP2_VIDEO = TOUR_WINTER_3_GALLERY[6];
/** Индекс [7] в `slice(2)`; в bento — справа, два квадрата по вертикали. */
export const TOUR_WINTER_3_CLIP3_VIDEO = TOUR_WINTER_3_GALLERY[9];
/** `gr.boarder` — только фон блока «О туре» (`Tour.prefaceBackgroundImageUrl`), не в `TOUR_WINTER_3_GALLERY`. */
export const TOUR_WINTER_3_PREFACE_BACKGROUND = `${TOUR_WINTER_3}/gr.boarder.webp` as const;

const TOUR_WINTER_4 = `${TOURS_ASSET_BASE}/winter-4`;

/** Главный кадр hero / карточка тура (не обязан совпадать с [0] галереи). */
export const TOUR_WINTER_4_COVER = `${TOUR_WINTER_4}/hs.doggos2.webp` as const;

/**
 * Галерея «Хаски-тур» (winter-4): [0] первый кадр в ленте после hero, [1] фон блока «О туре» (упряжка);
 * после `slice(2)` — bento (clip1 + doggo + doggos), затем сетка (без отдельной панорамы 21:9).
 * `hs.doggos2` только в `TOUR_WINTER_4_COVER` (hero).
 * Ролики `.mp4` — зацикленные, некликабельные (`TourDetailGallery` + `isVideoAssetUrl`).
 */
export const TOUR_WINTER_4_GALLERY = [
  `${TOUR_WINTER_4}/hs.team.webp`,
  `${TOUR_WINTER_4}/hs.uprazh.webp`,
  `${TOUR_WINTER_4}/hs.clip1.mp4`,
  `${TOUR_WINTER_4}/hs.doggo.webp`,
  `${TOUR_WINTER_4}/hs.doggos.webp`,
  `${TOUR_WINTER_4}/hs.clip2.mp4`,
  `${TOUR_WINTER_4}/hs.gora2.webp`,
  `${TOUR_WINTER_4}/hs.gora.png`,
] as const;

/** Кадр горы в сетке после `slice(2)` (`hs.gora.png`); кадрирование — `object-gallery-winter-4-gora`. */
export const TOUR_WINTER_4_GORA_IMAGE = TOUR_WINTER_4_GALLERY[7];

/** После `galleryImages.slice(2)`: [0] ролик слева в bento, [1][2] — квадраты справа (`TourDetailGallery`). */
export const TOUR_WINTER_4_CLIP1_VIDEO = TOUR_WINTER_4_GALLERY[2];
export const TOUR_WINTER_4_DOGGO_IMAGE = TOUR_WINTER_4_GALLERY[3];
export const TOUR_WINTER_4_DOGGOS_IMAGE = TOUR_WINTER_4_GALLERY[4];

const TOUR_WINTER_5 = `${TOURS_ASSET_BASE}/winter-5`;

/**
 * Галерея «АрсГора» (winter-5): [0] обложка, [1] preface; сетка `arsgora` — портрет; bento doggie|clip1; низ — clip2 на 2 квадрата, справа trans-tail и team.
 */
export const TOUR_WINTER_5_GALLERY = [
  `${TOUR_WINTER_5}/ars.main.webp`,
  `${TOUR_WINTER_5}/ars.preface.webp`,
  `${TOUR_WINTER_5}/ars.lift.webp`,
  `${TOUR_WINTER_5}/ars.doggie.webp`,
  `${TOUR_WINTER_5}/ars.clip1.mov`,
  `${TOUR_WINTER_5}/ars.clip2.mov`,
  `${TOUR_WINTER_5}/ars.trans-tail.webp`,
  `${TOUR_WINTER_5}/ars.team.png`,
] as const;

export const TOUR_WINTER_5_COVER = TOUR_WINTER_5_GALLERY[0];

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
    spring: `${BASE}/1920x1080/7DBF8C/ffffff?text=Весна+·+Вкрайности`,
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
