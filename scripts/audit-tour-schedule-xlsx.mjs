#!/usr/bin/env node
/**
 * Аудит xlsx-шаблона расписания против контракта сайта (fetchTourSchedule + toursData).
 * Usage: node scripts/audit-tour-schedule-xlsx.mjs [path-to.xlsx]
 */
import ExcelJS from 'exceljs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadTourCatalog } from './lib/tourScheduleCatalog.mjs';
import {
  CATALOG_SHEETS,
  DATES_HEADERS,
  DATES_SHEETS,
  SCHEDULE_SHEETS,
  SCHEDULE_HEADERS,
  CATALOG_HEADERS,
  STATUS_TO_EXPORT_CODE,
} from './lib/scheduleSheetLabels.mjs';
import { extractTourIdFromPick } from './lib/tourPickFormula.mjs';
import {
  countSeasonCalendarDays,
  verifySeasonCalendarDaysByMonth,
} from './lib/seasonDates.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultPath = path.join(__dirname, '../content/Calendar/Шаблон для календаря.xlsx');
const filePath = process.argv[2] ? path.resolve(process.argv[2]) : defaultPath;

const catalog = loadTourCatalog();
const catalogIds = new Set(catalog.map(t => t.id));
const catalogById = new Map(catalog.map(t => [t.id, t]));

const issues = [];
const warnings = [];
const stats = { scheduleRows: 0, exportableRows: 0, bySeason: {} };

function cellText(cell) {
  const v = cell.value;
  if (v == null || v === '') return '';
  if (typeof v === 'object') {
    if (v.formula) return '';
    if (v.result != null) return String(v.result).trim();
    if (v instanceof Date) return v.toISOString().slice(0, 10);
    if (v.text) return String(v.text).trim();
    if (Array.isArray(v.richText)) return v.richText.map(r => r.text).join('').trim();
  }
  return String(v).trim();
}

