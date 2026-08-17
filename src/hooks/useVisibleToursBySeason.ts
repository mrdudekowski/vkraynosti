import { useMemo } from 'react';
import { useCmsToursRevision } from '../cms/useCmsToursRevision';
import type { Season } from '../types';
import { getVisibleToursBySeason } from '../utils/tourSchedule/getVisibleToursBySeason';
import { sortToursInDevelopmentLast } from '../utils/sortToursInDevelopmentLast';
import { useTourSchedule } from './useTourSchedule';

export const useVisibleToursBySeason = (season: Season) => {
  const cmsToursRevision = useCmsToursRevision();
  const { publicationStatuses, status } = useTourSchedule();
  const scheduleLoaded = status === 'success';

  const tours = useMemo(
    () => {
      void cmsToursRevision;
      return sortToursInDevelopmentLast(
        getVisibleToursBySeason(season, publicationStatuses, { scheduleLoaded }),
        publicationStatuses,
      );
    },
    [season, publicationStatuses, scheduleLoaded, cmsToursRevision],
  );

  return { tours, scheduleLoaded, publicationStatuses };
};
