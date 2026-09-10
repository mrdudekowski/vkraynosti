import { writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ExcelJS from 'exceljs';
import {
  CATALOG_SHEETS,
  SCHEDULE_SHEETS,
  STATUS_TO_EXPORT_CODE,
} from '../lib/scheduleSheetLabels.mjs';

export const GARBAGE_PRICE_RUB = [23, 91, 71, 81] as const;
export const DEFAULT_XLSX_FILE_NAME = 'Шаблон для календаря (3).xlsx';

export type DryRunDepartureStatus = (typeof STATUS_TO_EXPORT_CODE)[keyof typeof STATUS_TO_EXPORT_CODE];

export type DryRunTour = {
  id: string;
  title: string;
  season: string;
  priceRub: number | null;
};

export type XlsxDryRunReport = {
  sourcePath: string;
  tours: DryRunTour[];
  priceConflicts: Array<{ tourId: string; prices: number[]; chosen: number }>;
  garbagePrices: Array<{ tourId: string; raw: number }>;
  nearTitlePairs: Array<{
    left: { id: string; title: string };
    right: { id: string; title: string };
  }>;
  departures: Array<{
    tourId: string;
    startsOn: string;
    seats: number | null;
    status: DryRunDepartureStatus;
  }>;
  excludedDuplicates: Array<{ tourId: string; startsOn: string; reason: string }>;
};

const GARBAGE_PRICE_SET = new Set<number>(GARBAGE_PRICE_RUB);
const SEASON_BY_CATALOG_SHEET = new Map(
  Object.entries(CATALOG_SHEETS).map(([season, sheetName]) => [sheetName, season]),
);

export function assertDryRunOnly(argv: string[]): void {
  if (argv.includes('--apply')) {
    throw new Error('apply_forbidden');
  }
}

export function defaultXlsxPath(env: Record<string, string | undefined> = process.env): string {
  const fromEnv = env.CMS_XLSX_PATH?.trim();
  if (fromEnv != null && fromEnv.length > 0) {
    return fromEnv;
  }
  return path.join(env.USERPROFILE ?? env.HOME ?? '', 'Downloads', DEFAULT_XLSX_FILE_NAME);
}

function cellText(cell: ExcelJS.Cell): string {
  const value = cell.value;
  if (value == null || value === '') {
    return '';
  }
  if (typeof value === 'object') {
    if ('formula' in value) {
      const result = 'result' in value ? value.result : undefined;
      return result == null ? '' : String(result).trim();
    }
    if (value instanceof Date) {
      return value.toISOString().slice(0, 10);
    }
    if ('text' in value && value.text != null) {
      return String(value.text).trim();
    }
    if ('richText' in value && Array.isArray(value.richText)) {
      return value.richText.map((part) => part.text).join('').trim();
    }
  }
  return String(value).trim();
}

function cellDateIso(cell: ExcelJS.Cell): string | null {
  const value = cell.value;
  if (value == null || value === '') {
    return null;
  }
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  if (typeof value === 'number') {
    const epoch = Date.UTC(1899, 11, 30);
    const dt = new Date(epoch + value * 86400000);
    return dt.toISOString().slice(0, 10);
  }
  const text = cellText(cell);
  const dotted = text.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (dotted != null) {
    return `${dotted[3]}-${dotted[2]}-${dotted[1]}`;
  }
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
}

function numericCell(cell: ExcelJS.Cell): number | null {
  const value = cell.value;
  if (value == null || value === '') {
    return null;
  }
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'object' && 'result' in value && typeof value.result === 'number') {
    return value.result;
  }
  const parsed = Number.parseInt(String(value).replace(/\s/g, ''), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replaceAll('ё', 'е')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function levenshtein(left: string, right: string): number {
  const rows = left.length + 1;
  const cols = right.length + 1;
  const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0));
  for (let i = 0; i < rows; i += 1) {
    grid[i]![0] = i;
  }
  for (let j = 0; j < cols; j += 1) {
    grid[0]![j] = j;
  }
  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      grid[i]![j] = Math.min(
        (grid[i - 1]?.[j] ?? 0) + 1,
        (grid[i]?.[j - 1] ?? 0) + 1,
        (grid[i - 1]?.[j - 1] ?? 0) + cost,
      );
    }
  }
  return grid[left.length]?.[right.length] ?? 0;
}

function titlesAreNear(left: string, right: string): boolean {
  if (left === right) {
    return true;
  }
  const shorter = left.length <= right.length ? left : right;
  const longer = left.length > right.length ? left : right;
  if (longer.includes(shorter) && shorter.length >= 5) {
    return true;
  }
  return levenshtein(left, right) <= 2;
}

type CatalogAccumulator = {
  id: string;
  title: string;
  season: string;
  numericPrices: number[];
};

function collectCatalog(workbook: ExcelJS.Workbook): {
  tours: CatalogAccumulator[];
  garbagePrices: XlsxDryRunReport['garbagePrices'];
} {
  const byId = new Map<string, CatalogAccumulator>();
  const garbagePrices: XlsxDryRunReport['garbagePrices'] = [];

  for (const sheetName of Object.values(CATALOG_SHEETS)) {
    const sheet = workbook.getWorksheet(sheetName);
    if (sheet == null) {
      continue;
    }
    const season = SEASON_BY_CATALOG_SHEET.get(sheetName) ?? 'winter';
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        return;
      }
      const id = cellText(row.getCell(1));
      const title = cellText(row.getCell(2));
      if (id.length === 0) {
        return;
      }
      const rawPrice = numericCell(row.getCell(3));
      const current = byId.get(id) ?? { id, title, season, numericPrices: [] };
      if (current.title.length === 0 && title.length > 0) {
        current.title = title;
      }
      if (rawPrice != null && GARBAGE_PRICE_SET.has(rawPrice)) {
        garbagePrices.push({ tourId: id, raw: rawPrice });
      } else if (rawPrice != null) {
        current.numericPrices.push(rawPrice);
      }
      byId.set(id, current);
    });
  }

  return { tours: [...byId.values()], garbagePrices };
}

