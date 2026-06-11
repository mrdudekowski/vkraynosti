#!/usr/bin/env node
/**
 * Builds src/data/safetyOfferContent.ts from content/legal/offer-extract.txt
 * Excludes: block 1 (executor table), block 21 (participant form).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const extractPath = path.join(root, 'content/legal/offer-extract.txt');
const outPath = path.join(root, 'src/data/safetyOfferContent.ts');

/** Major section headers (number + unique prefix). */
const MAJOR_SECTION_MARKERS = [
  [2, 'Общие положения'],
  [3, 'Характер активной программы'],
  [4, 'Обязанности Заказчика'],
  [5, 'Состояние здоровья'],
  [6, 'Правила поведения на маршруте'],
  [7, 'Правила поведения в транспорте'],
  [8, 'Алкоголь'],
  [9, 'Одежда, обувь'],
  [10, 'Водные активности'],
  [11, 'Палаточный лагерь'],
  [12, 'Особо охраняемые территории'],
  [13, 'Право Исполнителя изменить программу'],
  [14, 'Основания для отказа'],
  [15, 'Последствия нарушения'],
  [16, 'Ответственность Исполнителя'],
  [17, 'Несовершеннолетние участники'],
  [18, 'Персональные вещи'],
  [19, 'Экстренные ситуации'],
  [20, 'Подтверждение ознакомления'],
];

const raw = fs.readFileSync(extractPath, 'utf8');
const lines = raw.split(/\r?\n/);

const startIdx = lines.findIndex((l) => /^2\.\s+Общие положения/.test(l.trim()));
const endIdx = lines.findIndex((l) => /^21\.\s+Форма подтверждения/.test(l.trim()));

if (startIdx < 0 || endIdx < 0) {
  console.error('Could not find section boundaries', { startIdx, endIdx });
  process.exit(1);
}

const bodyLines = lines.slice(startIdx, endIdx);
const headerTitle = 'Правила безопасности и участия в активных поездках и маршрутах';
const headerSubtitle = 'Проект «ВКрайности»';

const isMajorSectionStart = (trimmed) => {
  for (const [num, prefix] of MAJOR_SECTION_MARKERS) {
    const re = new RegExp(`^${num}\\.\\s+${prefix}`);
    if (re.test(trimmed)) return { num, prefix };
  }
  return null;
};

/** @type {{ id: string; title: string; blocks: Array<{ type: 'p' | 'ul'; text?: string; items?: string[] }> }} */
const sections = [];
let current = null;
let paragraphBuffer = [];
let bulletBuffer = [];

const flushParagraph = () => {
  const text = paragraphBuffer.join(' ').replace(/\s+/g, ' ').trim();
  paragraphBuffer = [];
  if (!text || !current) return;
  current.blocks.push({ type: 'p', text });
};

const flushBulletBuffer = () => {
  if (!bulletBuffer.length || !current) return;
  const items = bulletBuffer.map((i) => i.replace(/^[●•]\s*/, '').trim()).filter(Boolean);
  if (items.length) current.blocks.push({ type: 'ul', items });
  bulletBuffer = [];
};

const finalizeSection = () => {
  if (!current) return;
  sections.push(current);
  current = null;
};

const startSection = (num, firstLine) => {
  flushParagraph();
  flushBulletBuffer();
  finalizeSection();
  current = { id: `section-${num}`, title: firstLine.trim(), blocks: [] };
};

for (const line of bodyLines) {
  const trimmed = line.trim();
  if (!trimmed || /^ВКрайности \|/.test(trimmed)) continue;

  const major = isMajorSectionStart(trimmed);
  if (major) {
    startSection(major.num, trimmed);
    continue;
  }

  if (!current) continue;

  if (/^[●•]/.test(trimmed)) {
    flushParagraph();
    bulletBuffer.push(trimmed);
    continue;
  }

  if (bulletBuffer.length) flushBulletBuffer();

  if (/^\d+\.\s/.test(trimmed) && !isMajorSectionStart(trimmed)) {
    flushParagraph();
    paragraphBuffer.push(trimmed);
    continue;
  }

  paragraphBuffer.push(trimmed);
}

flushParagraph();
flushBulletBuffer();
finalizeSection();

const renumberedSections = sections.map((section, index) => {
  const displayNum = index + 1;
  const titleWithoutNum = section.title.replace(/^\d+\.\s+/, '');
  return {
    ...section,
    id: `section-${displayNum}`,
    title: `${displayNum}. ${titleWithoutNum}`,
  };
});

const file = `/**
 * SSOT: текст «Оферта + безопасность» для /safety (без блока 1 — реквизиты, без блока 21 — форма).
 * Источник: content/legal/offer-extract.txt → npm run build:safety-offer-content
 */
export type SafetyOfferBlock =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] };

export interface SafetyOfferSection {
  id: string;
  title: string;
  blocks: SafetyOfferBlock[];
}

export const SAFETY_OFFER_HEADER = {
  title: ${JSON.stringify(headerTitle)},
  subtitle: ${JSON.stringify(headerSubtitle)},
} as const;

export const SAFETY_OFFER_SECTIONS: SafetyOfferSection[] = ${JSON.stringify(renumberedSections, null, 2)};
`;

fs.writeFileSync(outPath, file, 'utf8');
console.log(`Wrote ${renumberedSections.length} sections → ${outPath}`);
