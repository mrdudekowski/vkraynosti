import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ne } from 'drizzle-orm';
import ExcelJS from 'exceljs';
import { SCHEDULE_SHEETS, STATUS_TO_EXPORT_CODE } from '../lib/scheduleSheetLabels.mjs';
import { extractTourIdFromPick } from '../lib/tourPickFormula.mjs';
import { loadDraftOrPublished } from './api/app.ts';
import { createAuthRepository } from './api/auth/authRepository.ts';
import { createDatabase } from './api/db/client.ts';
import type { DepartureStatus } from './api/db/schema.ts';
import { tourDepartures } from './api/db/schema.ts';
import { loadCmsApiEnv, readDotEnvFile } from './api/env.ts';
import { createCmsJsonStore } from './api/store.ts';

export const DEFAULT_SCHEDULE_DRAFT_FROM = '2026-08-19';
export const DEFAULT_SCHEDULE_DRAFT_SEASONS = ['summer', 'fall'] as const;
export const DEFAULT_DEPARTURE_SEATS = 8;

export type ScheduleDraftSeason = (typeof DEFAULT_SCHEDULE_DRAFT_SEASONS)[number];

export type ScheduleDraftRow = {
  season: ScheduleDraftSeason;
  tourId: string;
  startsOn: string;
  seats: number;
  status: Exclude<DepartureStatus, 'completed'>;
};

export type CollectSeasonScheduleDraftsResult = {
  drafts: ScheduleDraftRow[];
  duplicates: Array<{ season: ScheduleDraftSeason; tourId: string; startsOn: string }>;
  skippedIncomplete: Array<{
    season: ScheduleDraftSeason;
    startsOn: string | null;
    tourId: string;
    status: string;
  }>;
  skippedCompleted: Array<{ season: ScheduleDraftSeason; tourId: string; startsOn: string }>;
};

const SEASON_SHEETS: Record<ScheduleDraftSeason, string> = {
  summer: SCHEDULE_SHEETS.summer,
  fall: SCHEDULE_SHEETS.fall,
};

function scalarText(value: unknown): string {
  if (value == null || value === '') {
    return '';
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value).trim();
  }
  return '';
}

function cellText(cell: ExcelJS.Cell): string {
  const value = cell.value;
  if (value == null || value === '') {
    return '';
  }
  if (typeof value === 'object') {
    if (value instanceof Date) {
      return xlsxCalendarDateIso(value);
    }
    if ('result' in value) {
      return scalarText(value.result);
    }
    if ('text' in value && value.text != null) {
      return String(value.text).trim();
    }
    if ('richText' in value && Array.isArray(value.richText)) {
      return value.richText.map((part) => part.text).join('').trim();
    }
    return '';
  }
  return scalarText(value);
}

export function xlsxCalendarDateIso(value: Date): string {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
}

export function cellDateIso(cell: ExcelJS.Cell): string | null {
  const value = cell.value;
  if (value instanceof Date) {
    return xlsxCalendarDateIso(value);
  }
  if (typeof value === 'object' && value != null && 'result' in value && value.result instanceof Date) {
    return xlsxCalendarDateIso(value.result);
  }
  if (typeof value === 'number') {
    const epoch = Date.UTC(1899, 11, 30);
    return xlsxCalendarDateIso(new Date(epoch + value * 86400000));
  }
  const text = cellText(cell);
  const dotted = text.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (dotted != null) {
    return `${dotted[3]}-${dotted[2]}-${dotted[1]}`;
  }
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
}

function scheduleStatus(raw: string): DepartureStatus | undefined {
  if (raw in STATUS_TO_EXPORT_CODE) {
    return STATUS_TO_EXPORT_CODE[raw as keyof typeof STATUS_TO_EXPORT_CODE];
  }
  return undefined;
}

function isEditableStatus(status: DepartureStatus): status is Exclude<DepartureStatus, 'completed'> {
  return status !== 'completed';
}

function numericSeats(cell: ExcelJS.Cell): number | null {
  const value = cell.value;
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
    return value;
  }
  if (typeof value === 'object' && value != null && 'result' in value && typeof value.result === 'number') {
    return Number.isInteger(value.result) && value.result > 0 ? value.result : null;
  }
  const parsed = Number.parseInt(cellText(cell).replace(/\s/g, ''), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function collectSeasonScheduleDrafts(
  workbook: ExcelJS.Workbook,
  input: {
    fromIso: string;
    seasons: readonly ScheduleDraftSeason[];
  },
): CollectSeasonScheduleDraftsResult {
  const drafts: ScheduleDraftRow[] = [];
  const duplicates: CollectSeasonScheduleDraftsResult['duplicates'] = [];
  const skippedIncomplete: CollectSeasonScheduleDraftsResult['skippedIncomplete'] = [];
  const skippedCompleted: CollectSeasonScheduleDraftsResult['skippedCompleted'] = [];
  const seen = new Set<string>();

  for (const season of input.seasons) {
    const sheet = workbook.getWorksheet(SEASON_SHEETS[season]);
    if (sheet == null) {
      continue;
    }
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        return;
      }
      const startsOn = cellDateIso(row.getCell(1));
      const tourName = cellText(row.getCell(3));
      const tourId = cellText(row.getCell(4)) || extractTourIdFromPick(tourName);
      const statusRaw = cellText(row.getCell(8));
      const status = scheduleStatus(statusRaw);
      if (tourName.length === 0 && tourId.length === 0 && statusRaw.length === 0) {
        return;
      }
      if (startsOn == null || tourId.length === 0 || status == null) {
        skippedIncomplete.push({ season, startsOn, tourId, status: statusRaw });
        return;
      }
      if (startsOn < input.fromIso) {
        return;
      }
      if (!isEditableStatus(status)) {
        skippedCompleted.push({ season, tourId, startsOn });
        return;
      }
      const key = `${tourId}|${startsOn}`;
      if (seen.has(key)) {
        duplicates.push({ season, tourId, startsOn });
        return;
      }
      seen.add(key);
      drafts.push({
        season,
        tourId,
        startsOn,
        seats: numericSeats(row.getCell(7)) ?? DEFAULT_DEPARTURE_SEATS,
        status,
      });
    });
  }

  return { drafts, duplicates, skippedIncomplete, skippedCompleted };
}

