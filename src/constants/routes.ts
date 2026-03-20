import type { Season } from '../types';

export const ROUTES = {
  HOME:        '/',
  WINTER:      '/tours/winter',
  SPRING:      '/tours/spring',
  SUMMER:      '/tours/summer',
  FALL:        '/tours/fall',
  TOUR_DETAIL: '/tours/:season/:tourId',
  SAFETY:      '/safety',
  PRIVACY:     '/privacy',
} as const;

/** Список туров по сезону — единая карта для навигации и ссылок «назад». */
export const SEASON_TO_LIST_ROUTE: Record<Season, string> = {
  winter: ROUTES.WINTER,
  spring: ROUTES.SPRING,
  summer: ROUTES.SUMMER,
  fall:   ROUTES.FALL,
};

export const buildTourDetailPath = (season: string, tourId: string): string =>
  `/tours/${season}/${tourId}`;
