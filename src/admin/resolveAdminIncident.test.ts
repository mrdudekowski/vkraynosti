import { describe, expect, it } from 'vitest';
import type { AdminCmsHealth } from './api';
import { resolveAdminIncident } from './resolveAdminIncident';

const healthy: AdminCmsHealth = {
  ok: true,
  postgres: 'up',
  jsonStore: 'up',
  storage: 'closed',
  catalogMirror: 'up',
};

describe('resolveAdminIncident', () => {
  it('returns api_down when fetch failed', () => {
    expect(resolveAdminIncident(healthy, true)).toBe('api_down');
  });

  it('returns null when health is null and fetch has not failed', () => {
    expect(resolveAdminIncident(null, false)).toBeNull();
  });

  it('returns api_down when fetch failed even if health looks fine', () => {
    expect(resolveAdminIncident(healthy, true)).toBe('api_down');
  });

  it('returns catalog_down when postgres is down', () => {
    expect(resolveAdminIncident({ ...healthy, postgres: 'down' }, false)).toBe('catalog_down');
  });

  it('returns catalog_down when jsonStore is down (over storage open)', () => {
    expect(
      resolveAdminIncident({ ...healthy, jsonStore: 'down', storage: 'open' }, false),
    ).toBe('catalog_down');
  });

  it('returns media_down when storage is open', () => {
    expect(resolveAdminIncident({ ...healthy, storage: 'open' }, false)).toBe('media_down');
  });

  it('returns media_down when storage is half-open', () => {
    expect(resolveAdminIncident({ ...healthy, storage: 'half-open' }, false)).toBe('media_down');
  });

  it('returns media_down when catalogMirror is down', () => {
    expect(
      resolveAdminIncident({ ...healthy, storage: 'closed', catalogMirror: 'down' }, false),
    ).toBe('media_down');
  });

  it('returns null when storage closed and catalog mirror up', () => {
    expect(
      resolveAdminIncident({ ok: true, storage: 'closed', catalogMirror: 'up' }, false),
    ).toBeNull();
  });

  it('returns null when optional health fields are omitted', () => {
    expect(resolveAdminIncident({ ok: true }, false)).toBeNull();
  });

  it('prioritizes api_down over catalog and media', () => {
    expect(
      resolveAdminIncident(
        { ok: false, postgres: 'down', storage: 'open', catalogMirror: 'down' },
        true,
      ),
    ).toBe('api_down');
  });

  it('prioritizes catalog_down over media_down', () => {
    expect(
      resolveAdminIncident(
        { ok: true, postgres: 'down', storage: 'open', catalogMirror: 'down' },
        false,
      ),
    ).toBe('catalog_down');
  });
});
