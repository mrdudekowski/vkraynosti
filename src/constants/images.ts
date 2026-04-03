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
