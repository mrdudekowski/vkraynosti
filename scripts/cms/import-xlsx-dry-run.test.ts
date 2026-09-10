/** @vitest-environment node */
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import ExcelJS from 'exceljs';
import { describe, expect, it } from 'vitest';
import {
  CATALOG_HEADERS,
  CATALOG_SHEETS,
  SCHEDULE_HEADERS,
  SCHEDULE_SHEETS,
} from '../lib/scheduleSheetLabels.mjs';
import {
  assertDryRunOnly,
  defaultXlsxPath,
  reportFromXlsxBuffer,
} from './import-xlsx-dry-run.ts';

async function fixtureBuffer(build: (wb: ExcelJS.Workbook) => void): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  build(wb);
  const raw = await wb.xlsx.writeBuffer();
  return Buffer.from(raw);
}

function addCatalogSheet(
  wb: ExcelJS.Workbook,
  sheetName: string,
  rows: Array<[string, string, number | string, string]>,
) {
  const sheet = wb.addWorksheet(sheetName);
  sheet.addRow([...CATALOG_HEADERS]);
  for (const row of rows) {
    sheet.addRow(row);
  }
}

function addScheduleSheet(
  wb: ExcelJS.Workbook,
  sheetName: string,
  rows: Array<[Date | string, string, string, string, string, number | string, number, string]>,
) {
  const sheet = wb.addWorksheet(sheetName);
  sheet.addRow([...SCHEDULE_HEADERS]);
  for (const row of rows) {
    sheet.addRow(row);
  }
}

describe('xlsx dry-run', () => {
  it('rejects --apply and reads CMS_XLSX_PATH or the Downloads template', () => {
    expect(() => assertDryRunOnly(['--apply'])).toThrow('apply_forbidden');
    expect(defaultXlsxPath({ CMS_XLSX_PATH: 'D:\\file.xlsx' })).toBe('D:\\file.xlsx');
    expect(defaultXlsxPath({ USERPROFILE: 'C:\\Users\\HP' })).toBe(
      path.join('C:\\Users\\HP', 'Downloads', 'Шаблон для календаря (3).xlsx'),
    );
  });

  it('builds a report without merging near titles, taking max price and mapping garbage to on-request', async () => {
    const buffer = await fixtureBuffer((wb) => {
      addCatalogSheet(wb, CATALOG_SHEETS.winter, [
        ['winter-1', 'Изюбриная', 6000, 'однодневный'],
        ['winter-1b', 'Изюбринаяя', 91, 'однодневный'],
      ]);
      addCatalogSheet(wb, CATALOG_SHEETS.spring, [
        ['winter-1', 'Изюбриная', 8000, 'однодневный'],
      ]);
      addScheduleSheet(wb, SCHEDULE_SHEETS.winter, [
        ['2031-01-10', 'сб', 'Изюбриная', 'winter-1', 'однодневный', 8000, 8, 'запланирован'],
        ['2031-01-10', 'сб', 'Изюбриная', 'winter-1', 'однодневный', 8000, 8, 'набор открыт'],
        ['2031-01-11', 'вс', 'Изюбриная', 'winter-1', 'однодневный', 8000, 8, 'набор открыт'],
      ]);
    });

    const report = await reportFromXlsxBuffer(buffer, 'fixture.xlsx');

    expect(report.tours).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'winter-1', title: 'Изюбриная', priceRub: 8000 }),
        expect.objectContaining({ id: 'winter-1b', title: 'Изюбринаяя', priceRub: null }),
      ]),
    );
    expect(report.priceConflicts).toEqual([
      expect.objectContaining({ tourId: 'winter-1', prices: [6000, 8000], chosen: 8000 }),
    ]);
    expect(report.garbagePrices).toEqual([
      expect.objectContaining({ tourId: 'winter-1b', raw: 91 }),
    ]);
    expect(report.nearTitlePairs).toEqual([
      expect.objectContaining({
        left: expect.objectContaining({ id: 'winter-1', title: 'Изюбриная' }),
        right: expect.objectContaining({ id: 'winter-1b', title: 'Изюбринаяя' }),
      }),
    ]);
    expect(report.departures).toEqual([
      expect.objectContaining({
        tourId: 'winter-1',
        startsOn: '2031-01-10',
        status: 'planned',
      }),
      expect.objectContaining({
        tourId: 'winter-1',
        startsOn: '2031-01-11',
        status: 'open',
      }),
    ]);
    expect(report.excludedDuplicates).toEqual([
      expect.objectContaining({
        tourId: 'winter-1',
        startsOn: '2031-01-10',
        reason: 'duplicate_tour_date',
      }),
    ]);
  });

  it('reads an xlsx file and writes only the JSON report', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'xlsx-dry-run-'));
    const xlsxPath = path.join(dir, 'template.xlsx');
    const reportPath = path.join(dir, 'report.json');
    const buffer = await fixtureBuffer((wb) => {
      addCatalogSheet(wb, CATALOG_SHEETS.winter, [
        ['winter-1', 'Изюбриная', 6000, 'однодневный'],
      ]);
    });
    await writeFile(xlsxPath, buffer);
    const before = await readFile(xlsxPath);

    const { runXlsxDryRun } = await import('./import-xlsx-dry-run.ts');
    await runXlsxDryRun({
      argv: ['tsx', 'import-xlsx-dry-run.ts'],
      env: { CMS_XLSX_PATH: xlsxPath, CMS_XLSX_REPORT: reportPath },
    });

    expect(Buffer.from(await readFile(xlsxPath)).equals(before)).toBe(true);
    const written = JSON.parse(await readFile(reportPath, 'utf8')) as { tours: unknown[] };
    expect(written.tours).toHaveLength(1);
  });
});
