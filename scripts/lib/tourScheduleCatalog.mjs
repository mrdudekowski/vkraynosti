import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const DURATION_DAY = 'однодневный';
const DURATION_MULTI = 'многодневный';

const rootDir = resolve(import.meta.dirname, '../..');

/** @typedef {{ id: string, title: string, priceRub: number | null, durationType: string, season: string }} TourCatalogRow */

/**
 * @param {string} price
 * @returns {number | null}
 */
export function parsePriceRub(price) {
  if (!price || /запрос|placeholder|UI\.|winterPrice/i.test(price)) {
    return null;
  }
  const digits = price.replace(/\s/g, '').match(/\d+/);
  return digits ? Number.parseInt(digits[0], 10) : null;
}

/**
 * @param {string} duration
 * @returns {string}
 */
export function parseDurationType(duration) {
  if (!duration) return DURATION_DAY;
  const lower = duration.toLowerCase();
  if (lower.includes('2 дня') || lower.includes('ночь') || lower.includes('уикенд')) {
    return DURATION_MULTI;
  }
  return DURATION_DAY;
}

/**
 * @param {string} block
 * @returns {TourCatalogRow | null}
 */
function parseTourBlock(block) {
  const id = /^\s*id:\s*'([^']+)'/m.exec(block)?.[1];
  const title = /^\s*title:\s*'((?:\\'|[^'])*)'/m.exec(block)?.[1]?.replace(/\\'/g, "'");
  const price = /^\s*price:\s*'([^']+)'/m.exec(block)?.[1];
  const duration = /^\s*duration:\s*'([^']+)'/m.exec(block)?.[1];
  const season = /^\s*season:\s*'(winter|spring|summer)'/m.exec(block)?.[1];
  if (!id || !title || !season) return null;
  return {
    id,
    title,
    priceRub: price ? parsePriceRub(price) : null,
    durationType: parseDurationType(duration ?? ''),
    season,
  };
}

/**
 * @param {string} source
 * @returns {TourCatalogRow[]}
 */
function parseToursCore(source) {
  const start = source.indexOf('const TOURS_CORE: Tour[] = [');
  const end = source.indexOf('];', start);
  if (start < 0 || end < 0) {
    throw new Error('TOURS_CORE not found in toursData.ts');
  }
  const section = source.slice(start, end);
  const blocks = section.split(/\n\s*},\s*\n/).map((chunk) => (chunk.startsWith('{') ? chunk : `{${chunk}`));
  return blocks.map(parseTourBlock).filter(Boolean);
}

/**
 * @returns {Record<string, string>}
 */
function readSummerPairs() {
  const source = readFileSync(resolve(rootDir, 'src/data/seasonTourRegistry.ts'), 'utf8');
  const pairs = {};
  for (const match of source.matchAll(/'(summer-\d+)':\s*'(spring-\d+)'/g)) {
    pairs[match[1]] = match[2];
  }
  return pairs;
}

/**
 * @returns {string[]}
 */
function readFallIds() {
  const source = readFileSync(resolve(rootDir, 'src/constants/fallTourImages.ts'), 'utf8');
  return [...source.matchAll(/'(fall-\d+)'/g)].map((m) => m[1]);
}

/**
 * Каталог 43 туров — SSOT из toursData + пары summer/fall.
 * @returns {TourCatalogRow[]}
 */
export function loadTourCatalog() {
  const source = readFileSync(resolve(rootDir, 'src/data/toursData.ts'), 'utf8');
  const core = parseToursCore(source);
  const byId = Object.fromEntries(core.map((t) => [t.id, t]));

  const summerPairs = readSummerPairs();
  for (const [summerId, springId] of Object.entries(summerPairs)) {
    const spring = byId[springId];
    if (!spring) {
      throw new Error(`Summer pair ${summerId} → missing ${springId}`);
    }
    core.push({
      id: summerId,
      title: spring.title,
      priceRub: spring.priceRub,
      durationType: spring.durationType,
      season: 'summer',
    });
  }

  const fallIds = readFallIds();
  for (const fallId of fallIds) {
    const n = fallId.replace('fall-', '');
    const spring = byId[`spring-${n}`];
    if (!spring) {
      throw new Error(`Fall ${fallId} → missing spring-${n}`);
    }
    core.push({
      id: fallId,
      title: spring.title,
      priceRub: spring.priceRub,
      durationType: spring.durationType,
      season: 'fall',
    });
  }

  const seasons = ['winter', 'spring', 'summer', 'fall'];
  const sorted = [...core].sort((a, b) => {
    const sa = seasons.indexOf(a.season);
    const sb = seasons.indexOf(b.season);
    if (sa !== sb) return sa - sb;
    return Number.parseInt(a.id.split('-')[1], 10) - Number.parseInt(b.id.split('-')[1], 10);
  });

  if (sorted.length !== 43) {
    throw new Error(`Expected 43 tours, got ${sorted.length}`);
  }

  return sorted;
}

export { DURATION_DAY, DURATION_MULTI };
