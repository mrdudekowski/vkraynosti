import { afterEach, describe, expect, it } from 'vitest';
import {
  getCmsCatalogStatus,
  resetCmsCatalogStatusForTests,
  setCmsCatalogStatus,
  subscribeCmsCatalogStatus,
} from './cmsCatalogStatus';

describe('cmsCatalogStatus', () => {
  afterEach(() => {
    resetCmsCatalogStatusForTests();
  });

  it('notifies subscribers when status changes', () => {
    const seen: string[] = [];
    const unsubscribe = subscribeCmsCatalogStatus((next) => {
      seen.push(next);
    });
    setCmsCatalogStatus('ready');
    setCmsCatalogStatus('maintenance');
    unsubscribe();
    setCmsCatalogStatus('ready');
    expect(getCmsCatalogStatus()).toBe('ready');
    expect(seen).toEqual(['ready', 'maintenance']);
  });
});
