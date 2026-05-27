#!/usr/bin/env node
/**
 * Аудит строковых записей `safelist` в tailwind.config.ts:
 * — «redundant»: класс уже встречается в src/index.css (purge через content);
 * — «apply-only»: нет в src — нужен для @apply / динамики.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONFIG_PATH = path.join(ROOT, 'tailwind.config.ts');

const GENERIC_UTILITIES = new Set([
  'flex',
  'flex-col',
  'w-full',
  'w-fit',
  'line-clamp-2',
  'md',
  'max',
]);

function escapeRe(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function collectSrcFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules') collectSrcFiles(full, out);
    } else if (/\.(ts|tsx)$/.test(entry.name) && !full.includes('tailwind.config')) {
      out.push(full);
    }
  }
  return out;
}

const config = fs.readFileSync(CONFIG_PATH, 'utf8');
const safelistStart = config.indexOf('safelist: [');
const safelistEnd = config.indexOf('\n  ],\n  theme:', safelistStart);
const block = config.slice(safelistStart, safelistEnd);
const literals = [...block.matchAll(/'([^']+)'/g)].map((m) => m[1]).filter((s) => !s.includes('\\'));

const srcFiles = collectSrcFiles(path.join(ROOT, 'src'));
const indexCssPath = path.join(ROOT, 'src', 'index.css');
const indexCss = fs.readFileSync(indexCssPath, 'utf8');

function usedInTsSources(className) {
  const re = new RegExp(escapeRe(className));
  for (const file of srcFiles) {
    if (re.test(fs.readFileSync(file, 'utf8'))) return file;
  }
  return null;
}

function usedInIndexCss(className) {
  return new RegExp(escapeRe(className)).test(indexCss);
}

const removableFromTs = [];
const keepForIndexCss = [];
const keepUnknown = [];
const generic = [];

for (const className of literals) {
  if (GENERIC_UTILITIES.has(className)) {
    generic.push(className);
    continue;
  }
  const inCss = usedInIndexCss(className);
  const tsHit = usedInTsSources(className);
  if (inCss) keepForIndexCss.push(className);
  else if (tsHit) removableFromTs.push({ className, file: path.relative(ROOT, tsHit) });
  else keepUnknown.push(className);
}

const dupes = literals.filter((c, i) => literals.indexOf(c) !== i);

console.log(JSON.stringify({
  totalLiterals: literals.length,
  removableFromTsCount: removableFromTs.length,
  keepForIndexCssCount: keepForIndexCss.length,
  keepUnknownCount: keepUnknown.length,
  genericCount: generic.length,
  duplicateLiterals: [...new Set(dupes)],
  removableFromTsClasses: removableFromTs.map((r) => r.className),
  keepForIndexCss,
  keepUnknown,
  generic,
}, null, 2));
