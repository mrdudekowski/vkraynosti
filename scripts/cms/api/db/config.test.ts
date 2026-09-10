import { describe, expect, it } from 'vitest';
import { loadDatabaseConfig } from './config.ts';

describe('loadDatabaseConfig', () => {
  it('requires DATABASE_URL', () => {
    expect(() => loadDatabaseConfig({})).toThrow('DATABASE_URL is required');
  });

  it('enables TLS without disabling certificate verification', () => {
    expect(loadDatabaseConfig({ DATABASE_URL: 'postgres://u:p@db/app', DATABASE_SSL: 'true' }))
      .toEqual({ url: 'postgres://u:p@db/app', ssl: true, maxConnections: 10 });
  });
});
