import { describe, expect, it } from 'vitest';
import { UNSET_INCLUDED_ICON_KEY } from '../cms/includedIconCatalog';
import type { CmsPublishBlocker } from '../cms/cmsPublishRules';
import type { TourSectionCompletion } from '../cms/tourCompleteness';
import {
  ATTENTION_TAB_QUERY,
  EDITOR_FOCUS_IDS,
  EDITOR_SECTION_IDS,
  blockerFocusId,
  blockerSectionId,
  firstAttentionSectionId,
  parseEditorTabParam,
  sectionTabQuery,
  tabBlockerSectionIds,
} from './tourEditorTabs';

const complete: TourSectionCompletion = {
  catalog: true,
  about: true,
  included: true,
  program: true,
  gallery: true,
};

describe('parseEditorTabParam', () => {
  it('читает известные вкладки и иначе открывает карточку', () => {
    expect(parseEditorTabParam('about')).toBe('admin-about');
    expect(parseEditorTabParam('gallery')).toBe('admin-gallery');
    expect(parseEditorTabParam(null)).toBe('admin-catalog');
    expect(parseEditorTabParam('nope')).toBe('admin-catalog');
    expect(parseEditorTabParam(ATTENTION_TAB_QUERY)).toBe(ATTENTION_TAB_QUERY);
  });
});

describe('blockerSectionId', () => {
  it('ведёт обложку в «О поездке», сетку — в галерею', () => {
    expect(blockerSectionId('cover_required', complete)).toBe('admin-about');
    expect(blockerSectionId('bento_empty_slots', complete)).toBe('admin-gallery');
    expect(blockerSectionId('included_icon_required', complete)).toBe('admin-included');
  });

  it('для tour_not_ready берёт первую неготовую секцию', () => {
    expect(
      blockerSectionId('tour_not_ready', { ...complete, about: false, included: false }),
    ).toBe('admin-about');
  });
});

describe('firstAttentionSectionId', () => {
  it('сначала вкладка блокера, иначе первая неготовая, иначе карточка', () => {
    expect(firstAttentionSectionId(['bento_empty_slots'], complete)).toBe('admin-gallery');
    expect(firstAttentionSectionId([], { ...complete, program: false })).toBe('admin-program');
    expect(firstAttentionSectionId([], complete)).toBe('admin-catalog');
  });
});

describe('tabBlockerSectionIds', () => {
  it('ставит точку только на вкладки с блокерами', () => {
    const blockers: CmsPublishBlocker[] = ['cover_required', 'included_icon_required'];
    expect(tabBlockerSectionIds(blockers, complete)).toEqual(['admin-about', 'admin-included']);
  });
});

describe('blockerFocusId', () => {
  it('фокусирует поле блокера, а не шапку вкладки', () => {
    expect(blockerFocusId('cover_required')).toBe(EDITOR_FOCUS_IDS.cover);
    expect(blockerFocusId('bento_empty_slots')).toBe(EDITOR_FOCUS_IDS.bentoEmpty);
    expect(
      blockerFocusId('included_icon_required', {
        included: [
          { text: 'Гид', iconKey: 'user-tie' },
          { text: 'Трансфер', iconKey: UNSET_INCLUDED_ICON_KEY },
        ],
      }),
    ).toBe(EDITOR_FOCUS_IDS.includedIcon(1));
  });
});

describe('sectionTabQuery', () => {
  it('пишет короткий ключ вкладки в URL', () => {
    expect(sectionTabQuery('admin-about')).toBe('about');
    expect(EDITOR_SECTION_IDS).toHaveLength(5);
  });
});
