import type { NavigateFunction } from 'react-router-dom';
import { matchPath } from 'react-router-dom';
import { NAV_STATE_SKIP_SCROLL_TO_TOP } from '../constants/navigation';
import { ROUTES, SEASON_TO_LIST_ROUTE } from '../constants/routes';
import type { Season } from '../types';

/**
 * Навигация по сезону как в `SeasonSwitcher` с `variant="navbar"`.
 * Возвращает `true`, если выполнен переход (нужен flash-оверлей).
 */
export function navigateSeasonFromNavbar(
  navigate: NavigateFunction,
  pathname: string,
  season: Season,
): boolean {
  const listPath = SEASON_TO_LIST_ROUTE[season];
  if (pathname === listPath) return false;
  const detailMatch = matchPath(ROUTES.TOUR_DETAIL, pathname);
  if (detailMatch?.params.season === season) return false;
  navigate(listPath, { state: NAV_STATE_SKIP_SCROLL_TO_TOP });
  return true;
}
