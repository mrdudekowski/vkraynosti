import { useMemo } from 'react';
import type { Season } from '../types';
import { getVisibleToursBySeason } from '../utils/tourSchedule/getVisibleToursBySeason';
import { sortToursInDevelopmentLast } from '../utils/sortToursInDevelopmentLast';
import { useTourSchedule } from './useTourSchedule';

export const useVisibleToursBySeason = (season: Season) => {
  const { publicationStatuses, status } = useTourSchedule();
  const scheduleLoaded = status === 'success';

  const tours = useMemo(
    () =>
      sortToursInDevelopmentLast(
        getVisibleToursBySeason(season, publicationStatuses, { scheduleLoaded }),
        publicationStatuses,
      ),
    [season, publicationStatuses, scheduleLoaded],
  );

  return { tours, scheduleLoaded, publicationStatuses };
};