export async function reportFromXlsxFile(
  filePath: string,
  fromIso = DEFAULT_SCHEDULE_DRAFT_FROM,
): Promise<CollectSeasonScheduleDraftsResult> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  return collectSeasonScheduleDrafts(workbook, {
    fromIso,
    seasons: DEFAULT_SCHEDULE_DRAFT_SEASONS,
  });
}

function assertLocalDatabaseUrl(url: string): void {
  const parsed = new URL(url);
  if (!['127.0.0.1', 'localhost'].includes(parsed.hostname)) {
    throw new Error('DATABASE_URL must point to a local database');
  }
}

export async function applyScheduleDrafts(input: {
  drafts: readonly ScheduleDraftRow[];
  databaseUrl: string;
  store: ReturnType<typeof createCmsJsonStore>;
  now?: Date;
}): Promise<{
  created: number;
  skippedExisting: Array<{ tourId: string; startsOn: string }>;
  unknownTours: string[];
  createdIds: string[];
}> {
  const database = createDatabase({ url: input.databaseUrl, ssl: false, maxConnections: 1 });
  try {
    const authRepository = createAuthRepository(database.db);
    const actor = (await authRepository.listUsers()).find((user) => user.role === 'admin' && user.isActive);
    if (actor == null) {
      throw new Error('no_active_admin');
    }
    const existing = await database.db
      .select()
      .from(tourDepartures)
      .where(ne(tourDepartures.status, 'cancelled'));
    const existingKeys = new Set(existing.map((row) => `${row.tourId}|${row.startsOn}`));
    const unknownTours = new Set<string>();
    const skippedExisting: Array<{ tourId: string; startsOn: string }> = [];
    const createdIds: string[] = [];
    const submittedAt = input.now ?? new Date();

    for (const draft of input.drafts) {
      const tour = await loadDraftOrPublished(input.store, draft.tourId);
      if (tour == null) {
        unknownTours.add(draft.tourId);
      }
      const key = `${draft.tourId}|${draft.startsOn}`;
      if (existingKeys.has(key)) {
        skippedExisting.push({ tourId: draft.tourId, startsOn: draft.startsOn });
        continue;
      }
      const [created] = await database.db
        .insert(tourDepartures)
        .values({
          tourId: draft.tourId,
          startsOn: draft.startsOn,
          seats: draft.seats,
          status: draft.status,
          createdBy: actor.id,
          updatedBy: actor.id,
          submittedForPublishAt: submittedAt,
        })
        .returning({ id: tourDepartures.id });
      if (created == null) {
        throw new Error('departure_insert_failed');
      }
      existingKeys.add(key);
      createdIds.push(created.id);
    }

    return {
      created: createdIds.length,
      skippedExisting,
      unknownTours: [...unknownTours].sort(),
      createdIds,
    };
  } finally {
    await database.close();
  }
}

async function main(): Promise<void> {
  const apply = process.argv.includes('--apply');
  const rootDir = process.cwd();
  const sourcePath =
    process.env.CMS_XLSX_PATH?.trim() ||
    path.join(process.env.USERPROFILE ?? process.env.HOME ?? '', 'Downloads', 'Шаблон для календаря (1).xlsx');
  const fromIso = process.env.CMS_SCHEDULE_FROM?.trim() || DEFAULT_SCHEDULE_DRAFT_FROM;
  const parsed = await reportFromXlsxFile(sourcePath, fromIso);
  const summary = {
    sourcePath,
    fromIso,
    drafts: parsed.drafts.length,
    duplicates: parsed.duplicates.length,
    skippedIncomplete: parsed.skippedIncomplete.length,
    bySeason: {
      summer: parsed.drafts.filter((row) => row.season === 'summer').length,
      fall: parsed.drafts.filter((row) => row.season === 'fall').length,
    },
    byStatus: parsed.drafts.reduce<Record<string, number>>((counts, row) => {
      counts[row.status] = (counts[row.status] ?? 0) + 1;
      return counts;
    }, {}),
  };

  if (!apply) {
    console.log(JSON.stringify({ ok: true, apply: false, ...summary, rows: parsed.drafts }, null, 2));
    return;
  }

  const fileEnv = await readDotEnvFile(path.join(rootDir, '.env.cms-dev'));
  const databaseUrl = process.env.DATABASE_URL ?? fileEnv.DATABASE_URL;
  if (databaseUrl == null || databaseUrl.trim().length === 0) {
    throw new Error('DATABASE_URL is required');
  }
  assertLocalDatabaseUrl(databaseUrl);
  const env = await loadCmsApiEnv(rootDir);
  const store = createCmsJsonStore(env);
  const applied = await applyScheduleDrafts({
    drafts: parsed.drafts,
    databaseUrl,
    store,
  });
  console.log(JSON.stringify({ ok: true, apply: true, ...summary, ...applied }, null, 2));
}

const invokedDirectly =
  process.argv[1] != null && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  void main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'import_schedule_drafts_failed';
    console.error(message);
    process.exitCode = 1;
  });
}
