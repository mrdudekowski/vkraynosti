import type { Season } from '../types';
import { vladivostokCalendarDate } from './scheduleCalendar';

function seasonFromMonth(month: number): Season {
  if (month === 12 || month === 1 || month === 2) {
    return 'winter';
  }
  if (month >= 3 && month <= 5) {
    return 'spring';
  }
  if (month >= 6 && month <= 8) {
    return 'summer';
  }
  return 'fall';
}

export function adminCalendarSeason(now: Date = new Date()): Season {
  return seasonFromMonth(Number(vladivostokCalendarDate(now).slice(5, 7)));
}

export function adminCalendarSeasonFromIso(iso: string): Season {
  return seasonFromMonth(Number(iso.slice(5, 7)));
}

export function isCrossSeasonDeparture(tourSeason: Season, startsOn: string): boolean {
  return tourSeason !== adminCalendarSeasonFromIso(startsOn);
}
