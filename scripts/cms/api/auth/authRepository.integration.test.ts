/** @vitest-environment node */
import { createHash, randomUUID } from 'node:crypto';
import { afterAll, afterEach, describe, expect, it } from 'vitest';
import { eq, inArray } from 'drizzle-orm';
import { createAuthRepository } from './authRepository.ts';
import { createDatabase } from '../db/client.ts';
import { sessions, users } from '../db/schema.ts';
import { withOnlyActiveAdmins } from '../withOnlyActiveAdmins.ts';

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
if (testDatabaseUrl == null || testDatabaseUrl.trim() === '') {
  throw new Error('TEST_DATABASE_URL is required for auth repository integration tests');
}

const testDatabase = new URL(testDatabaseUrl);
if (!['127.0.0.1', 'localhost'].includes(testDatabase.hostname)) {
  throw new Error('TEST_DATABASE_URL must point to a local database');
}

const testRunPrefix = `task3-${randomUUID().replaceAll('-', '')}`;
const testLogin = (suffix: string) => `${testRunPrefix}-${suffix}`;
const testTokenHash = (suffix: string) => createHash('sha256').update(`${testRunPrefix}:${suffix}`).digest('hex');
const database = createDatabase({ url: testDatabaseUrl, ssl: false, maxConnections: 1 });
const repo = createAuthRepository(database.db);
const createdUserIds = new Set<string>();

async function createTestUser(input: {
  login: string;
  passwordHash: string;
  role: 'admin' | 'editor';
  isActive?: boolean;
}) {
  const user = await repo.createUser(input);
  createdUserIds.add(user.id);
  return user;
}

afterEach(async () => {
  if (createdUserIds.size === 0) return;
  const userIds = [...createdUserIds];
  await database.db.delete(sessions).where(inArray(sessions.userId, userIds));
  await database.db.delete(users).where(inArray(users.id, userIds));
  createdUserIds.clear();
});

afterAll(async () => {
  await database.close();
});

