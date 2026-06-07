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
  it('returns schedule value when present and loaded', () => {
    expect(
      resolveTourPublicationStatus('summer-13', map({ 'summer-13': 'in_development' }), {
        scheduleLoaded: true,
      }),
    ).toBe('in_development');
  });

  it('returns null before schedule is loaded', () => {
    expect(
      resolveTourPublicationStatus('spring-1', map({ 'spring-1': 'active' }), {
        scheduleLoaded: false,
      }),
    ).toBeNull();
  });

  it('returns hidden when catalog is empty after load', () => {
    expect(
      resolveTourPublicationStatus('spring-1', new Map(), { scheduleLoaded: true }),
    ).toBe('hidden');
  });

  it('returns hidden when id is missing from catalog', () => {
    expect(
      resolveTourPublicationStatus('summer-14', map({ 'summer-13': 'in_development' }), {
        scheduleLoaded: true,
      }),
    ).toBe('hidden');
  });
});

describe('isTourPublicationHidden', () => {
  it('detects hidden status', () => {
    expect(
      isTourPublicationHidden('summer-18', map({ 'summer-18': 'hidden' }), true),
    ).toBe(true);
  });
});

describe('isTourHiddenFromSite', () => {
  it('returns true before schedule is loaded', () => {
    expect(isTourHiddenFromSite('summer-18', map({ 'summer-18': 'hidden' }), false)).toBe(
      true,
    );
  });

  it('returns true for hidden and for ids missing from non-empty catalog', () => {
    const statuses = map({ 'summer-1': 'active' });
    expect(isTourHiddenFromSite('summer-18', statuses, true)).toBe(true);
    expect(isTourHiddenFromSite('summer-1', statuses, true)).toBe(false);
  });

  it('hides all tours when schedule loaded but catalog map is empty', () => {
    expect(isTourHiddenFromSite('summer-13', new Map(), true)).toBe(true);
  });
});

describe('isTourPublicationInDevelopment', () => {
  it('detects in_development status', () => {
    expect(
      isTourPublicationInDevelopment('summer-14', map({ 'summer-14': 'in_development' }), true),
    ).toBe(true);
  });

  it('returns false before schedule is loaded', () => {
    expect(
      isTourPublicationInDevelopment('summer-14', map({ 'summer-14': 'in_development' }), false),
    ).toBe(false);
  });
});
