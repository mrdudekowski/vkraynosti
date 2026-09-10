import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ADMIN_UI } from '../constants/ui';
import ScheduleWeekDayPanel from './ScheduleWeekDayPanel';

describe('ScheduleWeekDayPanel', () => {
  it('shows one date-scoped creation action when the selected day is empty', () => {
    render(
      <ScheduleWeekDayPanel
        iso="2026-09-05"
        departures={[]}
        tourTitles={{}}
        tourImageUrls={{}}
        toursById={{}}
        onAdd={vi.fn()}
        onOpenDeparture={vi.fn()}
      />,
    );

    expect(screen.getAllByRole('button', { name: ADMIN_UI.scheduleAddDeparture })).toHaveLength(1);
  });
});
