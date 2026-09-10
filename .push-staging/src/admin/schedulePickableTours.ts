import type { AdminTourListItem } from './api';
import { adminTourVisibility } from './adminTourVisibility';
import type { SchedulePickableTour } from './components/AddDepartureWizard';

export function listSchedulePickableTours(tours: readonly AdminTourListItem[]): SchedulePickableTour[] {
  return tours
    .filter((tour) => adminTourVisibility(tour) === 'on_site')
    .map((tour) => ({
      id: tour.id,
      title: tour.title,
      season: tour.season,
      imageUrl: tour.imageUrl,
    }));
}
