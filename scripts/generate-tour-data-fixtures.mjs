#!/usr/bin/env node
/**
 * Генерирует public/data/tour-schedule/*.json из legacy tour-schedule.json + toursData.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadTourCatalog } from './lib/tourScheduleCatalog.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const legacyPath = path.join(root, 'public/data/tour-schedule.json');
const outDir = path.join(root, 'public/data/tour-schedule');

const legacy = JSON.parse(fs.readFileSync(legacyPath, 'utf8'));
const catalog = loadTourCatalog();
const titleById = Object.fromEntries(catalog.map(row => [row.id, row.title]));
const generatedAt = new Date().toISOString();

const tours = Object.entries(legacy.publicationStatuses ?? {})
  .filter(([, status]) => status === 'active' || status === 'in_development')
  .map(([id, publicationStatus]) => ({
    id,
    title: titleById[id] ?? id,
    priceRub: legacy.prices?.[id] ?? null,
    durationType: legacy.durationTypes?.[id] ?? 'однодневный',
    publicationStatus,
  }))
  .sort((a, b) => a.id.localeCompare(b.id));

const activeIds = new Set(
  tours.filter(t => t.publicationStatus === 'active').map(t => t.id),
);

const events = (legacy.events ?? [])
  .filter(ev => activeIds.has(ev.tourId))
  .map(ev => ({
    date: ev.date,
    tourId: ev.tourId,
    seats: ev.seats ?? null,
    status: ev.status,
    comment: ev.comment ?? null,
  }));

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, 'tours_list.json'),
  `${JSON.stringify({ schemaVersion: 1, generatedAt, tours }, null, 2)}\n`,
);
fs.writeFileSync(
  path.join(outDir, 'schedule.json'),
  `${JSON.stringify({ schemaVersion: 1, generatedAt, events }, null, 2)}\n`,
);

console.log(`Wrote ${tours.length} tours, ${events.length} events → ${outDir}`);
