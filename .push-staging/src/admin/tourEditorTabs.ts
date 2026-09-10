import type { CmsPublishBlocker } from '../cms/cmsPublishRules';
import { isIncludedIconKey } from '../cms/includedIconCatalog';
import type { TourSectionCompletion } from '../cms/tourCompleteness';
import { ADMIN_UI } from './constants/ui';

export const EDITOR_SECTION_IDS = [
  'admin-catalog',
  'admin-about',
  'admin-included',
  'admin-program',
  'admin-gallery',
] as const;

export type AdminEditorSectionId = (typeof EDITOR_SECTION_IDS)[number];

export const ATTENTION_TAB_QUERY = 'attention';

export const EDITOR_TAB_QUERY = {
  'admin-catalog': 'catalog',
  'admin-about': 'about',
  'admin-included': 'included',
  'admin-program': 'program',
  'admin-gallery': 'gallery',
} as const satisfies Record<AdminEditorSectionId, string>;

const QUERY_TO_SECTION = {
  catalog: 'admin-catalog',
  about: 'admin-about',
  included: 'admin-included',
  program: 'admin-program',
  gallery: 'admin-gallery',
} as const satisfies Record<(typeof EDITOR_TAB_QUERY)[AdminEditorSectionId], AdminEditorSectionId>;

export const SECTION_COMPLETION_KEY = {
  'admin-catalog': 'catalog',
  'admin-about': 'about',
  'admin-included': 'included',
  'admin-program': 'program',
  'admin-gallery': 'gallery',
} as const satisfies Record<AdminEditorSectionId, keyof TourSectionCompletion>;

export const EDITOR_SECTION_NAV: Array<{ id: AdminEditorSectionId; label: string }> = [
  { id: 'admin-catalog', label: ADMIN_UI.sectionNav.catalog },
  { id: 'admin-about', label: ADMIN_UI.sectionNav.about },
  { id: 'admin-included', label: ADMIN_UI.sectionNav.included },
  { id: 'admin-program', label: ADMIN_UI.sectionNav.program },
  { id: 'admin-gallery', label: ADMIN_UI.sectionNav.gallery },
];

export const EDITOR_FOCUS_IDS = {
  title: 'admin-tour-title',
  slug: 'admin-tour-slug',
  subtitle: 'admin-subtitle',
  heroPhrase: 'admin-hero-phrase',
  duration: 'admin-duration',
  difficulty: 'admin-difficulty',
  price: 'admin-price',
  cover: 'admin-cover-upload',
  description: 'admin-description',
  aside: 'admin-aside',
  bentoEmpty: 'admin-bento-first-empty',
  includedIcon: (index: number) => `admin-included-icon-${index}`,
  programStep: (index: number) => `program-step-${index}`,
} as const;

export type EditorTabParam = AdminEditorSectionId | typeof ATTENTION_TAB_QUERY;

export function parseEditorTabParam(value: string | null): EditorTabParam {
  if (value === ATTENTION_TAB_QUERY) {
    return ATTENTION_TAB_QUERY;
  }
  if (value != null && value in QUERY_TO_SECTION) {
    return QUERY_TO_SECTION[value as keyof typeof QUERY_TO_SECTION];
  }
  return 'admin-catalog';
}

export function sectionTabQuery(id: AdminEditorSectionId): string {
  return EDITOR_TAB_QUERY[id];
}

export function blockerSectionId(
  blocker: CmsPublishBlocker,
  completion: TourSectionCompletion,
): AdminEditorSectionId {
  if (blocker === 'included_icon_required') {
    return 'admin-included';
  }
  if (blocker === 'cover_required') {
    return 'admin-about';
  }
  if (blocker === 'bento_empty_slots') {
    return 'admin-gallery';
  }
  return (
    EDITOR_SECTION_IDS.find((id) => completion[SECTION_COMPLETION_KEY[id]] !== true) ??
    'admin-catalog'
  );
}

export function firstAttentionSectionId(
  blockers: readonly CmsPublishBlocker[],
  completion: TourSectionCompletion,
): AdminEditorSectionId {
  const firstBlocker = blockers[0];
  if (firstBlocker != null) {
    return blockerSectionId(firstBlocker, completion);
  }
  return (
    EDITOR_SECTION_IDS.find((id) => completion[SECTION_COMPLETION_KEY[id]] !== true) ??
    'admin-catalog'
  );
}

export function tabBlockerSectionIds(
  blockers: readonly CmsPublishBlocker[],
  completion: TourSectionCompletion,
): AdminEditorSectionId[] {
  const seen = new Set<AdminEditorSectionId>();
  const ids: AdminEditorSectionId[] = [];
  for (const blocker of blockers) {
    const id = blockerSectionId(blocker, completion);
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);
    ids.push(id);
  }
  return ids;
}

export function blockerFocusId(
  blocker: CmsPublishBlocker,
  context?: { included?: ReadonlyArray<{ text: string; iconKey: string }> },
): string {
  if (blocker === 'cover_required') {
    return EDITOR_FOCUS_IDS.cover;
  }
  if (blocker === 'bento_empty_slots') {
    return EDITOR_FOCUS_IDS.bentoEmpty;
  }
  if (blocker === 'included_icon_required') {
    const index = context?.included?.findIndex(
      (item) => item.text.trim().length > 0 && !isIncludedIconKey(item.iconKey),
    );
    return EDITOR_FOCUS_IDS.includedIcon(index != null && index >= 0 ? index : 0);
  }
  return EDITOR_FOCUS_IDS.title;
}
