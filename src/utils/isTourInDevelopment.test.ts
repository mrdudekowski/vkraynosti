import { describe, expect, it } from 'vitest';
import type { TourPublicationStatus } from '../types/tourSchedule';
import { isTourInDevelopment } from './isTourInDevelopment';

describe('isTourInDevelopment', () => {
  it('returns true when publication status is in_development', () => {
    const statuses = new Map<string, TourPublicationStatus>([['summer-13', 'in_development']]);
    expect(isTourInDevelopment('summer-13', statuses, true)).toBe(true);
  });

  it('returns false when schedule is not loaded', () => {
    const statuses = new Map<string, TourPublicationStatus>([['summer-13', 'in_development']]);
    expect(isTourInDevelopment('summer-13', statuses, false)).toBe(false);
  });

  it('returns false for active tour in catalog', () => {
    const statuses = new Map<string, TourPublicationStatus>([['spring-1', 'active']]);
    expect(isTourInDevelopment('spring-1', statuses, true)).toBe(false);
  });
});
