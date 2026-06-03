#!/usr/bin/env node
/**
 * Колонка F «Статус на сайте» на листах Туры_* + начальное заполнение.
 * Usage: node scripts/patch-catalog-publication-status-column.mjs [path-to.xlsx ...]
 */
import ExcelJS from 'exceljs';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CATALOG_HEADERS,
  CATALOG_MAX_DATA_ROW,
  CATALOG_PUBLICATION_STATUS_LIST,
  CATALOG_PUBLICATION_STATUS_VALUES,
  CATALOG_SHEETS,
  PUBLICATION_STATUS_TO_EXPORT_CODE,
} from './lib/scheduleSheetLabels.mjs';
import { loadSiteTourIds, parseDurationType } from './lib/tourScheduleCatalog.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

const IN_DEVELOPMENT_IDS = new Set([
  'summer-13',
  'summer-14',
  'summer-15',
  'summer-16',
  'summer-17',
  'summer-19',
]);

const SITE_TOUR_IDS = new Set(loadSiteTourIds());

/** @returns {Map<string, { title: string, durationType: string }>} */
function readSummerStubRowsById() {
  const source = readFileSync(path.join(rootDir, 'src/data/toursData.ts'), 'utf8');
  /** @type {Map<string, { title: string, durationType: string }>} */
  const byId = new Map();
  for (const match of source.matchAll(
    /createSummerTourStub\(\{\s*\n\s*id:\s*'([^']+)',\s*\n\s*title:\s*'((?:\\'|[^'])*)',[\s\S]*?duration:\s*'([^']+)'/g,
  )) {
    byId.set(match[1], {
      title: match[2].replace(/\\'/g, "'"),
      durationType: parseDurationType(match[3]),
    });
  }
  return byId;
}

/** @param {string} tourId */
function resolvePublicationStatusRu(tourId) {
  if (IN_DEVELOPMENT_IDS.has(tourId)) return 'в разработке';
  if (SITE_TOUR_IDS.has(tourId)) return 'активен';
  return 'скрыт';
}

function cellText(cell) {
  const value = cell.value;
  if (value == null || value === '') return '';
  if (typeof value === 'object' && value.result != null) return String(value.result).trim();
  return String(value).trim();
}

function addPublicationStatusValidation(ws, fromRow, toRow) {
  ws.dataValidations.add(`F${fromRow}:F${toRow}`, {
    type: 'list',
    allowBlank: true,
    formulae: [CATALOG_PUBLICATION_STATUS_LIST],
    showErrorMessage: true,
    errorTitle: 'Статус на сайте',
    error: CATALOG_PUBLICATION_STATUS_VALUES.join(' / '),
  });
}

/**
 * @param {import('exceljs').Worksheet} ws
 * @param {Map<string, { title: string, durationType: string }>} summerStubs
 */
function ensureSummerStubRows(ws, summerStubs) {
  const existingIds = new Set();
  for (let row = 2; row <= CATALOG_MAX_DATA_ROW; row++) {
    const id = cellText(ws.getRow(row).getCell(1));
    if (id) existingIds.add(id);
  }

  for (const [id, stub] of summerStubs) {
    if (existingIds.has(id)) continue;
    for (let row = 2; row <= CATALOG_MAX_DATA_ROW; row++) {
      const excelRow = ws.getRow(row);
      if (cellText(excelRow.getCell(1))) continue;
      excelRow.getCell(1).value = id;
      excelRow.getCell(2).value = stub.title;
      excelRow.getCell(3).value = null;
      excelRow.getCell(4).value = stub.durationType;
      existingIds.add(id);
      break;
    }
  }
}

/**
 * @param {import('exceljs').Workbook} wb
 */
function patchWorkbook(wb) {
  const summerStubs = readSummerStubRowsById();
  const expectedHeader = CATALOG_HEADERS[5];

  for (const sheetName of Object.values(CATALOG_SHEETS)) {
    const ws = wb.getWorksheet(sheetName);
    if (!ws) {
      console.warn(`Skip missing sheet: ${sheetName}`);
      continue;
    }

    ws.getColumn(6).width = 18;
    ws.getCell('F1').value = expectedHeader;
    ws.getCell('F1').font = { bold: true, color: { argb: 'FFFFFFFF' } };
    ws.getCell('F1').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2D6A4F' },
    };

    if (sheetName === CATALOG_SHEETS.summer) {
      ensureSummerStubRows(ws, summerStubs);
    }

    for (let row = 2; row <= CATALOG_MAX_DATA_ROW; row++) {
      const excelRow = ws.getRow(row);
      const tourId = cellText(excelRow.getCell(1));
      if (!tourId) {
        excelRow.getCell(6).value = null;
        continue;
      }
      excelRow.getCell(6).value = resolvePublicationStatusRu(tourId);
    }

    addPublicationStatusValidation(ws, 2, CATALOG_MAX_DATA_ROW);
  }
}

/**
 * @param {string} filePath
 */
async function patchFile(filePath) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(filePath);
  patchWorkbook(wb);
  await wb.xlsx.writeFile(filePath);
  console.log(`Patched ${filePath}`);
}

const defaultTargets = [
  path.join(rootDir, 'content/Calendar/vkraynosti-tour-schedule-template.xlsx'),
  path.join(rootDir, 'content/Calendar/Шаблон для календаря.xlsx'),
  path.join(process.env.USERPROFILE ?? '', 'Downloads/Шаблон для календаря (3).xlsx'),
];

const targets = process.argv.length > 2 ? process.argv.slice(2).map((p) => path.resolve(p)) : defaultTargets;

for (const target of targets) {
  try {
    await patchFile(target);
  } catch (err) {
    console.error(`Failed ${target}:`, err instanceof Error ? err.message : err);
    process.exitCode = 1;
  }
}

// Sanity: export codes match SSOT
for (const value of CATALOG_PUBLICATION_STATUS_VALUES) {
  if (!PUBLICATION_STATUS_TO_EXPORT_CODE[value]) {
    throw new Error(`Missing export code for ${value}`);
  }
}
