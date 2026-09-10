import { isValidTourSlug } from '../constants/tourUrls';
import { cmsMediaPublishBlockers } from './cmsMediaPublishRules';
import type { CmsTourDocument } from './cmsTourDocument';
import { isTourDurationDays } from './durationDays';
import { isIncludedIconKey } from './includedIconCatalog';

export const CATALOG_PRICE_ON_REQUEST = 'по запросу';

export type TourSectionCompletion = {
  catalog: boolean;
  about: boolean;
  included: boolean;
  program: boolean;
  gallery: boolean;
};

export type TourReadinessBlocker = {
  code: string;
  section: keyof TourSectionCompletion;
  focus: string;
};

export type TourReadiness = {
  ready: boolean;
  sections: TourSectionCompletion;
  blockers: TourReadinessBlocker[];
};

const SEASONS: readonly CmsTourDocument['season'][] = ['winter', 'spring', 'summer', 'fall'];
const DIFFICULTIES: readonly CmsTourDocument['difficulty'][] = ['Easy', 'Medium', 'Hard', 'Expert'];

function trimmedNonEmpty(value: string | undefined): boolean {
  return value != null && value.trim().length > 0;
}

function isCatalogPrice(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed === CATALOG_PRICE_ON_REQUEST) {
    return true;
  }

  const amountWithoutPrefix = trimmed.replace(/^от\s+/, '');
  const digitsOnlyAmount = amountWithoutPrefix.replace(/\s/g, '').replace(/₽$/, '');
  return /^\d+$/.test(digitsOnlyAmount);
}

function isCatalogComplete(document: CmsTourDocument): boolean {
  return (
    trimmedNonEmpty(document.title) &&
    isValidTourSlug(document.slug) &&
    (SEASONS as readonly string[]).includes(document.season) &&
    trimmedNonEmpty(document.subtitle) &&
    (DIFFICULTIES as readonly string[]).includes(document.difficulty) &&
    document.durationDays != null &&
    isTourDurationDays(document.durationDays) &&
    isCatalogPrice(document.price)
  );
}

function isAboutComplete(document: CmsTourDocument): boolean {
  return (
    trimmedNonEmpty(document.description) &&
    trimmedNonEmpty(document.descriptionAside) &&
    trimmedNonEmpty(document.heroPhrase)
  );
}

function isIncludedComplete(document: CmsTourDocument): boolean {
  return document.included.some(
    (item) => trimmedNonEmpty(item.text) && isIncludedIconKey(item.iconKey),
  );
}

function isProgramComplete(document: CmsTourDocument): boolean {
  return document.program.some((step) => trimmedNonEmpty(step.description));
}

export function tourSectionCompletion(document: CmsTourDocument): TourSectionCompletion {
  return {
    catalog: isCatalogComplete(document),
    about: isAboutComplete(document),
    included: isIncludedComplete(document),
    program: isProgramComplete(document),
    gallery: cmsMediaPublishBlockers(document).length === 0,
  };
}

export function tourReadiness(document: CmsTourDocument): TourReadiness {
  const sections = tourSectionCompletion(document);
  const mediaBlockers = cmsMediaPublishBlockers(document);
  const blockers: TourReadinessBlocker[] = [];

  for (const blocker of mediaBlockers) {
    if (blocker === 'cover_required') {
      blockers.push({ code: blocker, section: 'gallery', focus: 'cover' });
    } else if (blocker === 'bento_empty_slots') {
      blockers.push({ code: blocker, section: 'gallery', focus: 'bento-empty' });
    } else if (blocker === 'included_icon_required') {
      blockers.push({ code: blocker, section: 'included', focus: 'included-icons' });
    }
  }

  if (!sections.catalog) {
    blockers.push({ code: 'catalog_required', section: 'catalog', focus: 'catalog' });
  }
  if (!sections.about) {
    blockers.push({ code: 'about_required', section: 'about', focus: 'description' });
  }
  if (!sections.included && !blockers.some((blocker) => blocker.code === 'included_icon_required')) {
    blockers.push({ code: 'included_required', section: 'included', focus: 'included' });
  }
  if (!sections.program) {
    blockers.push({ code: 'program_required', section: 'program', focus: 'program' });
  }

  return { ready: blockers.length === 0, sections, blockers };
}

export function isTourReady(document: CmsTourDocument): boolean {
  return tourReadiness(document).ready;
}

export function tourReadinessCounts(document: CmsTourDocument): {
  ready: boolean;
  readyCount: number;
  readyTotal: number;
} {
  const sections = tourSectionCompletion(document);
  const readyCount = Object.values(sections).filter(Boolean).length;
  const readyTotal = Object.keys(sections).length;
  return {
    ready: readyCount === readyTotal,
    readyCount,
    readyTotal,
  };
}
