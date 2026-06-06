import { describe, expect, it } from 'vitest';
import {
  isTourHiddenFromSite,
  isTourPublicationHidden,
  isTourPublicationInDevelopment,
  resolveTourPublicationStatus,
} from './resolveTourPublicationStatus';
import type { TourPublicationStatus } from '../../types/tourSchedule';

const map = (entries: Record<string, TourPublicationStatus>) =>
  new Map(Object.entries(entries));

describe('resolveTourPublicationStatus', () => {
  it('returns schedule value when present', () => {
    expect(resolveTourPublicationStatus('summer-13', map({ 'summer-13': 'in_development' }))).toBe(
      'in_development',
    );
  });

  it('falls back to in_development from static flag', () => {
    expect(resolveTourPublicationStatus('summer-13', new Map(), true)).toBe('in_development');
  });

  it('defaults to active when schedule and static flag are absent', () => {
    expect(resolveTourPublicationStatus('spring-1', new Map())).toBe('active');
  });

  it('prefers schedule over static fallback', () => {
    expect(
      resolveTourPublicationStatus('spring-1', map({ 'spring-1': 'hidden' }), true),
    ).toBe('hidden');
  });
});

describe('isTourPublicationHidden', () => {
  it('detects hidden status', () => {
    expect(isTourPublicationHidden('summer-18', map({ 'summer-18': 'hidden' }))).toBe(true);
  });
});

describe('isTourHiddenFromSite', () => {
  it('returns false before schedule is loaded', () => {
    expect(isTourHiddenFromSite('summer-18', map({ 'summer-18': 'hidden' }), false)).toBe(
      false,
    );
  });

  it('returns true for hidden and for ids missing from non-empty catalog', () => {
    const statuses = map({ 'summer-1': 'active' });
    expect(isTourHiddenFromSite('summer-18', statuses, true)).toBe(true);
    expect(isTourHiddenFromSite('summer-1', statuses, true)).toBe(false);
  });

  it('does not hide tours when schedule loaded but catalog map is empty', () => {
    expect(isTourHiddenFromSite('summer-13', new Map(), true)).toBe(false);
  });
});

describe('isTourPublicationInDevelopment', () => {
  it('detects in_development status', () => {
    expect(
      isTourPublicationInDevelopment('summer-14', map({ 'summer-14': 'in_development' })),
    ).toBe(true);
  });
});
