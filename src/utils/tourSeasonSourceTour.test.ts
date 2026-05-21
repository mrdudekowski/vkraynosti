import { describe, expect, it } from 'vitest';

import {
  resolveContentSourceTourId,
  SUMMER_CONTENT_SOURCE_PAIRS,
} from '../data/seasonTourRegistry';

describe('resolveContentSourceTourId', () => {
  it('fall-N → spring-N', () => {
    expect(resolveContentSourceTourId('fall-1')).toBe('spring-1');
    expect(resolveContentSourceTourId('fall-13')).toBe('spring-13');
  });

  it('летние пары из SUMMER_CONTENT_SOURCE_PAIRS', () => {
    for (const [summerId, springId] of Object.entries(SUMMER_CONTENT_SOURCE_PAIRS)) {
      expect(resolveContentSourceTourId(summerId)).toBe(springId);
    }
  });

  it('уникальные и зимние id без подмены', () => {
    expect(resolveContentSourceTourId('spring-1')).toBeUndefined();
    expect(resolveContentSourceTourId('summer-1')).toBeUndefined();
    expect(resolveContentSourceTourId('winter-1')).toBeUndefined();
  });
});