function cellDateIso(cell) {
  const v = cell.value;
  if (v == null || v === '') return null;
  if (v instanceof Date) {
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, '0');
    const d = String(v.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (typeof v === 'number') {
    const epoch = new Date(Date.UTC(1899, 11, 30));
    const dt = new Date(epoch.getTime() + v * 86400000);
    const y = dt.getUTCFullYear();
    const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
    const d = String(dt.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const s = cellText(cell);
  const dot = s.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (dot) return `${dot[3]}-${dot[2]}-${dot[1]}`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return null;
}

function numericCell(cell) {
  const v = cell.value;
  if (v == null || v === '') return null;
  if (typeof v === 'number') return v;
  if (typeof v === 'object' && typeof v.result === 'number') return v.result;
  const parsed = Number.parseInt(String(v).replace(/\s/g, ''), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function resolveTourId(row) {
  const dText = cellText(row.getCell('D'));
  if (dText) return dText;
  const tourPick = cellText(row.getCell('C'));
  return extractTourIdFromPick(tourPick);
}

const wb = new ExcelJS.Workbook();
await wb.xlsx.readFile(filePath);

console.log('=== FILE ===', filePath);
console.log('Sheets:', wb.worksheets.map(ws => ws.name).join(' | '));

const allExpected = [
  ...Object.values(CATALOG_SHEETS),
  ...Object.values(DATES_SHEETS),
  ...Object.values(SCHEDULE_SHEETS),
];

for (const name of allExpected) {
  if (!wb.getWorksheet(name)) issues.push(`MISSING_SHEET:${name}`);
}
for (const ws of wb.worksheets) {
  if (!allExpected.includes(ws.name)) warnings.push(`UNEXPECTED_SHEET:${ws.name}`);
}

for (const [season, sheetName] of Object.entries(CATALOG_SHEETS)) {
  const ws = wb.getWorksheet(sheetName);
  if (!ws) continue;
  const headers = ws.getRow(1).values.slice(1);
  if (headers.join('|') !== CATALOG_HEADERS.join('|')) {
    issues.push(`CATALOG_HEADERS_${season}: ${JSON.stringify(headers)}`);
  }
  let rows = 0;
  ws.eachRow((row, n) => {
    if (n === 1) return;
    const id = cellText(row.getCell(1));
    if (!id) return;
    rows++;
    if (!catalogIds.has(id)) issues.push(`UNKNOWN_CATALOG_ID:${id}@${sheetName}`);
    const duration = cellText(row.getCell(4));
    if (duration && !['однодневный', 'многодневный'].includes(duration)) {
      issues.push(`BAD_DURATION_CATALOG:${id}=${duration}`);
    }
  });
  stats.bySeason[season] = { ...(stats.bySeason[season] ?? {}), catalogRows: rows };
}

for (const [season, sheetName] of Object.entries(DATES_SHEETS)) {
  const ws = wb.getWorksheet(sheetName);
  if (!ws) continue;

  const headers = ws.getRow(1).values.slice(1);
  if (headers.join('|') !== DATES_HEADERS.join('|')) {
    issues.push(`DATES_HEADERS_${season}: ${JSON.stringify(headers)}`);
  }

  let dateRows = 0;
  ws.eachRow((row, n) => {
    if (n === 1) return;
    if (cellDateIso(row.getCell('B'))) dateRows++;
  });

  const expected = countSeasonCalendarDays(season);
  if (dateRows !== expected) {
    issues.push(
      `DATES_INCOMPLETE_${season}: ${sheetName} has ${dateRows} dates, expected ${expected} (all days in season months)`
    );
  }

  const monthChecks = verifySeasonCalendarDaysByMonth(season);
  for (const check of monthChecks) {
    if (!check.ok) {
      issues.push(
        `DATES_MONTH_${season}:${check.label} expected ${check.expected} days, check failed`
      );
    }
  }

  stats.bySeason[season] = {
    ...(stats.bySeason[season] ?? {}),
    datesRows: dateRows,
    datesExpected: expected,
  };
}

const exported = [];

for (const [season, sheetName] of Object.entries(SCHEDULE_SHEETS)) {
  const ws = wb.getWorksheet(sheetName);
  if (!ws) continue;
  const headers = ws.getRow(1).values.slice(1);
  if (headers.join('|') !== SCHEDULE_HEADERS.join('|')) {
    issues.push(`SCHEDULE_HEADERS_${season}: ${JSON.stringify(headers)}`);
  }

  let filled = 0;
  ws.eachRow((row, n) => {
    if (n === 1) return;
    stats.scheduleRows++;

    const dateIso = cellDateIso(row.getCell('A'));
    const tourPick = cellText(row.getCell('C'));
    const tourId = resolveTourId(row);
    const durationType = cellText(row.getCell('E'));
    const priceRub = numericCell(row.getCell('F'));
    const seats = numericCell(row.getCell('G'));
    const statusRu = cellText(row.getCell('H'));
    const comment = cellText(row.getCell('I')) || null;

    if (!dateIso && !tourId && !tourPick && !statusRu) return;
    filled++;

    if (!dateIso) {
      issues.push(`${season} row ${n}: invalid date A=${JSON.stringify(row.getCell('A').value)}`);
    }
    if (!tourId) {
      issues.push(`${season} row ${n}: missing tourId (C=${tourPick}, D=${cellText(row.getCell('D'))})`);
    } else if (!catalogIds.has(tourId)) {
      issues.push(`${season} row ${n}: unknown tourId ${tourId}`);
    }

    if (durationType && !['однодневный', 'многодневный'].includes(durationType)) {
      issues.push(`${season} row ${n}: bad durationType ${durationType}`);
    }

    if (statusRu && !STATUS_TO_EXPORT_CODE[statusRu]) {
      issues.push(`${season} row ${n}: bad status "${statusRu}"`);
    }

    const dVal = row.getCell('D').value;
    if (dVal && typeof dVal === 'object' && dVal.formula && !tourPick && !cellText(row.getCell('D'))) {
      warnings.push(`${season} row ${n}: tourId formula but C empty — needs recalc in Excel/Sheets`);
    }

    if (dateIso && tourId && catalogIds.has(tourId) && statusRu && STATUS_TO_EXPORT_CODE[statusRu]) {
      const cat = catalogById.get(tourId);
      exported.push({
        date: dateIso,
        tourId,
        durationType: durationType || cat?.durationType || 'однодневный',
        priceRub: priceRub ?? cat?.priceRub ?? null,
        seats: seats ?? null,
        status: STATUS_TO_EXPORT_CODE[statusRu],
        comment,
        _sheet: sheetName,
        _row: n,
      });
      stats.exportableRows++;
    }
  });

  stats.bySeason[season] = {
    ...(stats.bySeason[season] ?? {}),
    scheduleFilled: filled,
    exportable: exported.filter(e => e._sheet === sheetName).length,
  };
}

for (const ev of exported) {
  const cat = catalogById.get(ev.tourId);
  if (!cat) continue;
  const sheetSeason = Object.entries(SCHEDULE_SHEETS).find(([, n]) => n === ev._sheet)?.[0];
  if (sheetSeason && cat.season !== sheetSeason) {
    warnings.push(`SEASON_MISMATCH: ${ev.tourId} is ${cat.season} but on ${ev._sheet}`);
  }
}

// Zod-like validation
const isoRe = /^\d{4}-\d{2}-\d{2}$/;
const statusCodes = new Set(['planned', 'open', 'full', 'cancelled']);
for (const ev of exported) {
  if (!isoRe.test(ev.date)) issues.push(`ZOD_DATE:${ev.tourId}@${ev.date}`);
  if (!statusCodes.has(ev.status)) issues.push(`ZOD_STATUS:${ev.tourId}`);
  if (!['однодневный', 'многодневный'].includes(ev.durationType)) {
    issues.push(`ZOD_DURATION:${ev.tourId}`);
  }
}

console.log('\n=== STATS ===');
console.log(JSON.stringify(stats, null, 2));
console.log('\n=== EXPORTABLE EVENTS (sample) ===');
console.log(exported.slice(0, 8).map(({ _sheet, _row, ...e }) => e));
console.log(`\nTotal exportable: ${exported.length}`);

console.log(`\n=== ISSUES (${issues.length}) ===`);
issues.forEach(i => console.log(' !', i));

console.log(`\n=== WARNINGS (${warnings.length}) ===`);
warnings.forEach(w => console.log(' ?', w));

process.exitCode = issues.length > 0 ? 1 : 0;
