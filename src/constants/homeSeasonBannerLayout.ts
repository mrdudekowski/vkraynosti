/**
 * Раскладка баннера «Вкрайности»: индексы колонок и классы из `theme.extend` (`tailwind.config.ts`).
 */
import { UI } from './ui';

/** Индекс колонки с буквой «н» в `UI.homeSeasonBannerWordmark` (только эта колонка — особое кадрирование loop весны). */
export const HOME_SEASON_BANNER_WORDMARK_N_LETTER_COLUMN_INDEX = [...UI.homeSeasonBannerWordmark].indexOf(
  'н'
);

if (import.meta.env.DEV && HOME_SEASON_BANNER_WORDMARK_N_LETTER_COLUMN_INDEX < 0) {
  throw new Error('homeSeasonBannerLayout: UI.homeSeasonBannerWordmark must include «н»');
}

/**
 * Весна, колонка «н»: якорь `object-position` справа (`100% 50%`) у loop-видео/постера в prehero.
 * См. `object-home-season-banner-spring-loop` в теме.
 */
export const HOME_SEASON_BANNER_SPRING_N_COLUMN_LOOP_OBJECT_CLASS =
  'object-home-season-banner-spring-loop' as const;
