import { describe, expect, it } from 'vitest';
import type { CmsTourDocument } from './cmsTourDocument';
import { resolvePublishedTourDocument } from './publishedTourSnapshot';

const overlayActive = {
  id: 'summer-8',
  status: 'active',
  title: 'Полуостров Краббе',
} as CmsTourDocument;

const perTourHidden = {
  id: 'summer-8',
  status: 'hidden',
  title: 'Полуостров Краббе',
} as CmsTourDocument;

describe('resolvePublishedTourDocument', () => {
  it('считает тур из overlay опубликованным, даже без per-tour снимка', () => {
    expect(resolvePublishedTourDocument(null, overlayActive)).toEqual(overlayActive);
  });

  it('после выпуска скрытия берёт per-tour hidden, а не overlay', () => {
    expect(resolvePublishedTourDocument(perTourHidden, overlayActive)?.status).toBe('hidden');
  });

  it('без снимка и без overlay — не опубликован', () => {
    expect(resolvePublishedTourDocument(null, null)).toBeNull();
  });
});
