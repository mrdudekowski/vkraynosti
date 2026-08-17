import { describe, expect, it } from 'vitest';
import config from '../../../../drizzle.config.ts';

describe('Drizzle configuration', () => {
  it('targets the CMS PostgreSQL schema and migrations directory', () => {
    expect(config).toMatchObject({
      schema: './scripts/cms/api/db/schema.ts',
      out: './drizzle',
      dialect: 'postgresql',
    });
  });
});
