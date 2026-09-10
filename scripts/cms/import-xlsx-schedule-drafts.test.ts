/** @vitest-environment node */
import ExcelJS from 'exceljs';
import { describe, expect, it } from 'vitest';
import { SCHEDULE_HEADERS, SCHEDULE_SHEETS } from '../lib/scheduleSheetLabels.mjs';
import {
  collectSeasonScheduleDrafts,
  DEFAULT_SCHEDULE_DRAFT_FROM,
  DEFAULT_SCHEDULE_DRAFT_SEASONS,
} from './import-xlsx-schedule-drafts.ts';

async function fixtureWorkbook(build: (wb: ExcelJS.Workbook) => void): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  build(workbook);
  const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
  const loaded = new ExcelJS.Workbook();
  await loaded.xlsx.load(buffer);
  return loaded;
}

function addSchedule(
  workbook: ExcelJS.Workbook,
  sheetName: string,
  rows: Array<[Date | string, string, string, string, string, number | string, number | null, string]>,
) {
  const sheet = workbook.addWorksheet(sheetName);
  sheet.addRow([...SCHEDULE_HEADERS]);
  for (const row of rows) {
    sheet.addRow(row);
  }
}

describe('collectSeasonScheduleDrafts', () => {
  it('берёт лето и осень с даты отсечения и отбрасывает дубль тура в один день', async () => {
    const workbook = await fixtureWorkbook((wb) => {
      addSchedule(wb, SCHEDULE_SHEETS.winter, [
        [new Date(Date.UTC(2026, 7, 20)), 'чт', 'Зима', 'winter-1', 'однодневный', 6000, 8, 'набор открыт'],
      ]);
      addSchedule(wb, SCHEDULE_SHEETS.summer, [
        [new Date(Date.UTC(2026, 7, 10)), 'пн', 'Краббе', 'summer-8', 'однодневный', 7500, 8, 'запланирован'],
        [new Date(Date.UTC(2026, 7, 22)), 'сб', 'Краббе', 'summer-8', 'однодневный', 7500, null, 'запланирован'],
        [new Date(Date.UTC(2026, 7, 22)), 'сб', 'Краббе', 'summer-8', 'однодневный', 7500, 8, 'набор открыт'],
        [new Date(Date.UTC(2026, 7, 23)), 'вс', 'Гамова', 'summer-5', 'однодневный', 7200, 8, 'набор открыт'],
      ]);
      addSchedule(wb, SCHEDULE_SHEETS.fall, [
        [new Date(Date.UTC(2026, 8, 5)), 'сб', 'Та-Чингоуза', 'fall-14', 'многодневный', 16500, 8, 'набор открыт'],
        [new Date(Date.UTC(2026, 8, 12)), 'сб', '', '', '', '', null, ''],
      ]);
    });

    const result = collectSeasonScheduleDrafts(workbook, {
      fromIso: DEFAULT_SCHEDULE_DRAFT_FROM,
      seasons: DEFAULT_SCHEDULE_DRAFT_SEASONS,
    });

    expect(result.drafts.map((row) => `${row.tourId}|${row.startsOn}|${row.status}|${row.seats}`)).toEqual([
      'summer-8|2026-08-22|planned|8',
      'summer-5|2026-08-23|open|8',
      'fall-14|2026-09-05|open|8',
    ]);
    expect(result.duplicates).toEqual([
      expect.objectContaining({ tourId: 'summer-8', startsOn: '2026-08-22' }),
    ]);
    expect(result.skippedIncomplete).toEqual([]);
  });

  it('берёт ID из result общей формулы колонки D и из подписи колонки C', async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(SCHEDULE_SHEETS.summer);
    sheet.addRow([...SCHEDULE_HEADERS]);
    sheet.addRow([new Date(Date.UTC(2026, 7, 22)), 'сб', 'Краббе | summer-8', '', 'однодневный', 7500, 8, 'запланирован']);
    sheet.getCell('D2').value = { result: 'summer-8', sharedFormula: 'D2' };

    const result = collectSeasonScheduleDrafts(workbook, {
      fromIso: DEFAULT_SCHEDULE_DRAFT_FROM,
      seasons: DEFAULT_SCHEDULE_DRAFT_SEASONS,
    });

    expect(result.drafts).toEqual([
      expect.objectContaining({ tourId: 'summer-8', startsOn: '2026-08-22', status: 'planned' }),
    ]);
  });
});
