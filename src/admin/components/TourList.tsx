import { useMemo, useState } from 'react';
import type { AdminTourListItem } from '../api';
import {
  ADMIN_TOUR_VISIBILITY,
  matchesAdminTourVisibility,
  type AdminTourVisibilityFilter,
} from '../adminTourVisibility';
import { ADMIN_UI } from '../constants/ui';
import AdminButton from './AdminButton';
import AdminEmptyState from './AdminEmptyState';
import { AdminTextInput } from './AdminFields';
import AdminTourCard from './AdminTourCard';

type TourListProps = {
  tours: AdminTourListItem[];
};

const TourList = ({ tours }: TourListProps) => {
  const [query, setQuery] = useState('');
  const [visibility, setVisibility] = useState<AdminTourVisibilityFilter>('all');

  const visible = useMemo(
    () => tours.filter((tour) => matchesAdminTourVisibility(tour, visibility, query)),
    [query, tours, visibility],
  );

  if (tours.length === 0) {
    return <AdminEmptyState title={ADMIN_UI.emptyList} description={ADMIN_UI.emptyListHint} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <label className="flex min-w-0 max-w-md flex-1 flex-col gap-1">
          <span className="text-sm font-medium text-text-primary">{ADMIN_UI.searchTours}</span>
          <AdminTextInput
            id="admin-tour-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div className="flex flex-wrap gap-1" role="group" aria-label={ADMIN_UI.tourVisibilityFilter}>
          {ADMIN_TOUR_VISIBILITY.map((item) => (
            <AdminButton
              key={item}
              type="button"
              variant={visibility === item ? 'primary' : 'ghost'}
              onClick={() => setVisibility(item)}
            >
              {ADMIN_UI.tourVisibility[item]}
            </AdminButton>
          ))}
        </div>
      </div>
      {visible.length === 0 ? (
        <AdminEmptyState title={ADMIN_UI.emptySearch} />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((tour) => (
            <li key={tour.id} className="flex justify-center">
              <AdminTourCard tour={tour} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TourList;
