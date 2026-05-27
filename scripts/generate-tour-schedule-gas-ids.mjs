#!/usr/bin/env node
/**
 * Вставляет в integrations/tour-schedule-gas/Code.gs список id туров с сайта (SSOT toursData).
 * Запуск: npm run generate:tour-schedule-gas-ids
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadTourCatalog } from './lib/tourScheduleCatalog.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const gasPath = path.join(__dirname, '../integrations/tour-schedule-gas/Code.gs');

const BEGIN = '// <SITE_TOUR_IDS_BEGIN>';
const END = '// <SITE_TOUR_IDS_END>';

const ids = loadTourCatalog().map((t) => t.id);
const block = `${BEGIN}\nvar SITE_TOUR_IDS = ${JSON.stringify(ids)};\n${END}`;

let source = readFileSync(gasPath, 'utf8');
if (!source.includes(BEGIN) || !source.includes(END)) {
  console.error(`Markers ${BEGIN} / ${END} not found in ${gasPath}`);
  process.exitCode = 1;
} else {
  source = source.replace(new RegExp(`${BEGIN}[\\s\\S]*?${END}`), block);
  writeFileSync(gasPath, source, 'utf8');
  console.log(`Updated SITE_TOUR_IDS (${ids.length} tours) in ${gasPath}`);
}
