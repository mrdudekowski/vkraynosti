/**
 * Календарные месяцы сезона (SSOT для шаблона xlsx и подсказок в Google Таблицах).
 * Зима: дек–фев (переход года). Весна: мар–май. Лето: июн–авг. Осень: сен–ноя.
 */

/** @typedef {{ year: number, month: number }} YearMonth */

/** Год «сезона на сайте» — для подписей и справочника дат. */
export const SCHEDULE_PLANNING_YEAR = 2026;

/** @type {Record<string, YearMonth[]>} */
export const SEASON_CALENDAR_MONTHS = {
  winter: [
    { year: 2025, month: 12 },
    { year: 2026, month: 1 },
    { year: 2026, month: 2 },
  ],
  spring: [
    { year: 2026, month: 3 },
    { year: 2026, month: 4 },
    { year: 2026, month: 5 },
  ],
  summer: [
    { year: 2026, month: 6 },
    { year: 2026, month: 7 },
    { year: 2026, month: 8 },
  ],
  fall: [
    { year: 2026, month: 9 },
    { year: 2026, month: 10 },
    { year: 2026, month: 11 },
  ],
};

const MONTH_NAMES_NOM = [
  '',
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

/**
 * @param {number} year
 * @param {number} month 1–12
 * @returns {string}
 */
export function formatMonthHeading(year, month) {
  return `${MONTH_NAMES_NOM[month]} ${year}`;
}

/**
 * @param {number} year
 * @param {number} month 1–12
 * @returns {number}
 */
function lastDayOfMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

/**
 * @param {number} year
 * @param {number} month 1–12
 * @returns {Date[]}
 */
function allDaysInMonth(year, month) {
  /** @type {Date[]} */
  const dates = [];
  const lastDay = lastDayOfMonth(year, month);
  for (let day = 1; day <= lastDay; day++) {
    dates.push(new Date(year, month - 1, day));
  }
  return dates;
}

/**
 * @param {number} year
 * @param {number} month 1–12
 * @returns {Date[]}
 */
function weekendsInMonth(year, month) {
  return allDaysInMonth(year, month).filter((date) => {
    const dow = date.getDay();
    return dow === 0 || dow === 6;
  });
}

/**
 * Все календарные дни месяцев сезона — справочник на листе «Даты_*».
 * @param {string} season
 * @returns {Date[]}
 */
export function buildSeasonCalendarDates(season) {
  const months = SEASON_CALENDAR_MONTHS[season] ?? [];
  /** @type {Date[]} */
  const dates = [];
  for (const { year, month } of months) {
    dates.push(...allDaysInMonth(year, month));
  }
  return dates;
}

/** @deprecated используйте buildSeasonCalendarDates; оставлено для старых импортов */
export function buildSeasonWeekendDates(season) {
  const months = SEASON_CALENDAR_MONTHS[season] ?? [];
  /** @type {Date[]} */
  const dates = [];
  for (const { year, month } of months) {
    dates.push(...weekendsInMonth(year, month));
  }
  return dates;
}

/**
 * @param {string} season
 * @returns {{ year: number, month: number, label: string, days: Date[] }[]}
 */
export function buildSeasonDatesByMonth(season) {
  const months = SEASON_CALENDAR_MONTHS[season] ?? [];
  return months.map(({ year, month }) => ({
    year,
    month,
    label: formatMonthHeading(year, month),
    days: allDaysInMonth(year, month),
  }));
}

/**
 * @param {string} season
 * @returns {number} ожидаемое число строк на листе «Даты_*»
 */
export function countSeasonCalendarDays(season) {
  return buildSeasonCalendarDates(season).length;
}

/**
 * Непрерывный диапазон для встроенного календаря (Excel / Google Таблицы).
 * Тип validation: date between — иначе календарь не появляется.
 * @param {string} season
 * @returns {{ min: Date, max: Date, minParts: { year: number, month: number, day: number }, maxParts: { year: number, month: number, day: number } } | null}
 */
export function getSeasonDatePickerRange(season) {
  const months = SEASON_CALENDAR_MONTHS[season] ?? [];
  if (months.length === 0) return null;

  const first = months[0];
  const last = months[months.length - 1];
  const minParts = { year: first.year, month: first.month, day: 1 };
  const maxParts = {
    year: last.year,
    month: last.month,
    day: lastDayOfMonth(last.year, last.month),
  };

  return {
    min: new Date(minParts.year, minParts.month - 1, minParts.day),
    max: new Date(maxParts.year, maxParts.month - 1, maxParts.day),
    minParts,
    maxParts,
  };
}

/**
 * Проверка полноты: каждый месяц сезона содержит все календарные дни 1…N.
 * @param {string} season
 * @returns {{ label: string, year: number, month: number, expected: number, actual: number, ok: boolean }[]}
 */
export function verifySeasonCalendarDaysByMonth(season) {
  return buildSeasonDatesByMonth(season).map(({ year, month, label, days }) => {
    const expected = lastDayOfMonth(year, month);
    return {
      label,
      year,
      month,
      expected,
      actual: days.length,
      ok: days.length === expected,
    };
  });
}

/**
 * @param {string} cellRef например A2
 * @param {{ year: number, month: number, day: number }} start
 * @param {{ year: number, month: number, day: number }} end
 * @returns {string}
 */
function excelDateClause(cellRef, start, end) {
  return `AND(${cellRef}>=DATE(${start.year},${start.month},${start.day}),${cellRef}<=DATE(${end.year},${end.month},${end.day}))`;
}

/**
 * Формула проверки даты для Excel / Google Таблиц (EN-локаль, запятая).
 * Пустая ячейка допустима.
 * @param {string} season
 * @param {number} row
 * @param {string} [col='A']
 * @returns {string}
 */
export function seasonDateValidationFormula(season, row, col = 'A') {
  const cell = `${col}${row}`;
  const months = SEASON_CALENDAR_MONTHS[season] ?? [];
  const clauses = months.map(({ year, month }) => {
    const start = { year, month, day: 1 };
    const end = { year, month, day: lastDayOfMonth(year, month) };
    return excelDateClause(cell, start, end);
  });
  if (clauses.length === 0) return 'TRUE';
  const inSeason = clauses.length === 1 ? clauses[0] : `OR(${clauses.join(',')})`;
  return `OR(${cell}="",${inSeason})`;
}

/**
 * Та же формула для RU-локали Google Таблиц (точка с запятой).
 * @param {string} season
 * @param {number} row
 * @param {string} [col='A']
 * @returns {string}
 */
export function seasonDateValidationFormulaSheetsRu(season, row, col = 'A') {
  return seasonDateValidationFormula(season, row, col)
    .replace(/\bOR\b/g, 'ИЛИ')
    .replace(/\bAND\b/g, 'И')
    .replace(/\bDATE\b/g, 'ДАТА')
    .replace(/,/g, ';');
}

/**
 * @param {string} season
 * @returns {string}
 */
export function getSeasonDateInputPrompt(season) {
  const labels = (SEASON_CALENDAR_MONTHS[season] ?? []).map(({ year, month }) =>
    formatMonthHeading(year, month)
  );
  return `Клик по ячейке → иконка календаря справа. Месяцы сезона: ${labels.join(', ')}.`;
}

/**
 * @param {string} season
 * @returns {string}
 */
export function getSeasonDateErrorMessage(season) {
  const labels = (SEASON_CALENDAR_MONTHS[season] ?? []).map(({ year, month }) =>
    formatMonthHeading(year, month)
  );
  return `Дата должна попадать в месяцы сезона: ${labels.join(', ')}.`;
}

/** @deprecated используйте SEASON_CALENDAR_MONTHS */
export const SEASON_DATE_WINDOWS = SEASON_CALENDAR_MONTHS;
