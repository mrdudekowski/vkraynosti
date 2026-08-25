import { isValidTourSlug } from '../constants/tourUrls';
import { cmsTourDocumentSchema, type CmsTourDocument } from './cmsTourDocument';
import { isTourDurationDays, publicDurationFromDays } from './durationDays';
import { isIncludedIconKey, isUnsetIncludedIconKey } from './includedIconCatalog';

export type CmsTourTextPatch = {
  title?: string;
  slug?: string;
  subtitle?: string;
  heroPhrase?: string;
  duration?: string;
  durationDays?: number;
  difficulty?: CmsTourDocument['difficulty'];
  difficultyDisplayLabel?: string;
  metaAudienceLabel?: string;
  price?: string;
  pricePrevious?: string;
  priceFootnote?: string;
  seoDescription?: string;
  description: string;
  descriptionLeadBold?: string;
  descriptionAside?: string;
  prefaceAssetId: string | null;
  included: Array<{ text: string; iconKey: string }>;
  program: Array<{ timeLabel: string; description: string }>;
  programAdditionalNotes?: string[];
  assetAlts?: Record<string, string>;
};

function trimOrEmpty(value: string | undefined): string {
  return value?.trim() ?? '';
}

function optionalText(value: string | undefined): string | undefined {
  const trimmed = trimOrEmpty(value);
  return trimmed.length > 0 ? trimmed : undefined;
}

const TOUR_DIFFICULTIES: readonly CmsTourDocument['difficulty'][] = [
  'Easy',
  'Medium',
  'Hard',
  'Expert',
];

function isTourDifficulty(value: string): value is CmsTourDocument['difficulty'] {
  return (TOUR_DIFFICULTIES as readonly string[]).includes(value);
}

function textOrCurrent(patchValue: string | undefined, current: string): string {
  return patchValue !== undefined ? trimOrEmpty(patchValue) : current;
}

function optionalOrCurrent(
  patchValue: string | undefined,
  current: string | undefined,
): string | undefined {
  return optionalText(patchValue !== undefined ? patchValue : current);
}

/**
 * Тексты карточки, «О поездке», предисловие, включено, программа и подписи кадров.
 * Сетку bento и status не трогает.
 */
export function applyTourTextPatch(
  document: CmsTourDocument,
  patch: CmsTourTextPatch
): CmsTourDocument {
  const assetIds = new Set(document.assets.map((asset) => asset.id));
  const prefaceAssetId = patch.prefaceAssetId;
  if (prefaceAssetId != null && prefaceAssetId.length > 0 && !assetIds.has(prefaceAssetId)) {
    throw new Error(`Unknown preface asset "${prefaceAssetId}"`);
  }

  for (const item of patch.included) {
    if (!isIncludedIconKey(item.iconKey) && !isUnsetIncludedIconKey(item.iconKey)) {
      throw new Error(`Unknown included icon "${item.iconKey}"`);
    }
  }

  const descriptionLeadBold = optionalText(patch.descriptionLeadBold);
  const descriptionAside = optionalText(patch.descriptionAside);
  const notes = (patch.programAdditionalNotes ?? [])
    .map((note) => note.trim())
    .filter((note) => note.length > 0);

  let title = document.title;
  if (patch.title != null) {
    title = patch.title.trim();
    if (title.length === 0) {
      throw new Error('Invalid title');
    }
  }

  let slug = document.slug;
  if (patch.slug != null) {
    slug = patch.slug.trim();
    if (!isValidTourSlug(slug)) {
      throw new Error('Invalid slug');
    }
  }

  if (patch.difficulty != null && !isTourDifficulty(patch.difficulty)) {
    throw new Error('Invalid difficulty');
  }

  let durationDays = document.durationDays;
  if (patch.durationDays != null) {
    if (!isTourDurationDays(patch.durationDays)) {
      throw new Error('Invalid durationDays');
    }
    durationDays = patch.durationDays;
  }
  const duration =
    durationDays != null && isTourDurationDays(durationDays)
      ? publicDurationFromDays(durationDays)
      : textOrCurrent(patch.duration, document.duration);

  const difficultyDisplayLabel = optionalOrCurrent(
    patch.difficultyDisplayLabel,
    document.difficultyDisplayLabel,
  );
  const metaAudienceLabel = optionalOrCurrent(patch.metaAudienceLabel, document.metaAudienceLabel);
  const pricePrevious = optionalOrCurrent(patch.pricePrevious, document.pricePrevious);
  const priceFootnote = optionalOrCurrent(patch.priceFootnote, document.priceFootnote);
  const seoDescription = optionalOrCurrent(patch.seoDescription, document.seoDescription);

  const rest: CmsTourDocument = { ...document };
  delete rest.descriptionLeadBold;
  delete rest.descriptionAside;
  delete rest.programAdditionalNotes;
  delete rest.difficultyDisplayLabel;
  delete rest.metaAudienceLabel;
  delete rest.pricePrevious;
  delete rest.priceFootnote;
  delete rest.seoDescription;
  delete rest.durationDays;

  return cmsTourDocumentSchema.parse({
    ...rest,
    title,
    slug,
    subtitle: textOrCurrent(patch.subtitle, document.subtitle),
    heroPhrase: textOrCurrent(patch.heroPhrase, document.heroPhrase),
    duration,
    ...(durationDays != null ? { durationDays } : {}),
    difficulty: patch.difficulty ?? document.difficulty,
    price: textOrCurrent(patch.price, document.price),
    ...(difficultyDisplayLabel != null ? { difficultyDisplayLabel } : {}),
    ...(metaAudienceLabel != null ? { metaAudienceLabel } : {}),
    ...(pricePrevious != null ? { pricePrevious } : {}),
    ...(priceFootnote != null ? { priceFootnote } : {}),
    ...(seoDescription != null ? { seoDescription } : {}),
    description: trimOrEmpty(patch.description),
    ...(descriptionLeadBold != null ? { descriptionLeadBold } : {}),
    ...(descriptionAside != null ? { descriptionAside } : {}),
    prefaceAssetId:
      prefaceAssetId != null && prefaceAssetId.length > 0 ? prefaceAssetId : null,
    included: patch.included.map((item) => ({
      text: trimOrEmpty(item.text),
      iconKey: item.iconKey,
    })),
    program: patch.program.map((step) => ({
      timeLabel: trimOrEmpty(step.timeLabel),
      description: trimOrEmpty(step.description),
    })),
    ...(notes.length > 0 ? { programAdditionalNotes: notes } : {}),
    assets: document.assets.map((asset) => ({
      ...asset,
      alt: patch.assetAlts?.[asset.id] ?? asset.alt,
    })),
  });
}

/** Hidden остаётся в overlay: календарь гостя может показать прошедшую дату, карточки при этом нет. */
export function upsertTourInPublishedCatalog(
  catalog: { schemaVersion: 1; tours: CmsTourDocument[] },
  document: CmsTourDocument
): { schemaVersion: 1; tours: CmsTourDocument[] } {
  const existingIndex = catalog.tours.findIndex((tour) => tour.id === document.id);
  const tours =
    existingIndex >= 0
      ? catalog.tours.map((tour, index) => (index === existingIndex ? document : tour))
      : [...catalog.tours, document];
  return {
    schemaVersion: catalog.schemaVersion,
    tours:
      document.status === 'active' || document.status === 'hidden'
        ? tours
        : tours.filter((tour) => tour.id !== document.id),
  };
}
