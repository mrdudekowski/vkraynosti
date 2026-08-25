import { describe, expect, it } from 'vitest';
import { adminTourOperationalStatus } from './tourOperationalStatus';

describe('adminTourOperationalStatus', () => {
  it.each([
    [{ status: 'active', published: true, publishedStatus: 'active', ready: true }, 'on_site'],
    [{ status: 'hidden', published: true, publishedStatus: 'hidden', ready: true }, 'hidden'],
    [{ status: 'draft', published: false, publishedStatus: null, ready: true }, 'ready'],
    [{ status: 'draft', published: false, publishedStatus: null, ready: false }, 'blocked'],
  ] as const)('maps %j to %s', (tour, expected) => {
    expect(adminTourOperationalStatus(tour)).toBe(expected);
  });
});
