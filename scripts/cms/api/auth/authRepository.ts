import { and, count, eq, gt, isNull, sql } from 'drizzle-orm';
import type { CmsDatabase } from '../db/client.ts';
import { sessions, type CmsRole, users } from '../db/schema.ts';
export type UserRecord = typeof users.$inferSelect;
export type SessionRecord = typeof sessions.$inferSelect;
export type CreateUser = { login: string; passwordHash: string; role: CmsRole; isActive?: boolean };
export type UpdateUser = { login?: string; passwordHash?: string; role?: CmsRole; isActive?: boolean };
export type NewSession = { userId: string; tokenHash: string; expiresAt: Date };
export type SessionWithUser = { session: SessionRecord; user: UserRecord };
export type AuthRepository = {
  findUserByLogin(login: string): Promise<UserRecord | null>;
  listUsers(): Promise<UserRecord[]>;
  createUser(input: CreateUser): Promise<UserRecord>;
  updateUser(id: string, patch: UpdateUser): Promise<UserRecord | null>;
  deleteUser(id: string): Promise<void>;
  countActiveAdmins(): Promise<number>;
  createSession(input: NewSession): Promise<SessionRecord>;
  findActiveSession(tokenHash: string, now: Date): Promise<SessionWithUser | null>;
  revokeSession(id: string): Promise<void>;
  revokeUserSessions(userId: string): Promise<void>;
};
export function createAuthRepository(db: CmsDatabase): AuthRepository {
  return {
    async findUserByLogin(login) {
      const [user] = await db.select().from(users)
        .where(sql`lower(${users.login}) = lower(${login})`).limit(1);
      return user ?? null;
    },
    async listUsers() {
      return db.select().from(users);
    },
    async createUser(input) {
      const [user] = await db.insert(users).values(input).returning();
      if (user == null) throw new Error('User creation did not return a record');
      return user;
    },
    async updateUser(id, patch) {
      return db.transaction(async (tx) => {
        const [user] = await tx.update(users).set({ ...patch, updatedAt: new Date() })
          .where(eq(users.id, id)).returning();
        if (user == null) return null;
        await tx.update(sessions).set({ revokedAt: new Date() })
          .where(and(eq(sessions.userId, id), isNull(sessions.revokedAt)));
        return user;
      });
    },
    async deleteUser(id) {
      await db.transaction(async (tx) => {
        await tx.update(sessions).set({ revokedAt: new Date() })
          .where(and(eq(sessions.userId, id), isNull(sessions.revokedAt)));
        await tx.delete(users).where(eq(users.id, id));
      });
    },
    async countActiveAdmins() {
      const [result] = await db.select({ value: count() }).from(users)
        .where(and(eq(users.role, 'admin'), eq(users.isActive, true)));
      return result?.value ?? 0;
    },
    async createSession(input) {
      const [session] = await db.insert(sessions).values(input).returning();
      if (session == null) throw new Error('Session creation did not return a record');
      return session;
    },
    async findActiveSession(tokenHash, now) {
      const [result] = await db.select({ session: sessions, user: users }).from(sessions)
        .innerJoin(users, eq(sessions.userId, users.id))
        .where(and(
          eq(sessions.tokenHash, tokenHash),
          isNull(sessions.revokedAt),
          gt(sessions.expiresAt, now),
          eq(users.isActive, true),
        )).limit(1);
      return result ?? null;
    },
    async revokeSession(id) {
      await db.update(sessions).set({ revokedAt: new Date() })
        .where(and(eq(sessions.id, id), isNull(sessions.revokedAt)));
    },
    async revokeUserSessions(userId) {
      await db.update(sessions).set({ revokedAt: new Date() })
        .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)));
    },
  };
}
