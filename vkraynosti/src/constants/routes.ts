export const ROUTES = {
  HOME:        '/',
  WINTER:      '/tours/winter',
  SPRING:      '/tours/spring',
  SUMMER:      '/tours/summer',
  FALL:        '/tours/fall',
  TOUR_DETAIL: '/tours/:season/:tourId',
  SAFETY:      '/safety',
} as const;

export const buildTourDetailPath = (season: string, tourId: string): string =>
  `/tours/${season}/${tourId}`;
