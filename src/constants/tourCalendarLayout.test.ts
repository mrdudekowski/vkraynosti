import { describe, expect, it } from 'vitest';
import type { Config } from 'tailwindcss';
import tailwindConfig from '../../tailwind.config';
import {
  TOUR_CALENDAR_DAY_BUTTON_CLASS,
  TOUR_CALENDAR_DAY_CELL_CLASS,
  TOUR_CALENDAR_DAY_CELL_MAX_WIDTH,
  TOUR_CALENDAR_DAY_PANEL_MIN_HEIGHT,
  TOUR_CALENDAR_MONTH_GRID_CLASS,
  TOUR_CALENDAR_SELECT_DATE_PANEL_CLASS,
  TOUR_CALENDAR_WEEKDAY_CLASS,
} from './tourCalendarLayout';
import {
  TOUR_DEPARTURE_DAY_CELL_CLASS,
  TOUR_DEPARTURE_DAY_CELL_MAX_WIDTH,
  TOUR_DEPARTURE_WEEKDAY_CLASS,
} from './tourDepartureCalendar';

function getExtend<K extends string>(
  config: Config,
  key: K,
): Record<string, string> | undefined {
  const theme = config.theme;
  const extend = theme && typeof theme === 'object' && 'extend' in theme ? theme.extend : undefined;
  const block =
    extend && typeof extend === 'object' && extend !== null && key in extend
      ? extend[key as keyof typeof extend]
      : undefined;
  return block && typeof block === 'object' ? (block as Record<string, string>) : undefined;
}

describe('tourCalendarLayout', () => {
  it('exposes class strings without arbitrary max-w/min-h', () => {
    expect(TOUR_CALENDAR_DAY_BUTTON_CLASS).toContain('tour-calendar__day-btn');
    expect(TOUR_CALENDAR_DAY_BUTTON_CLASS).toContain('max-w-tour-calendar-day-cell');
    expect(TOUR_CALENDAR_DAY_BUTTON_CLASS).toContain('overflow-hidden');
    expect(TOUR_CALENDAR_DAY_BUTTON_CLASS).not.toContain('max-w-[');
    expect(TOUR_CALENDAR_DAY_CELL_CLASS).toContain('align-middle');
    expect(TOUR_CALENDAR_DAY_CELL_CLASS).not.toContain('flex');
    expect(TOUR_CALENDAR_DAY_CELL_CLASS).not.toContain('max-w-tour-calendar-day-cell');
    expect(TOUR_CALENDAR_SELECT_DATE_PANEL_CLASS).toContain('min-h-tour-calendar-day-panel');
    expect(TOUR_CALENDAR_SELECT_DATE_PANEL_CLASS).not.toContain('min-h-[');
  });

  it('matches tailwind theme.extend maxWidth and minHeight', () => {
    const maxWidth = getExtend(tailwindConfig as Config, 'maxWidth');
    const minHeight = getExtend(tailwindConfig as Config, 'minHeight');
    expect(maxWidth?.['tour-calendar-day-cell']).toBe(TOUR_CALENDAR_DAY_CELL_MAX_WIDTH);
    expect(maxWidth?.['tour-departure-day-cell']).toBe(TOUR_DEPARTURE_DAY_CELL_MAX_WIDTH);
    expect(minHeight?.['tour-calendar-day-panel']).toBe(TOUR_CALENDAR_DAY_PANEL_MIN_HEIGHT);
  });

  it('uses table-fixed grid without flex on weekday and day cells', () => {
    expect(TOUR_CALENDAR_MONTH_GRID_CLASS).toContain('table-fixed');
    expect(TOUR_CALENDAR_WEEKDAY_CLASS).not.toContain('flex');
    expect(TOUR_CALENDAR_DAY_CELL_CLASS).not.toContain('flex');
    expect(TOUR_DEPARTURE_WEEKDAY_CLASS).not.toContain('flex');
    expect(TOUR_DEPARTURE_DAY_CELL_CLASS).not.toContain('flex');
  });
});
