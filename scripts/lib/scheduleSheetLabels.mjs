/** Подписи листов и столбцов шаблона расписания (RU). */

export const CATALOG_SHEETS = {
  winter: 'Туры_Зима',
  spring: 'Туры_Весна',
  summer: 'Туры_Лето',
  fall: 'Туры_Осень',
};

export const DATES_SHEETS = {
  winter: 'Даты_Зима',
  spring: 'Даты_Весна',
  summer: 'Даты_Лето',
  fall: 'Даты_Осень',
};

export const SCHEDULE_SHEETS = {
  winter: 'Расписание_Зима',
  spring: 'Расписание_Весна',
  summer: 'Расписание_Лето',
  fall: 'Расписание_Осень',
};

export const CATALOG_HEADERS = ['ID тура', 'Название', 'Цена ₽', 'Тип тура', 'Подпись списка'];

export const DATES_HEADERS = ['Месяц', 'Дата', 'Подпись', 'День'];

export const SCHEDULE_HEADERS = [
  'Дата',
  'День недели',
  'Тур',
  'ID тура',
  'Тип',
  'Цена ₽',
  'Места',
  'Статус',
  'Комментарий',
];

/** Значения выпадающего списка «Статус» (без запятых внутри). */
export const STATUS_VALUES = ['запланирован', 'набор открыт', 'мест нет', 'отменён'];

export const STATUS_LIST = `"${STATUS_VALUES.join(',')}"`;

/** Маппинг для будущего JSON-экспорта (Apps Script). */
export const STATUS_TO_EXPORT_CODE = {
  запланирован: 'planned',
  'набор открыт': 'open',
  'мест нет': 'full',
  отменён: 'cancelled',
};

/**
 * @param {string} sheetName
 * @param {string} range A1-стиль, например $A$2:$D$14
 */
export function sheetRange(sheetName, range) {
  return `'${sheetName}'!${range}`;
}

/**
 * Колонки «Расписание_*» для экспорта на сайт / календарь.
 * Календарь читает только tourId (D), не колонку «Тур» (C).
 */
export const SCHEDULE_EXPORT_FIELDS = {
  date: { col: 'A', key: 'date' },
  weekday: { col: 'B', key: 'weekday' },
  tourPick: { col: 'C', key: 'tourPick' },
  tourId: { col: 'D', key: 'tourId' },
  durationType: { col: 'E', key: 'durationType' },
  priceRub: { col: 'F', key: 'priceRub' },
  seats: { col: 'G', key: 'seats' },
  status: { col: 'H', key: 'status' },
  comment: { col: 'I', key: 'comment' },
};
