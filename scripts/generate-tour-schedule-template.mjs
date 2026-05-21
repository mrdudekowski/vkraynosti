#!/usr/bin/env node
/**
 * Генерирует content/Calendar/vkraynosti-tour-schedule-template.xlsx
 * Каталог туров — из src/data/toursData.ts (SSOT).
 */
import ExcelJS from 'exceljs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadTourCatalog } from './lib/tourScheduleCatalog.mjs';
import {
  buildSeasonDatesByMonth,
  getSeasonDateErrorMessage,
  getSeasonDateInputPrompt,
  getSeasonDatePickerRange,
} from './lib/seasonDates.mjs';
import {
  CATALOG_HEADERS,
  CATALOG_SHEETS,
  DATES_HEADERS,
  DATES_SHEETS,
  SCHEDULE_HEADERS,
  SCHEDULE_SHEETS,
  STATUS_LIST,
  sheetRange,
} from './lib/scheduleSheetLabels.mjs';
import { catalogPickFormula, scheduleTourIdFormula } from './lib/tourPickFormula.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(__dirname, '../content/Calendar/vkraynosti-tour-schedule-template.xlsx');

const SEASONS = ['winter', 'spring', 'summer', 'fall'];

/** Строк расписания на сезон. */
const SCHEDULE_ROW_COUNT = 120;

const DURATION_LIST = '"однодневный,многодневный"';

const WEEKDAY_FORMULA = (row) =>
  `IF(A${row}="","",CHOOSE(WEEKDAY(A${row},2),"пн","вт","ср","чт","пт","сб","вс"))`;

function styleHeaderRow(row, fillArgb) {
  row.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillArgb } };
  row.alignment = { vertical: 'middle', wrapText: true };
}

function addListValidation(cell, formulae, errorTitle, error) {
  cell.dataValidation = {
    type: 'list',
    allowBlank: true,
    formulae,
    showErrorMessage: true,
    errorTitle,
    error,
  };
}

function addColumnListValidation(ws, col, fromRow, toRow, formulae, errorTitle, error) {
  for (let r = fromRow; r <= toRow; r++) {
    addListValidation(ws.getCell(`${col}${r}`), formulae, errorTitle, error);
  }
}

/**
 * @param {import('exceljs').Workbook} wb
 * @param {string} sheetName
 * @param {import('./lib/tourScheduleCatalog.mjs').TourCatalogRow[]} rows
 */
function addCatalogSheet(wb, sheetName, rows) {
  const ws = wb.addWorksheet(sheetName);
  ws.columns = [
    { width: 14 },
    { width: 48 },
    { width: 12 },
    { width: 16 },
    { width: 52 },
  ];

  styleHeaderRow(ws.addRow([...CATALOG_HEADERS]), 'FF2D6A4F');

  const firstDataRow = 2;
  const lastDataRow = firstDataRow + rows.length - 1;

  for (const row of rows) {
    const excelRow = ws.addRow([row.id, row.title, row.priceRub, row.durationType, null]);
    excelRow.getCell(3).numFmt = '# ##0 ₽';
    addListValidation(
      excelRow.getCell(4),
      [DURATION_LIST],
      'Тип тура',
      'Выберите: однодневный или многодневный'
    );
  }

  for (let r = firstDataRow; r <= lastDataRow; r++) {
    ws.getCell(`E${r}`).value = { formula: catalogPickFormula(r) };
  }

  return lastDataRow;
}

function addDatePickerValidation(ws, col, fromRow, toRow, season) {
  const pickerRange = getSeasonDatePickerRange(season);
  if (!pickerRange) return;

  const prompt = getSeasonDateInputPrompt(season);
  const error = getSeasonDateErrorMessage(season);

  ws.dataValidations.add(`${col}${fromRow}:${col}${toRow}`, {
    type: 'date',
    operator: 'between',
    allowBlank: true,
    formulae: [pickerRange.min, pickerRange.max],
    showInputMessage: true,
    promptTitle: 'Дата выезда',
    prompt,
    showErrorMessage: true,
    errorTitle: 'Дата вне сезона',
    error,
  });
}

/**
 * @param {import('exceljs').Workbook} wb
 * @param {string} sheetName
 * @param {string} season
 */
