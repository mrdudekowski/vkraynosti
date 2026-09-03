import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { AdminDeparture } from '../api';
import ScheduleWeekDepartureRow from './ScheduleWeekDepartureRow';

const departure: AdminDeparture = {
  id: 'departure-1',
  tourId: 'winter-1',
  startsOn: '2026-09-04',
  endsOn: '2026-09-04',
  seats: 8,
  status: 'open',
  version: 1,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
};

describe('ScheduleWeekDepartureRow', () => {
  it('keeps the row clickable without enabling native drag when drag is disabled', () => {
    render(
      <ScheduleWeekDepartureRow
        departure={departure}
        title="Зимний маршрут"
        imageUrl={null}
        variant="row"
        onOpen={vi.fn()}
        onDragStart={vi.fn()}
        dragEnabled={false}
      />,
    );

    const row = screen.getByRole('button', { name: 'Зимний маршрут' }).parentElement;
    expect(row).not.toHaveAttribute('draggable', 'true');
    expect(row).not.toHaveAttribute('draggable', 'false');
  });

  it('enables native drag for desktop scheduling', () => {
    render(
      <ScheduleWeekDepartureRow
        departure={departure}
        title="Зимний маршрут"
        imageUrl={null}
        variant="row"
        onOpen={vi.fn()}
        onDragStart={vi.fn()}
        dragEnabled
      />,
    );

    expect(screen.getByRole('button', { name: 'Зимний маршрут' }).parentElement).toHaveAttribute(
      'draggable',
      'true',
    );
  });
});
