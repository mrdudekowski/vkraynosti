import { ROUTES } from '../../constants/routes';

const SEASON_LIST_PATHS = new Set<string>([
  ROUTES.WINTER,
  ROUTES.SPRING,
  ROUTES.SUMMER,
  ROUTES.FALL,
  ROUTES.SAFETY,
  ROUTES.PRIVACY,
]);

const TOUR_DETAIL_PATH = /^\/tours\/(winter|spring|summer|fall)\/[^/]+$/;

/** Не восстанавливать scroll на 404 и неизвестных pathname. */
export function isScrollRestorationEligiblePath(pathname: string): boolean {
  if (pathname === ROUTES.HOME) return true;
  if (SEASON_LIST_PATHS.has(pathname)) return true;
  return TOUR_DETAIL_PATH.test(pathname);
}
