import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { AdminDeparture, AdminTourListItem } from '../api';
import ScheduleOperationalRail from './ScheduleOperationalRail';

const departure: AdminDeparture = {
  id: 'departure-1',
  tourId: 'winter-1',
  startsOn: '2026-08-19',
  endsOn: '2026-08-19',
  seats: 12,
  status: 'open',
  version: 1,
  createdAt: '2026-08-18T00:00:00.000Z',
  updatedAt: '2026-08-18T00:00:00.000Z',
};

const tour: AdminTourListItem = {
  id: 'winter-1',
  title: 'Изюбриная',
  season: 'winter',
  status: 'active',
  published: true,
  imageUrl: 'https://cdn.example/winter.webp',
  ready: true,
  readyCount: 5,
  readyTotal: 5,
  slug: 'izubrinaya',
};

describe('ScheduleOperationalRail', () => {
  it('renders a nearest departure with its actual tour cover', () => {
    render(
      <ScheduleOperationalRail
        nearestDepartures={[departure]}
        toursById={{ [tour.id]: tour }}
      />,
    );

    expect(screen.getByRole('img', { name: 'Изюбриная' })).toHaveAttribute(
      'src',
      'https://cdn.example/winter.webp',
    );
    expect(screen.getByText('Набор открыт')).toBeVisible();
  });
});
