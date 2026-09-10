export const TOUR_DURATION_DAYS_MIN = 1;
/** Catalog select convenience range only; completeness/patch/schema have no max. */
export const TOUR_DURATION_DAYS_MAX = 14;

export const TOUR_DURATION_DAY_OPTIONS: readonly number[] = Array.from(
  { length: TOUR_DURATION_DAYS_MAX - TOUR_DURATION_DAYS_MIN + 1 },
  (_, index) => TOUR_DURATION_DAYS_MIN + index,
);

export function isTourDurationDays(value: number): boolean {
  return Number.isInteger(value) && value >= TOUR_DURATION_DAYS_MIN;
}

export function publicDurationFromDays(durationDays: number): string {
  const abs = Math.abs(durationDays) % 100;
  const last = abs % 10;
  let word = 'дней';
  if (abs < 11 || abs > 19) {
    if (last === 1) {
      word = 'день';
    } else if (last >= 2 && last <= 4) {
      word = 'дня';
    }
  }
  return `${durationDays} ${word}`;
}

export function durationDaysFromLabel(label: string): number | undefined {
  const match = label.trim().match(/^(\d+)\s*(день|дня|дней)/);
  if (match == null) {
    return undefined;
  }
  const days = Number(match[1]);
  return isTourDurationDays(days) ? days : undefined;
}
