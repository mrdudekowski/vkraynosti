import { eq } from 'drizzle-orm';
import type { CmsDatabase } from './db/client.ts';
import { cmsJson } from './db/schema.ts';
import type { CmsJsonStore } from './store.ts';

const POSTGRES_BYTES_ERROR = 'postgres store does not hold bytes';

export function createPostgresJsonStore(db: CmsDatabase): CmsJsonStore {
  return {
    async getJson(key) {
      const rows = await db.select().from(cmsJson).where(eq(cmsJson.key, key)).limit(1);
      return rows[0]?.value ?? null;
    },
    async putJson(key, value) {
      const updatedAt = new Date();
      await db
        .insert(cmsJson)
        .values({ key, value, updatedAt })
        .onConflictDoUpdate({
          target: cmsJson.key,
          set: { value, updatedAt },
        });
    },
    async deleteJson(key) {
      await db.delete(cmsJson).where(eq(cmsJson.key, key));
    },
    async getBytes() {
      throw new Error(POSTGRES_BYTES_ERROR);
    },
    async putBytes() {
      throw new Error(POSTGRES_BYTES_ERROR);
    },
    async deleteBytes() {
      throw new Error(POSTGRES_BYTES_ERROR);
    },
  };
}