describe('AuthRepository', () => {
  it('finds login case-insensitively', async () => {
    const login = testLogin('Manager');
    await createTestUser({ login, passwordHash: 'hash', role: 'editor' });

    expect((await repo.findUserByLogin(login.toLowerCase()))?.login).toBe(login);
  });

  it('does not return a revoked session', async () => {
    const user = await createTestUser({ login: testLogin('admin'), passwordHash: 'hash', role: 'admin' });
    const tokenHash = testTokenHash('revoked');
    const session = await repo.createSession({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 60_000),
    });

    await repo.revokeSession(session.id);

    expect(await repo.findActiveSession(tokenHash, new Date())).toBeNull();
  });

  it('does not return an expired session', async () => {
    const user = await createTestUser({ login: testLogin('expired'), passwordHash: 'hash', role: 'editor' });
    const tokenHash = testTokenHash('expired');
    await repo.createSession({ userId: user.id, tokenHash, expiresAt: new Date(Date.now() - 1) });

    expect(await repo.findActiveSession(tokenHash, new Date())).toBeNull();
  });

  it('does not return a session joined to an inactive user', async () => {
    const user = await createTestUser({
      login: testLogin('inactive'), passwordHash: 'hash', role: 'editor', isActive: false,
    });
    const tokenHash = testTokenHash('inactive');
    await repo.createSession({ userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 60_000) });

    expect(await repo.findActiveSession(tokenHash, new Date())).toBeNull();
  });

  it('revokes every target session when updating a user', async () => {
    const user = await createTestUser({ login: testLogin('editor'), passwordHash: 'hash', role: 'editor' });
    const tokenHash = testTokenHash('updated');
    await repo.createSession({ userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 60_000) });

    const updated = await repo.updateUser(user.id, { role: 'admin' });

    expect(updated).toMatchObject({ id: user.id, role: 'admin' });
    expect(await repo.findActiveSession(tokenHash, new Date())).toBeNull();
  });

  it('revokes a target user session before deleting the user in one transaction', async () => {
    const user = await createTestUser({ login: testLogin('deleted'), passwordHash: 'hash', role: 'editor' });
    const tokenHash = testTokenHash('deleted');
    await repo.createSession({ userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 60_000) });

    await repo.deleteUser(user.id);

    expect(await repo.findUserByLogin(testLogin('deleted'))).toBeNull();
    expect(await database.db.select().from(sessions).where(eq(sessions.userId, user.id))).toEqual([]);
  });

  it('counts only active administrators', async () => {
    const active = await createTestUser({
      login: testLogin('active-admin'),
      passwordHash: 'hash',
      role: 'admin',
    });
    await createTestUser({
      login: testLogin('inactive-admin'),
      passwordHash: 'hash',
      role: 'admin',
      isActive: false,
    });
    await createTestUser({ login: testLogin('editor'), passwordHash: 'hash', role: 'editor' });

    await withOnlyActiveAdmins(database.db, [active.id], async () => {
      expect(await repo.countActiveAdmins()).toBe(1);
    });
  });

  it('lists persisted users', async () => {
    const login = testLogin('manager');
    await createTestUser({ login, passwordHash: 'hash', role: 'editor' });

    expect((await repo.listUsers()).map((user) => user.login)).toEqual(expect.arrayContaining([login]));
  });

  it('revokes every target user session', async () => {
    const user = await createTestUser({ login: testLogin('bulk-revoked'), passwordHash: 'hash', role: 'editor' });
    const tokenHash = testTokenHash('bulk-revoked');
    await repo.createSession({ userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 60_000) });

    await repo.revokeUserSessions(user.id);

    expect(await repo.findActiveSession(tokenHash, new Date())).toBeNull();
  });

  it('returns null when updating a missing user', async () => {
    expect(await repo.updateUser('00000000-0000-0000-0000-000000000000', { role: 'editor' })).toBeNull();
  });

  it('demotes an inactive admin when another active admin exists', async () => {
    const active = await createTestUser({ login: testLogin('active-keep'), passwordHash: 'hash', role: 'admin' });
    const inactive = await createTestUser({
      login: testLogin('inactive-demote'), passwordHash: 'hash', role: 'admin', isActive: false,
    });

    await withOnlyActiveAdmins(database.db, [active.id], async () => {
      await expect(repo.updateUser(inactive.id, { role: 'editor' })).resolves.toMatchObject({
        id: inactive.id,
        role: 'editor',
      });
    });
  });

  it('deletes an inactive admin when another active admin exists', async () => {
    const active = await createTestUser({ login: testLogin('active-keep-del'), passwordHash: 'hash', role: 'admin' });
    const inactive = await createTestUser({
      login: testLogin('inactive-delete'), passwordHash: 'hash', role: 'admin', isActive: false,
    });

    await withOnlyActiveAdmins(database.db, [active.id], async () => {
      await expect(repo.deleteUser(inactive.id)).resolves.toBeUndefined();
      expect(await repo.findUserByLogin(inactive.login)).toBeNull();
    });
  });

  it('does not demote the last active admin', async () => {
    const admin = await createTestUser({ login: testLogin('last-demote'), passwordHash: 'hash', role: 'admin' });

    await withOnlyActiveAdmins(database.db, [admin.id], async () => {
      await expect(repo.updateUser(admin.id, { role: 'editor' })).rejects.toMatchObject({ message: 'last_admin' });
      expect((await repo.findUserByLogin(admin.login))?.role).toBe('admin');
    });
  });

  it('does not delete the last active admin', async () => {
    const admin = await createTestUser({ login: testLogin('last-delete'), passwordHash: 'hash', role: 'admin' });

    await withOnlyActiveAdmins(database.db, [admin.id], async () => {
      await expect(repo.deleteUser(admin.id)).rejects.toMatchObject({ message: 'last_admin' });
      expect(await repo.findUserByLogin(admin.login)).not.toBeNull();
    });
  });
});
