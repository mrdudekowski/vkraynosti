/** @vitest-environment node */
import { afterAll, afterEach, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { createAuthRepository } from './authRepository.ts';
import { createDatabase } from '../db/client.ts';
import { sessions, users } from '../db/schema.ts';

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
if (testDatabaseUrl == null || testDatabaseUrl.trim() === '') {
  throw new Error('TEST_DATABASE_URL is required for auth repository integration tests');
}

const testDatabase = new URL(testDatabaseUrl);
if (!['127.0.0.1', 'localhost'].includes(testDatabase.hostname)) {
  throw new Error('TEST_DATABASE_URL must point to a local database');
}

const database = createDatabase({ url: testDatabaseUrl, ssl: false, maxConnections: 1 });
const repo = createAuthRepository(database.db);

afterEach(async () => {
  await database.db.delete(sessions);
  await database.db.delete(users);
});

afterAll(async () => {
  await database.close();
});

describe('AuthRepository', () => {
  it('finds login case-insensitively', async () => {
    await repo.createUser({ login: 'Manager', passwordHash: 'hash', role: 'editor' });

    expect((await repo.findUserByLogin('manager'))?.login).toBe('Manager');
  });

  it('does not return a revoked session', async () => {
    const user = await repo.createUser({ login: 'admin', passwordHash: 'hash', role: 'admin' });
    const session = await repo.createSession({
      userId: user.id,
      tokenHash: 'a'.repeat(64),
      expiresAt: new Date(Date.now() + 60_000),
    });

    await repo.revokeSession(session.id);

    expect(await repo.findActiveSession('a'.repeat(64), new Date())).toBeNull();
  });

  it('revokes every target session when updating a user', async () => {
    const user = await repo.createUser({ login: 'editor', passwordHash: 'hash', role: 'editor' });
    await repo.createSession({
      userId: user.id,
      tokenHash: 'b'.repeat(64),
      expiresAt: new Date(Date.now() + 60_000),
    });

    const updated = await repo.updateUser(user.id, { role: 'admin' });

    expect(updated).toMatchObject({ id: user.id, role: 'admin' });
    expect(await repo.findActiveSession('b'.repeat(64), new Date())).toBeNull();
  });

  it('revokes a target user session before deleting the user in one transaction', async () => {
    const user = await repo.createUser({ login: 'editor', passwordHash: 'hash', role: 'editor' });
    await repo.createSession({
      userId: user.id,
      tokenHash: 'c'.repeat(64),
      expiresAt: new Date(Date.now() + 60_000),
    });

    await repo.deleteUser(user.id);

    expect(await repo.findUserByLogin('editor')).toBeNull();
    expect(await database.db.select().from(sessions).where(eq(sessions.userId, user.id))).toEqual([]);
  });

  it('counts only active administrators', async () => {
    await repo.createUser({ login: 'active-admin', passwordHash: 'hash', role: 'admin' });
    await repo.createUser({ login: 'inactive-admin', passwordHash: 'hash', role: 'admin', isActive: false });
    await repo.createUser({ login: 'editor', passwordHash: 'hash', role: 'editor' });

    expect(await repo.countActiveAdmins()).toBe(1);
  });

  it('lists persisted users', async () => {
    await repo.createUser({ login: 'manager', passwordHash: 'hash', role: 'editor' });

    expect((await repo.listUsers()).map((user) => user.login)).toEqual(['manager']);
  });

  it('revokes every target user session', async () => {
    const user = await repo.createUser({ login: 'editor', passwordHash: 'hash', role: 'editor' });
    await repo.createSession({
      userId: user.id,
      tokenHash: 'd'.repeat(64),
      expiresAt: new Date(Date.now() + 60_000),
    });

    await repo.revokeUserSessions(user.id);

    expect(await repo.findActiveSession('d'.repeat(64), new Date())).toBeNull();
  });

  it('returns null when updating a missing user', async () => {
    expect(await repo.updateUser('00000000-0000-0000-0000-000000000000', { role: 'editor' })).toBeNull();
  });

});
