import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  YANDEX_METRIKA_SCRIPT_ATTR,
  YANDEX_METRIKA_SCRIPT_SRC,
} from '../../constants/cookieConsent';
import { loadYandexMetrika } from './loadYandexMetrika';

describe('loadYandexMetrika', () => {
  beforeEach(() => {
    document.querySelectorAll(`script[${YANDEX_METRIKA_SCRIPT_ATTR}]`).forEach(node => {
      node.remove();
    });
    delete (window as Window & { ym?: unknown }).ym;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    document.querySelectorAll(`script[${YANDEX_METRIKA_SCRIPT_ATTR}]`).forEach(node => {
      node.remove();
    });
    delete (window as Window & { ym?: unknown }).ym;
  });

  it('does not inject script without counter id', () => {
    vi.stubEnv('VITE_YANDEX_METRIKA_ID', '');
    loadYandexMetrika();
    expect(document.querySelector(`script[${YANDEX_METRIKA_SCRIPT_ATTR}]`)).toBeNull();
  });

  it('injects one script when counter id is set', () => {
    vi.stubEnv('VITE_YANDEX_METRIKA_ID', '12345678');
    loadYandexMetrika();
    const scripts = document.querySelectorAll(`script[${YANDEX_METRIKA_SCRIPT_ATTR}]`);
    expect(scripts).toHaveLength(1);
    expect(scripts[0]).toHaveAttribute('src', YANDEX_METRIKA_SCRIPT_SRC);
    expect((window as Window & { ym?: { a?: unknown[][] } }).ym?.a?.length).toBeGreaterThan(0);
  });

  it('does not duplicate script on second call', () => {
    vi.stubEnv('VITE_YANDEX_METRIKA_ID', '12345678');
    loadYandexMetrika();
    loadYandexMetrika();
    expect(document.querySelectorAll(`script[${YANDEX_METRIKA_SCRIPT_ATTR}]`)).toHaveLength(1);
  });
});
