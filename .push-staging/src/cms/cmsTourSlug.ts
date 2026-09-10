import { isValidTourSlug } from '../constants/tourUrls';
import type { Season } from '../types';

const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'kh',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'shch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
};

const SEASON_TOUR_ID = /^(winter|spring|summer|fall)-(\d+)$/;

export function slugFromTitle(title: string): string {
  const mapped = [...title.trim().toLocaleLowerCase('ru-RU')]
    .map((character) => {
      if (/[a-z0-9]/.test(character)) {
        return character;
      }
      if (character in CYRILLIC_TO_LATIN) {
        return CYRILLIC_TO_LATIN[character];
      }
      if (character === '-' || character === '—' || /\s/.test(character)) {
        return '-';
      }
      return '';
    })
    .join('');
  const collapsed = mapped.replace(/-+/g, '-').replace(/^-|-$/g, '');
  return collapsed.length > 0 ? collapsed : 'tur';
}

export function allocateUniqueSlug(base: string, taken: ReadonlySet<string>): string {
  const root = isValidTourSlug(base) ? base : slugFromTitle(base);
  if (!taken.has(root)) {
    return root;
  }
  let suffix = 2;
  while (taken.has(`${root}-${suffix}`)) {
    suffix += 1;
  }
  return `${root}-${suffix}`;
}

export function nextSeasonTourId(season: Season, existingIds: readonly string[]): string {
  const prefix = `${season}-`;
  let max = 0;
  for (const id of existingIds) {
    if (!id.startsWith(prefix)) {
      continue;
    }
    const match = SEASON_TOUR_ID.exec(id);
    if (match == null) {
      continue;
    }
    const number = Number(match[2]);
    if (number > max) {
      max = number;
    }
  }
  return `${season}-${max + 1}`;
}
