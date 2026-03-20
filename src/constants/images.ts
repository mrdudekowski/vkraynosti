const BASE = 'https://placehold.co';

// Vite injects the correct base path (e.g. /vkraynosti/) so public assets
// resolve correctly in both dev and production regardless of the deploy sub-path.
const ASSET = import.meta.env.BASE_URL;

/** Папка `public/spring tours/` — пробел в URL кодируется. */
const SPRING_TOUR_PUBLIC = `${ASSET}spring%20tours`;

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
    winter: `${ASSET}imagesraw/winter.png`,
    spring: `${ASSET}imagesraw/spring.png`,
    summer: `${ASSET}imagesraw/Summer.png`,
    fall:   `${ASSET}imagesraw/fall.png`,
  },
  team: {
    placeholder: `${BASE}/400x500/1A3C2E/C8A96E?text=Эксперт`,
  },
  tours: {
    placeholder: `${BASE}/600x400/1A3C2E/C8A96E?text=Тур`,
    gallery:     `${BASE}/800x600/1A3C2E/C8A96E?text=Фото+тура`,
  },
} as const;
