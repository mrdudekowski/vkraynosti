import { useLayoutEffect } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useSeason } from '../../context/SeasonContext';
import type { Season } from '../../types';

const isSeason = (value: string): value is Season =>
  value === 'winter' || value === 'spring' || value === 'summer' || value === 'fall';

const SeasonRouteSync = () => {
  const { pathname } = useLocation();
  const { setActiveSeason } = useSeason();

  useLayoutEffect(() => {
    const detailMatch = matchPath(ROUTES.TOUR_DETAIL, pathname);
    const listMatch = matchPath(
      { path: '/tours/:season', end: true },
      pathname
    );
    const raw = detailMatch?.params.season ?? listMatch?.params.season;
    if (raw && isSeason(raw)) {
      setActiveSeason(raw);
    }
  }, [pathname, setActiveSeason]);

  return null;
};

export default SeasonRouteSync;
