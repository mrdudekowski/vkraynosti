import { describe, expect, it } from 'vitest';
import type { TourPublicationStatus } from '../types/tourSchedule';
import { isTourInDevelopment } from './isTourInDevelopment';

describe('isTourInDevelopment', () => {
  it('returns true when publication status is in_development', () => {
    const statuses = new Map<string, TourPublicationStatus>([['summer-13', 'in_development']]);
    expect(isTourInDevelopment({ id: 'summer-13' }, statuses)).toBe(true);
  });

  it('falls back to static inDevelopment flag', () => {
    expect(isTourInDevelopment({ id: 'summer-13', inDevelopment: true })).toBe(true);
  });

  it('returns false for active tours', () => {
    expect(isTourInDevelopment({ id: 'spring-1' })).toBe(false);
    expect(isTourInDevelopment({ id: 'spring-1', inDevelopment: false })).toBe(false);
    expect(isTourInDevelopment({ id: 'spring-1', inDevelopment: undefined })).toBe(false);
  });
});
