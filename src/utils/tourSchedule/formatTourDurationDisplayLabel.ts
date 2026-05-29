import { UI } from '../../constants/ui';
import type { TourScheduleDurationType } from '../../types/tourSchedule';

/** Каталог кол. D (однодневный / многодневный) → подпись на сайте. */
export const formatTourDurationDisplayLabel = (
  durationType: TourScheduleDurationType
): string => {
  switch (durationType) {
    case 'однодневный':
      return UI.tourDetail.durationDisplayOneDay;
    case 'многодневный':
      return UI.tourDetail.durationDisplayMultiDay;
    default: {
      const _exhaustive: never = durationType;
      return _exhaustive;
    }
  }
};
