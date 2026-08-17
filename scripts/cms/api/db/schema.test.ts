import { getTableColumns } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { auditLog, sessions, users } from './schema.ts';

describe('auth schema', () => {
  it('exposes revocable session columns', () => {
    expect(Object.keys(getTableColumns(sessions))).toEqual(expect.arrayContaining([
      'id', 'userId', 'tokenHash', 'expiresAt', 'revokedAt', 'createdAt',
    ]));
  });

  it('keeps audit payload separate from public data', () => {
    expect(Object.keys(getTableColumns(auditLog))).toEqual(expect.arrayContaining([
      'actorUserId', 'action', 'entityType', 'entityId', 'payload', 'createdAt',
    ]));
  });

  it('stores role and password hash on users', () => {
    expect(Object.keys(getTableColumns(users))).toEqual(expect.arrayContaining([
      'login', 'passwordHash', 'role', 'isActive',
    ]));
  });
});
