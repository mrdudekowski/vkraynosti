import { describe, expect, it } from 'vitest';
import {
  isNavigationFromPageCache,
  shouldShowBootSplash,
} from './bootSplashVisit';

describe('isNavigationFromPageCache', () => {
  it('detects cached document', () => {
    expect(
      isNavigationFromPageCache({ type: 'reload', transferSize: 0, decodedBodySize: 12_000 }),
    ).toBe(true);
  });

  it('does not treat fresh network navigation as cache', () => {
    expect(
      isNavigationFromPageCache({ type: 'navigate', transferSize: 1200, decodedBodySize: 12_000 }),
    ).toBe(false);
  });
});

describe('shouldShowBootSplash', () => {
  const freshNavigate = {
    type: 'navigate',
    transferSize: 1200,
    decodedBodySize: 12_000,
  };

  it('shows on first cold visit', () => {
    expect(
      shouldShowBootSplash({
        sessionAlreadyBooted: false,
        navigation: freshNavigate,
      }),
    ).toBe(true);
  });

  it('hides after session boot', () => {
    expect(
      shouldShowBootSplash({
        sessionAlreadyBooted: true,
        navigation: freshNavigate,
      }),
    ).toBe(false);
  });

  it('hides on bfcache restore', () => {
    expect(
      shouldShowBootSplash({
        sessionAlreadyBooted: false,
        navigation: freshNavigate,
        pageshowPersisted: true,
      }),
    ).toBe(false);
  });

  it('hides on back/forward navigation', () => {
    expect(
      shouldShowBootSplash({
        sessionAlreadyBooted: false,
        navigation: { type: 'back_forward', transferSize: 0, decodedBodySize: 12_000 },
      }),
    ).toBe(false);
  });

  it('hides when HTML came from cache', () => {
    expect(
      shouldShowBootSplash({
        sessionAlreadyBooted: false,
        navigation: { type: 'reload', transferSize: 0, decodedBodySize: 12_000 },
      }),
    ).toBe(false);
  });
});
