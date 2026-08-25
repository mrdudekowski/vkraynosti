import { and, eq, inArray, notInArray, sql } from 'drizzle-orm';
import type { CmsDatabase } from './db/client.ts';
import { users } from './db/schema.ts';

/** Один ключ на локальную БД: last-admin сценарии не деактивируют чужих админов параллельно. */
const ACTIVE_ADMIN_TEST_LOCK = 872_001;

export async function withOnlyActiveAdmins<T>(
  db: CmsDatabase,
  keepIds: string[],
  run: () => Promise<T>,
): Promise<T> {
  await db.execute(sql`select pg_advisory_lock(${ACTIVE_ADMIN_TEST_LOCK})`);
  const others = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.role, 'admin'), eq(users.isActive, true), notInArray(users.id, keepIds)));
  const otherIds = others.map((row) => row.id);
  if (otherIds.length > 0) {
    await db.update(users).set({ isActive: false }).where(inArray(users.id, otherIds));
  }
  try {
    return await run();
  } finally {
    if (otherIds.length > 0) {
      await db.update(users).set({ isActive: true }).where(inArray(users.id, otherIds));
    }
    await db.execute(sql`select pg_advisory_unlock(${ACTIVE_ADMIN_TEST_LOCK})`);
  }
}
