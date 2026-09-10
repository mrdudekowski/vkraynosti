import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ADMIN_UI } from '../constants/ui';
import ScheduleWeekListLayout from './ScheduleWeekListLayout';

describe('ScheduleWeekListLayout', () => {
  it('does not repeat the page-level creation action for an empty week', () => {
    render(
      <ScheduleWeekListLayout
        days={['2026-09-01']}
        departures={[]}
        tourTitles={{}}
        tourImageUrls={{}}
        toursById={{}}
        selectedDayIso="2026-09-01"
        todayIso="2026-09-01"
        onSelectDay={vi.fn()}
        onAddOnDate={vi.fn()}
        onOpenDeparture={vi.fn()}
        onDropChip={vi.fn()}
      />,
    );

    expect(screen.queryByRole('button', { name: ADMIN_UI.scheduleAdd })).not.toBeInTheDocument();
  });
});
