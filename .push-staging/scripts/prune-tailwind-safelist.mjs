#!/usr/bin/env node
/**
 * Сужает `safelist` в tailwind.config.ts:
 * — удаляет литералы, уже встречающиеся в src TS/TSX;
 * — удаляет generic utilities и дубли;
 * — оставляет pattern-записи, index.css-only и динамические классы.
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
  'lg',
]);

/** Литералы: только в theme / keyframes, в разметке больше нет. */
const DEAD_LITERALS = new Set([
  'z-30',
  'z-home-gate-letterbox',
  'z-home-gate-glow',
  'z-home-gate-return-veil',
  'bg-home-gate-letterbox',
  'bg-home-gate-return-veil',
  'px-home-gate-scroll-hint-pad-x',
  'py-home-gate-scroll-hint-pad-y',
  'pt-safe-top',
  'top-safe-top',
  '-top-safe-top',
  'text-messenger-phone',
  'text-messenger-telegram',
  'sm:text-tour-detail-hero-subtitle',
  'sm:text-tour-detail-prose',
  'sm:text-tour-detail-program-heading',
  'animate-home-hero-ceiling-bounce',
]);

function escapeRe(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function collectTsFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules') collectTsFiles(full, out);
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

const patternBlocks = [
  ...new Set(
    [...block.matchAll(/\{\s*pattern:[\s\S]*?\},?/g)].map((m) => m[0].trim()),
  ),
];
const literals = [...block.matchAll(/'([^']+)'/g)].map((m) => m[1]).filter((s) => !s.includes('\\'));

const srcFiles = collectTsFiles(path.join(ROOT, 'src'));
const indexCss = fs.readFileSync(path.join(ROOT, 'src', 'index.css'), 'utf8');

function usedInTs(className) {
  const re = new RegExp(escapeRe(className));
  return srcFiles.some((f) => re.test(fs.readFileSync(f, 'utf8')));
}

function usedInIndexCss(className) {
  return new RegExp(escapeRe(className)).test(indexCss);
}

const keptLiterals = [];
const removed = [];

for (const className of literals) {
  if (GENERIC_UTILITIES.has(className) || DEAD_LITERALS.has(className)) {
    removed.push(className);
    continue;
  }
  if (usedInTs(className)) {
    removed.push(className);
    continue;
  }
  if (usedInIndexCss(className)) {
    keptLiterals.push(className);
    continue;
  }
  if (
    className.startsWith('motion-safe:animate-') ||
    className === 'animate-cta-letter-pop' ||
    className === 'animate-tour-meta-stagger-in'
  ) {
    keptLiterals.push(className);
    continue;
  }
  removed.push(className);
}

const uniqueKept = [...new Set(keptLiterals)].sort();

const stackPattern =
  "{ pattern: /^max-h-safety-status-stack-\\d+$/, variants: ['sm'] },";
const hasStackPattern = patternBlocks.some((p) => p.includes('max-h-safety-status-stack'));

const lines = [
  '  safelist: [',
  "    { pattern: /^(h|min-h|w)-nav-season-(circle|icon)-(fixed|fluid)$/, variants: ['md', 'max'] },",
  ...(hasStackPattern ? [] : [`    ${stackPattern}`]),
  ...patternBlocks.map((p) => `    ${p}`),
  ...uniqueKept.map((c) => `    '${c}',`),
  '  ],',
];

const newSafelist = lines.join('\n');
const newConfig =
  config.slice(0, safelistStart) + newSafelist + config.slice(safelistEnd + '\n  ],'.length);

fs.writeFileSync(CONFIG_PATH, newConfig);

console.log(
  JSON.stringify(
    {
      removedCount: removed.length,
      keptLiteralCount: uniqueKept.length,
      patternBlockCount: patternBlocks.length + (hasStackPattern ? 0 : 1),
      keptLiterals: uniqueKept,
    },
    null,
    2,
  ),
);