function addDatesSheet(wb, sheetName, season) {
  const ws = wb.addWorksheet(sheetName);
  ws.columns = [{ width: 16 }, { width: 14 }, { width: 14 }, { width: 8 }];
  styleHeaderRow(ws.addRow([...DATES_HEADERS]), 'FF4A5568');

  const monthGroups = buildSeasonDatesByMonth(season);
  for (const group of monthGroups) {
    let isFirstInMonth = true;
    for (const date of group.days) {
      const row = ws.addRow([isFirstInMonth ? group.label : null, date, null, null]);
      const rowNum = row.number;
      row.getCell(2).numFmt = 'dd.mm.yyyy';
      row.getCell(3).value = { formula: `TEXT(B${rowNum},"dd.mm.yyyy")` };
      row.getCell(4).value = {
        formula: `IF(B${rowNum}="","",CHOOSE(WEEKDAY(B${rowNum},2),"пн","вт","ср","чт","пт","сб","вс"))`,
      };
      if (isFirstInMonth) {
        row.getCell(1).font = { bold: true };
        isFirstInMonth = false;
      }
    }
  }

  return ws;
}

function addScheduleSheet(wb, scheduleSheetName, catalogSheetName, catalogLastRow, season) {
  const ws = wb.addWorksheet(scheduleSheetName);
  ws.views = [{ state: 'frozen', ySplit: 1, activeCell: 'A2' }];

  ws.columns = [
    { width: 12 },
    { width: 10 },
    { width: 48 },
    { width: 14 },
    { width: 16 },
    { width: 12 },
    { width: 8 },
    { width: 14 },
    { width: 32 },
  ];

  styleHeaderRow(ws.addRow([...SCHEDULE_HEADERS]), 'FF1A3C2E');

  const catalogRange = sheetRange(catalogSheetName, `$A$2:$D$${catalogLastRow}`);
  const pickRange = sheetRange(catalogSheetName, `$E$2:$E$${catalogLastRow}`);
  const lastScheduleRow = SCHEDULE_ROW_COUNT + 1;

  for (let i = 0; i < SCHEDULE_ROW_COUNT; i++) {
    ws.addRow([]);
  }

  for (let r = 2; r <= lastScheduleRow; r++) {
    ws.getCell(`B${r}`).value = { formula: WEEKDAY_FORMULA(r) };
    ws.getCell(`D${r}`).value = { formula: scheduleTourIdFormula(r) };
    ws.getCell(`E${r}`).value = {
      formula: `IF(D${r}="","",IFERROR(VLOOKUP(D${r},${catalogRange},4,FALSE),""))`,
    };
    ws.getCell(`F${r}`).value = {
      formula: `IF(D${r}="","",IFERROR(VLOOKUP(D${r},${catalogRange},3,FALSE),""))`,
    };
    ws.getCell(`A${r}`).numFmt = 'dd.mm.yyyy';
    ws.getCell(`F${r}`).numFmt = '# ##0 ₽';
  }

  addDatePickerValidation(ws, 'A', 2, lastScheduleRow, season);
  addColumnListValidation(
    ws,
    'C',
    2,
    lastScheduleRow,
    [pickRange],
    'Тур',
    'Выберите тур из каталога этого сезона'
  );
  addColumnListValidation(
    ws,
    'H',
    2,
    lastScheduleRow,
    [STATUS_LIST],
    'Статус',
    'запланирован / набор открыт / мест нет / отменён'
  );

  return ws;
}

async function main() {
  const allTours = loadTourCatalog();
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Вкрайности';

  /** @type {Record<string, { catalogLastRow: number }>} */
  const meta = {};

  for (const season of SEASONS) {
    const rows = allTours.filter((t) => t.season === season);
    const catalogLastRow = addCatalogSheet(wb, CATALOG_SHEETS[season], rows);
    addDatesSheet(wb, DATES_SHEETS[season], season);
    meta[season] = { catalogLastRow };
  }

  for (const season of SEASONS) {
    addScheduleSheet(
      wb,
      SCHEDULE_SHEETS[season],
      CATALOG_SHEETS[season],
      meta[season].catalogLastRow,
      season
    );
  }

  await wb.xlsx.writeFile(outPath);

  console.log(`Wrote ${outPath}`, { tours: allTours.length, scheduleRows: SCHEDULE_ROW_COUNT });
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