function nearTitlePairs(tours: CatalogAccumulator[]): XlsxDryRunReport['nearTitlePairs'] {
  const pairs: XlsxDryRunReport['nearTitlePairs'] = [];
  for (let i = 0; i < tours.length; i += 1) {
    for (let j = i + 1; j < tours.length; j += 1) {
      const left = tours[i];
      const right = tours[j];
      if (left == null || right == null) {
        continue;
      }
      if (!titlesAreNear(normalizeTitle(left.title), normalizeTitle(right.title))) {
        continue;
      }
      const ordered = left.id < right.id ? [left, right] : [right, left];
      pairs.push({
        left: { id: ordered[0]!.id, title: ordered[0]!.title },
        right: { id: ordered[1]!.id, title: ordered[1]!.title },
      });
    }
  }
  return pairs;
}

function scheduleStatus(raw: string): DryRunDepartureStatus | undefined {
  if (raw in STATUS_TO_EXPORT_CODE) {
    return STATUS_TO_EXPORT_CODE[raw as keyof typeof STATUS_TO_EXPORT_CODE];
  }
  return undefined;
}

function collectDepartures(workbook: ExcelJS.Workbook): {
  departures: XlsxDryRunReport['departures'];
  excludedDuplicates: XlsxDryRunReport['excludedDuplicates'];
} {
  const departures: XlsxDryRunReport['departures'] = [];
  const excludedDuplicates: XlsxDryRunReport['excludedDuplicates'] = [];
  const seen = new Set<string>();

  for (const sheetName of Object.values(SCHEDULE_SHEETS)) {
    const sheet = workbook.getWorksheet(sheetName);
    if (sheet == null) {
      continue;
    }
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        return;
      }
      const startsOn = cellDateIso(row.getCell(1));
      const tourId = cellText(row.getCell(4));
      const statusRu = cellText(row.getCell(8));
      const status = scheduleStatus(statusRu);
      if (startsOn == null || tourId.length === 0 || status == null) {
        return;
      }
      const key = `${tourId}|${startsOn}`;
      const item = {
        tourId,
        startsOn,
        seats: numericCell(row.getCell(7)),
        status,
      };
      if (seen.has(key)) {
        excludedDuplicates.push({ tourId, startsOn, reason: 'duplicate_tour_date' });
        return;
      }
      seen.add(key);
      departures.push(item);
    });
  }

  return { departures, excludedDuplicates };
}

export function reportFromWorkbook(workbook: ExcelJS.Workbook, sourcePath: string): XlsxDryRunReport {
  const { tours: catalog, garbagePrices } = collectCatalog(workbook);
  const priceConflicts: XlsxDryRunReport['priceConflicts'] = [];
  const tours: DryRunTour[] = catalog
    .map((item) => {
      const uniquePrices = [...new Set(item.numericPrices)].sort((a, b) => a - b);
      if (uniquePrices.length > 1) {
        const chosen = uniquePrices[uniquePrices.length - 1] ?? 0;
        priceConflicts.push({ tourId: item.id, prices: uniquePrices, chosen });
        return { id: item.id, title: item.title, season: item.season, priceRub: chosen };
      }
      return {
        id: item.id,
        title: item.title,
        season: item.season,
        priceRub: uniquePrices[0] ?? null,
      };
    })
    .sort((left, right) => left.id.localeCompare(right.id));

  const { departures, excludedDuplicates } = collectDepartures(workbook);
  return {
    sourcePath,
    tours,
    priceConflicts,
    garbagePrices,
    nearTitlePairs: nearTitlePairs(catalog),
    departures,
    excludedDuplicates,
  };
}

export async function reportFromXlsxBuffer(
  buffer: Buffer,
  sourcePath: string,
): Promise<XlsxDryRunReport> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  return reportFromWorkbook(workbook, sourcePath);
}

export async function reportFromXlsxFile(filePath: string): Promise<XlsxDryRunReport> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  return reportFromWorkbook(workbook, filePath);
}

export async function runXlsxDryRun(input: {
  argv: string[];
  env?: Record<string, string | undefined>;
}): Promise<XlsxDryRunReport> {
  assertDryRunOnly(input.argv);
  const env = input.env ?? process.env;
  const sourcePath = defaultXlsxPath(env);
  const report = await reportFromXlsxFile(sourcePath);
  const reportPath =
    env.CMS_XLSX_REPORT?.trim() || path.join(os.tmpdir(), 'vkrainosti-xlsx-dry-run.json');
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  return report;
}

const invokedDirectly =
  process.argv[1] != null && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  void runXlsxDryRun({ argv: process.argv, env: process.env })
    .then((report) => {
      console.log(JSON.stringify({ ok: true, tours: report.tours.length, sourcePath: report.sourcePath }));
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : 'xlsx_dry_run_failed';
      console.error(message);
      process.exitCode = message === 'apply_forbidden' ? 2 : 1;
    });
}
