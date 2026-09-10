import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { ROUTES } from '../../constants/routes';
import { SCROLL_RESTORATION_STORAGE_PREFIX } from '../../constants/scrollRestoration';
import { getScrollStorageKey } from './getScrollStorageKey';
import { hasSavedScrollY, readSavedScrollY } from './readSavedScrollY';
import { writeSavedScrollY } from './writeSavedScrollY';
import { isScrollRestorationEligiblePath } from './isScrollRestorationEligiblePath';

describe('getScrollStorageKey', () => {
  it('uses pathname and search without hash', () => {
    expect(getScrollStorageKey('/', '')).toBe(`${SCROLL_RESTORATION_STORAGE_PREFIX}/`);
    expect(getScrollStorageKey('/tours/spring/spring-3', '?x=1')).toBe(
      `${SCROLL_RESTORATION_STORAGE_PREFIX}/tours/spring/spring-3?x=1`
    );
  });
});

describe('readSavedScrollY / writeSavedScrollY', () => {
  const key = `${SCROLL_RESTORATION_STORAGE_PREFIX}/test`;

  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('round-trips scroll Y', () => {
    writeSavedScrollY(key, 4200.7);
    expect(readSavedScrollY(key)).toBe(4201);
    expect(hasSavedScrollY(key)).toBe(true);
  });

  it('returns null for missing or invalid values', () => {
    expect(readSavedScrollY(key)).toBeNull();
    sessionStorage.setItem(key, 'not-a-number');
    expect(readSavedScrollY(key)).toBeNull();
  });
});

describe('isScrollRestorationEligiblePath', () => {
  it('allows home, season lists, tour detail, legal pages', () => {
    expect(isScrollRestorationEligiblePath(ROUTES.HOME)).toBe(true);
    expect(isScrollRestorationEligiblePath(ROUTES.SPRING)).toBe(true);
    expect(isScrollRestorationEligiblePath('/tours/spring/spring-10')).toBe(true);
    expect(isScrollRestorationEligiblePath(ROUTES.SAFETY)).toBe(true);
  });

  it('rejects unknown paths (404)', () => {
    expect(isScrollRestorationEligiblePath('/unknown-page')).toBe(false);
    expect(isScrollRestorationEligiblePath('/tours/unknown/season')).toBe(false);
  });
});
