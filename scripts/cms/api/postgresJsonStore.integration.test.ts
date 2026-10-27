/** @vitest-environment node */
import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, describe, expect, it } from 'vitest';
import { like } from 'drizzle-orm';
import { createDatabase } from './db/client.ts';
import { cmsJson } from './db/schema.ts';
import { createPostgresJsonStore } from './postgresJsonStore.ts';

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
if (testDatabaseUrl == null || testDatabaseUrl.trim() === '') {
  throw new Error('TEST_DATABASE_URL is required for postgres json store integration tests');
}

const testDatabase = new URL(testDatabaseUrl);
if (!['127.0.0.1', 'localhost'].includes(testDatabase.hostname)) {
  throw new Error('TEST_DATABASE_URL must point to a local database');
}

const testRunPrefix = `cms-json-${randomUUID().replaceAll('-', '')}`;
const database = createDatabase({ url: testDatabaseUrl, ssl: false, maxConnections: 1 });
const store = createPostgresJsonStore(database.db);

afterEach(async () => {
  await database.db.delete(cmsJson).where(like(cmsJson.key, `${testRunPrefix}%`));
});

afterAll(async () => {
  await database.close();
});

describe('createPostgresJsonStore', () => {
  it('round-trips JSON documents and refuses byte methods', async () => {
    const key = `${testRunPrefix}/draft/tours/winter-1/document.json`;
    await store.putJson(key, { id: 'winter-1', title: 'Test' });
    await expect(store.getJson(key)).resolves.toEqual({ id: 'winter-1', title: 'Test' });

    await store.putJson(key, { id: 'winter-1', title: 'Updated' });
    await expect(store.getJson(key)).resolves.toEqual({ id: 'winter-1', title: 'Updated' });

    await expect(store.getBytes(key)).rejects.toThrow('postgres store does not hold bytes');
    await expect(store.putBytes(key, new Uint8Array([1]), 'image/webp')).rejects.toThrow(
      'postgres store does not hold bytes',
    );
    await expect(store.deleteBytes(key)).rejects.toThrow('postgres store does not hold bytes');

    await store.deleteJson(key);
    await expect(store.getJson(key)).resolves.toBeNull();
  });
});
