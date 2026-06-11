import type { Season } from '../types';
import { normalizeCanonicalPath } from './canonicalUrl';
import type { TourUrlSource } from './tourUrls';
import { getTourPublicPath } from './tourUrls';

export {
  getLegacyTourPath,
  getTourCanonicalUrl,
  getTourPublicPath,
} from './tourUrls';

/** Должен совпадать с `id` секции «Команда» на главной (`TeamHeroSection`). */
export const HOME_SECTION_TEAM = 'team' as const;

/** Должен совпадать с `id` секции контактов на главной (`ContactSection`). */
export const HOME_SECTION_CONTACT = 'contact' as const;

/** Должен совпадать с `UI.sections.homeToursSectionElementId` и секцией туров на главной. */
export const HOME_SECTION_TOURS = 'tours' as const;

export const ROUTES = {
  HOME:        '/',
  WINTER:      '/tours/winter',
  SPRING:      '/tours/spring',
  SUMMER:      '/tours/summer',
  FALL:        '/tours/fall',
  /** Паттерн списка туров сезона (`ROUTES.WINTER` … `ROUTES.FALL`). */
  SEASON_LIST: '/tours/:season',
  TOUR_DETAIL: '/tours/:season/:tourId',
  SAFETY:      '/safety',
  PRIVACY:     '/privacy',
} as const;

export const buildHomeSectionPath = (sectionId: string): string =>
  `${ROUTES.HOME}#${sectionId}`;

/** Список туров по сезону — единая карта для навигации и ссылок «назад». */
export const SEASON_TO_LIST_ROUTE: Record<Season, string> = {
  winter: ROUTES.WINTER,
  spring: ROUTES.SPRING,
  summer: ROUTES.SUMMER,
  fall:   ROUTES.FALL,
};

/**
 * Build a tour page path from season + URL segment (slug or id).
 * Prefer {@link getTourPublicPath} with a tour object for public links.
 */
export const buildTourDetailPath = (season: string, segment: string): string =>
  normalizeCanonicalPath(`/tours/${season}/${segment}`);

/** Public tour page path from catalog entry. */
export const buildTourPublicPath = (tour: TourUrlSource): string =>
  getTourPublicPath(tour);
