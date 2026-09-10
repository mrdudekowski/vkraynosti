/**
 * Подпись тура в dropdown: «Название | spring-3».
 * Разделитель не должен встречаться в названиях; скобки в title не ломают извлечение id.
 */
export const TOUR_PICK_DELIMITER = ' | ';

/**
 * @param {number} row
 * @returns {string}
 */
export function catalogPickFormula(row) {
  return `B${row}&"${TOUR_PICK_DELIMITER}"&A${row}`;
}

/**
 * Excel: id после последнего разделителя.
 * @param {number} row
 * @returns {string}
 */
export function scheduleTourIdFormula(row) {
  const delim = TOUR_PICK_DELIMITER.replace(/"/g, '""');
  return `IF(C${row}="","",TRIM(MID(C${row},SEARCH("${delim}",C${row})+${TOUR_PICK_DELIMITER.length},LEN(C${row}))))`;
}

/**
 * @param {string} tourPick
 * @returns {string}
 */
export function extractTourIdFromPick(tourPick) {
  if (!tourPick) return '';
  const idx = tourPick.lastIndexOf(TOUR_PICK_DELIMITER);
  if (idx < 0) return '';
  return tourPick.slice(idx + TOUR_PICK_DELIMITER.length).trim();
}

/**
 * @param {string} title
 * @param {string} id
 * @returns {string}
 */
export function buildTourPickLabel(title, id) {
  return `${title}${TOUR_PICK_DELIMITER}${id}`;
}
