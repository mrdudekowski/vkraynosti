import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { startOfMonth } from 'date-fns';
import { describe, expect, it, vi } from 'vitest';
import { TOUR_DEPARTURE_DAY_DEPARTURE_CLASS } from '../../constants/tourDepartureCalendar';
import TourDepartureMonthCalendar from './TourDepartureMonthCalendar';

const june2026 = startOfMonth(new Date(2026, 5, 1));
const july2026 = startOfMonth(new Date(2026, 6, 1));

const departureDateSet = new Set(['2026-06-06', '2026-06-07', '2026-07-11']);

describe('TourDepartureMonthCalendar', () => {
  it('marks departure days in display mode without interactive buttons', () => {
    const { container } = render(
      <TourDepartureMonthCalendar
        mode="display"
        departureDateSet={departureDateSet}
        monthsWithDepartures={[june2026, july2026]}
        displayMonth={june2026}
        onDisplayMonthChange={vi.fn()}
        season="spring"
      />
    );

    const departureDay = container.querySelector(`.${TOUR_DEPARTURE_DAY_DEPARTURE_CLASS}`);
    expect(departureDay).toBeTruthy();
    expect(departureDay?.tagName).toBe('DIV');
    expect(screen.queryByRole('button', { name: /Выезд: 6 июня 2026/i })).not.toBeInTheDocument();
  });

  it('does not call onSelectIso when clicking a non-departure day in select mode', async () => {
    const user = userEvent.setup();
    const onSelectIso = vi.fn();

    render(
      <TourDepartureMonthCalendar
        mode="select"
        departureDateSet={departureDateSet}
        monthsWithDepartures={[june2026]}
        displayMonth={june2026}
        onDisplayMonthChange={vi.fn()}
        season="summer"
        onSelectIso={onSelectIso}
      />
    );

    const emptyDay = screen.getByRole('button', {
      name: /^1 июня 2026, выезда нет$/i,
    });
    await user.click(emptyDay);

    expect(onSelectIso).not.toHaveBeenCalled();
  });

  it('calls onSelectIso when clicking a departure day in select mode', async () => {
    const user = userEvent.setup();
    const onSelectIso = vi.fn();

    render(
      <TourDepartureMonthCalendar
        mode="select"
        departureDateSet={departureDateSet}
        monthsWithDepartures={[june2026]}
        displayMonth={june2026}
        onDisplayMonthChange={vi.fn()}
        season="summer"
        onSelectIso={onSelectIso}
      />
    );

    const departureDay = screen.getByRole('button', { name: /Выезд: 6 июня 2026/i });
    await user.click(departureDay);

    expect(onSelectIso).toHaveBeenCalledWith('2026-06-06');
  });

  it('does not call onSelectIso in display mode when clicking a departure day', async () => {
    const user = userEvent.setup();
    const onSelectIso = vi.fn();

    const { container } = render(
      <TourDepartureMonthCalendar
        mode="display"
        departureDateSet={departureDateSet}
        monthsWithDepartures={[june2026]}
        displayMonth={june2026}
        onDisplayMonthChange={vi.fn()}
        season="spring"
        onSelectIso={onSelectIso}
      />
    );

    const departureDay = container.querySelector(`.${TOUR_DEPARTURE_DAY_DEPARTURE_CLASS}`);
    expect(departureDay).toBeTruthy();
    if (departureDay) {
      await user.click(departureDay);
    }

    expect(onSelectIso).not.toHaveBeenCalled();
  });
});
