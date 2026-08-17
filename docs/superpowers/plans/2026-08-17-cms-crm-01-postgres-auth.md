# PostgreSQL and Revocable Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introduce PostgreSQL 17 and move CMS users and sessions from S3/signed-cookie state into transactional, revocable database state.

**Architecture:** A small `db` package owns the Drizzle client and schema; repositories isolate SQL from Hono routes. Authentication keeps the existing `/api/cms/*` contract, but the cookie carries an opaque token whose hash is stored in PostgreSQL.

**Tech Stack:** PostgreSQL 17, Docker Compose, Drizzle ORM/Kit, `postgres`, Hono, Zod, Node crypto, Vitest.

## Global Constraints

- PostgreSQL version is 17 locally and in Timeweb Cloud.
- IDs are UUIDs; timestamps are UTC; UI timezone remains `Asia/Vladivostok`.
- `admin` and `editor` are the only phase-one roles.
- Password hashes and session token hashes are never logged.
- Production cookies use `Secure`, `HttpOnly`, `SameSite=Lax`, `Path=/`.
- Existing S3 user data remains readable until the one-time import succeeds; no new user writes go to S3 afterward.
- Do not modify external services or commit without explicit approval.

---

### Task 1: Local PostgreSQL 17 runtime and configuration

**Files:**
- Modify: `package.json`
- Modify: `.env.cms-dev.example`
- Create: `docker-compose.cms.yml`
- Create: `drizzle.config.ts`
- Create: `scripts/cms/api/db/config.ts`
- Test: `scripts/cms/api/db/config.test.ts`

**Interfaces:**
- Produces: `loadDatabaseConfig(env): DatabaseConfig` where `DatabaseConfig = { url: string; ssl: boolean; maxConnections: number }`.
- Produces: npm scripts `db:up`, `db:down`, `db:generate`, `db:migrate`, `db:check`.

- [ ] **Step 1: Add a failing configuration test**

```ts
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
```

- [ ] **Step 2: Verify the test fails**

Run: `npm.cmd test -- scripts/cms/api/db/config.test.ts`

Expected: FAIL because `./config.ts` does not exist.

- [ ] **Step 3: Add dependencies and scripts**

Add runtime dependencies `drizzle-orm`, `postgres` and dev dependency `drizzle-kit`. Add scripts:

```json
{
  "db:up": "docker compose -f docker-compose.cms.yml up -d postgres",
  "db:down": "docker compose -f docker-compose.cms.yml down",
  "db:generate": "drizzle-kit generate",
  "db:migrate": "tsx scripts/cms/api/db/migrate.ts",
  "db:check": "drizzle-kit check"
}
```

Create `docker-compose.cms.yml`:

```yaml
services:
  postgres:
    image: postgres:17-alpine
    environment:
      POSTGRES_DB: vkrainosti
      POSTGRES_USER: vkrainosti
      POSTGRES_PASSWORD: local-vkrainosti-only
    ports:
      - "127.0.0.1:54327:5432"
    volumes:
      - vkrainosti_pg17:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U vkrainosti -d vkrainosti"]
      interval: 2s
      timeout: 2s
      retries: 20
volumes:
  vkrainosti_pg17:
```

Add to `.env.cms-dev.example` without real credentials:

```dotenv
DATABASE_URL=postgres://vkrainosti:local-vkrainosti-only@127.0.0.1:54327/vkrainosti
DATABASE_SSL=false
DATABASE_MAX_CONNECTIONS=10
CMS_COOKIE_SECURE=false
```

- [ ] **Step 4: Implement strict database config**

```ts
export type DatabaseConfig = { url: string; ssl: boolean; maxConnections: number };

export function loadDatabaseConfig(env: Record<string, string | undefined>): DatabaseConfig {
  const url = env.DATABASE_URL?.trim();
  if (!url) throw new Error('DATABASE_URL is required');
  const parsedMax = Number.parseInt(env.DATABASE_MAX_CONNECTIONS ?? '10', 10);
  if (!Number.isInteger(parsedMax) || parsedMax < 1 || parsedMax > 50) {
    throw new Error('DATABASE_MAX_CONNECTIONS must be between 1 and 50');
  }
  return { url, ssl: env.DATABASE_SSL === 'true', maxConnections: parsedMax };
}
```

- [ ] **Step 5: Run focused verification**

Run: `npm.cmd test -- scripts/cms/api/db/config.test.ts`

Expected: 2 tests PASS.

- [ ] **Step 6: Proposed commit checkpoint**

```bash
git add package.json package-lock.json .env.cms-dev.example docker-compose.cms.yml drizzle.config.ts scripts/cms/api/db/config.ts scripts/cms/api/db/config.test.ts
git commit -m "build: add postgres 17 cms runtime"
```

Do not run the commit commands unless the user explicitly authorizes commits.

---

### Task 2: Users, sessions and audit schema

**Files:**
- Create: `scripts/cms/api/db/schema.ts`
- Create: `scripts/cms/api/db/schema.test.ts`
- Create: `scripts/cms/api/db/migrate.ts`
- Create: `drizzle/0000_auth_foundation.sql`

**Interfaces:**
- Produces tables `users`, `sessions`, `audit_log`.
- Produces enums/types `CmsRole`, `AuditAction`.
- Consumes: `loadDatabaseConfig(process.env)` from Task 1.

- [ ] **Step 1: Write schema contract tests**

```ts
import { getTableColumns } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { auditLog, sessions, users } from './schema.ts';

describe('auth schema', () => {
  it('exposes revocable session columns', () => {
    expect(Object.keys(getTableColumns(sessions))).toEqual(expect.arrayContaining([
      'id', 'userId', 'tokenHash', 'expiresAt', 'revokedAt', 'createdAt'
    ]));
  });
  it('keeps audit payload separate from public data', () => {
    expect(Object.keys(getTableColumns(auditLog))).toEqual(expect.arrayContaining([
      'actorUserId', 'action', 'entityType', 'entityId', 'payload', 'createdAt'
    ]));
  });
  it('stores role and password hash on users', () => {
    expect(Object.keys(getTableColumns(users))).toEqual(expect.arrayContaining([
      'login', 'passwordHash', 'role', 'isActive'
    ]));
  });
});
```

- [ ] **Step 2: Verify the schema test fails**

Run: `npm.cmd test -- scripts/cms/api/db/schema.test.ts`

Expected: FAIL because `schema.ts` does not exist.

- [ ] **Step 3: Define the Drizzle schema**

Use `pgEnum`, `pgTable`, `uuid`, `varchar`, `boolean`, `timestamp`, `jsonb`, `index` and `uniqueIndex`. Required invariants:

```ts
export const cmsRole = pgEnum('cms_role', ['admin', 'editor']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  login: varchar('login', { length: 64 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: cmsRole('role').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex('users_login_ci_uq').on(sql`lower(${table.login})`)]);

export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 64 }).notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const auditLog = pgTable('audit_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  actorUserId: uuid('actor_user_id').references(() => users.id),
  action: varchar('action', { length: 80 }).notNull(),
  entityType: varchar('entity_type', { length: 80 }).notNull(),
  entityId: varchar('entity_id', { length: 128 }),
  payload: jsonb('payload').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
```

- [ ] **Step 4: Generate and inspect the migration**

Run: `npm.cmd run db:generate`

Expected: `drizzle/0000_auth_foundation.sql` creates enum, tables, foreign keys and the case-insensitive login index. Inspect the SQL; do not hand-edit the generated migration after it has been applied anywhere.

- [ ] **Step 5: Implement the migration runner**

```ts
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { loadDatabaseConfig } from './config.ts';

const config = loadDatabaseConfig(process.env);
const client = postgres(config.url, { max: 1, ssl: config.ssl ? 'require' : false });
await migrate(drizzle(client), { migrationsFolder: 'drizzle' });
await client.end();
```

- [ ] **Step 6: Verify schema and migration**

Run: `npm.cmd test -- scripts/cms/api/db/schema.test.ts`

Expected: 3 tests PASS.

Run: `npm.cmd run db:up` then `npm.cmd run db:migrate` then `npm.cmd run db:check`.

Expected: container healthy, migration succeeds, Drizzle reports no schema drift.

- [ ] **Step 7: Proposed commit checkpoint**

```bash
git add scripts/cms/api/db/schema.ts scripts/cms/api/db/schema.test.ts scripts/cms/api/db/migrate.ts drizzle
git commit -m "feat: add cms auth database schema"
```

---

### Task 3: Database client and auth repositories

**Files:**
- Create: `scripts/cms/api/db/client.ts`
- Create: `scripts/cms/api/auth/authRepository.ts`
- Create: `scripts/cms/api/auth/authRepository.integration.test.ts`
- Modify: `scripts/cms/api/password.ts`

**Interfaces:**
- Produces: `createDatabase(config): { db: CmsDatabase; close(): Promise<void> }`.
- Produces: `AuthRepository` with `findUserByLogin`, `createUser`, `updateUser`, `deleteUser`, `countActiveAdmins`, `createSession`, `findActiveSession`, `revokeSession`, `revokeUserSessions`.
- Session methods consume and return token hashes, never raw tokens.

- [ ] **Step 1: Add failing repository integration tests**

```ts
it('finds login case-insensitively', async () => {
  await repo.createUser({ login: 'Manager', passwordHash: 'hash', role: 'editor' });
  expect((await repo.findUserByLogin('manager'))?.login).toBe('Manager');
});

it('does not return a revoked session', async () => {
  const user = await repo.createUser({ login: 'admin', passwordHash: 'hash', role: 'admin' });
  const session = await repo.createSession({ userId: user.id, tokenHash: 'a'.repeat(64), expiresAt: new Date(Date.now() + 60_000) });
  await repo.revokeSession(session.id);
  expect(await repo.findActiveSession('a'.repeat(64), new Date())).toBeNull();
});
```

Use `TEST_DATABASE_URL`; fail fast with a clear message when it is absent rather than silently using production.

- [ ] **Step 2: Verify integration tests fail**

Run: `$env:TEST_DATABASE_URL='postgres://vkrainosti:local-vkrainosti-only@127.0.0.1:54327/vkrainosti'; npm.cmd test -- scripts/cms/api/auth/authRepository.integration.test.ts`

Expected: FAIL because repository modules do not exist.

- [ ] **Step 3: Implement database lifecycle**

```ts
export function createDatabase(config: DatabaseConfig) {
  const client = postgres(config.url, { max: config.maxConnections, ssl: config.ssl ? 'require' : false });
  return { db: drizzle(client, { schema }), close: () => client.end() };
}
export type CmsDatabase = ReturnType<typeof createDatabase>['db'];
```

- [ ] **Step 4: Implement the repository contract**

```ts
export type AuthRepository = {
  findUserByLogin(login: string): Promise<UserRecord | null>;
  listUsers(): Promise<UserRecord[]>;
  createUser(input: CreateUser): Promise<UserRecord>;
  updateUser(id: string, patch: UpdateUser): Promise<UserRecord>;
  deleteUser(id: string): Promise<void>;
  countActiveAdmins(): Promise<number>;
  createSession(input: NewSession): Promise<SessionRecord>;
  findActiveSession(tokenHash: string, now: Date): Promise<SessionWithUser | null>;
  revokeSession(id: string): Promise<void>;
  revokeUserSessions(userId: string): Promise<void>;
};
```

Implement each method with Drizzle parameter binding and return `null` for missing rows. `updateUser` and `deleteUser` must revoke the target user's sessions in the same database transaction.

- [ ] **Step 5: Run repository tests**

Run the Task 3 integration command again.

Expected: case-insensitive login and session revocation tests PASS.

- [ ] **Step 6: Run existing password tests**

Run: `npm.cmd test -- scripts/cms/api/password.test.ts`

Expected: existing hashing and verification tests PASS; no hash format regression.

- [ ] **Step 7: Proposed commit checkpoint**

```bash
git add scripts/cms/api/db/client.ts scripts/cms/api/auth scripts/cms/api/password.ts
git commit -m "feat: add postgres auth repositories"
```

---

### Task 4: Opaque server sessions in Hono

**Files:**
- Rewrite: `scripts/cms/api/session.ts`
- Modify: `scripts/cms/api/app.ts`
- Modify: `scripts/cms/api/env.ts`
- Modify: `scripts/cms/api/server.ts`
- Test: `scripts/cms/api/session.test.ts`
- Test: `scripts/cms/api/app.test.ts`

**Interfaces:**
- Produces: `createRawSessionToken(): string`, `hashSessionToken(raw): string`.
- `createCmsApiApp` consumes `{ env, store, authRepository, db }` during the transition.
- Cookie name remains `vkr_cms_session`; frontend API compatibility remains unchanged.

- [ ] **Step 1: Replace signed-token tests with opaque-token tests**

```ts
it('hashes the token deterministically without exposing it', () => {
  const raw = createRawSessionToken();
  expect(raw).toMatch(/^[A-Za-z0-9_-]{43}$/);
  expect(hashSessionToken(raw)).toMatch(/^[a-f0-9]{64}$/);
  expect(hashSessionToken(raw)).not.toContain(raw);
});
```

Add API assertions: login sets `HttpOnly` and `SameSite=Lax`; logout revokes the DB session; changing a user's role invalidates their old cookie; inactive users receive 401.

- [ ] **Step 2: Verify the new tests fail**

Run: `npm.cmd test -- scripts/cms/api/session.test.ts scripts/cms/api/app.test.ts`

Expected: FAIL because current cookie contains a signed role claim and sessions are not revocable.

- [ ] **Step 3: Implement opaque token helpers**

```ts
import { createHash, randomBytes } from 'node:crypto';

export const CMS_SESSION_COOKIE = 'vkr_cms_session';
export const CMS_SESSION_TTL_MS = 12 * 60 * 60 * 1000;
export const createRawSessionToken = () => randomBytes(32).toString('base64url');
export const hashSessionToken = (raw: string) => createHash('sha256').update(raw).digest('hex');
```

- [ ] **Step 4: Move login, auth middleware and logout to the repository**

Login sequence: find active user, verify password, create raw token, persist only its hash, set raw token cookie. Middleware hashes the cookie, loads an active non-expired session joined to an active user, and derives current role from the user row. Logout revokes the matching session before deleting the cookie.

Cookie settings:

```ts
const cookieOptions = {
  path: '/', httpOnly: true, sameSite: 'Lax' as const,
  secure: env.cookieSecure,
  maxAge: Math.floor(CMS_SESSION_TTL_MS / 1000),
};
```

Extend `CmsApiEnv` with `database` and `cookieSecure`; remove the requirement that users be present in environment variables after the import path is available.

- [ ] **Step 5: Preserve last-admin and self-delete rules transactionally**

User update/delete endpoints call repository transactions, return existing error codes (`last_admin`, `cannot_delete_self`), and append audit records. Role/password changes revoke all target-user sessions after the transaction succeeds.

- [ ] **Step 6: Verify auth behavior**

Run: `npm.cmd test -- scripts/cms/api/session.test.ts scripts/cms/api/app.test.ts scripts/cms/api/password.test.ts`

Expected: all auth tests PASS; old signed-cookie behavior is no longer asserted.

- [ ] **Step 7: Proposed commit checkpoint**

```bash
git add scripts/cms/api/session.ts scripts/cms/api/app.ts scripts/cms/api/env.ts scripts/cms/api/server.ts scripts/cms/api/*.test.ts
git commit -m "feat: make cms sessions revocable"
```

---

### Task 5: Seed/import existing users and close the S3 write path

**Files:**
- Create: `scripts/cms/import-users-to-postgres.ts`
- Create: `scripts/cms/import-users-to-postgres.test.ts`
- Modify: `scripts/cms/api/server.ts`
- Modify: `.env.cms-dev.example`
- Retain read-only during transition: `scripts/cms/api/usersStore.ts`

**Interfaces:**
- Produces CLI result `{ inserted: number; skipped: number; admins: number }`.
- Import is idempotent by case-insensitive login and never overwrites an existing database password.

- [ ] **Step 1: Write importer tests**

```ts
it('imports each S3 user once and keeps an existing database user', async () => {
  const result1 = await importUsers(sourceUsers, repo);
  const result2 = await importUsers(sourceUsers, repo);
  expect(result1.inserted).toBe(2);
  expect(result2).toMatchObject({ inserted: 0, skipped: 2 });
});
```

- [ ] **Step 2: Verify failure**

Run: `npm.cmd test -- scripts/cms/import-users-to-postgres.test.ts`

Expected: FAIL because importer does not exist.

- [ ] **Step 3: Implement dry-run-first importer**

Expose pure `importUsers(users, repo)` for tests. CLI requires `--apply` to write; without it, print logins/roles and counts only. Refuse `--apply` when the resulting database would contain zero active admins.

- [ ] **Step 4: Switch server composition**

`server.ts` creates the database, repositories and Hono app; it closes the PostgreSQL client on `SIGINT`/`SIGTERM`. `usersStore.ts` is no longer imported by request handlers. Keep the file temporarily for controlled import and delete it only in Plan 4 after migration evidence exists.

- [ ] **Step 5: Run the complete Plan 1 gate**

Run:

```powershell
npm.cmd run db:check
npm.cmd test -- scripts/cms/api/db scripts/cms/api/auth scripts/cms/api/session.test.ts scripts/cms/api/password.test.ts scripts/cms/api/app.test.ts scripts/cms/import-users-to-postgres.test.ts
npm.cmd run lint -- --quiet scripts/cms/api scripts/cms/import-users-to-postgres.ts
```

Expected: schema check clean; all focused tests PASS; focused lint has zero errors.

- [ ] **Step 6: Manual revocation smoke test**

Login as an editor, confirm `/api/cms/me` returns 200, change that user's role as admin, then repeat `/api/cms/me` with the old cookie.

Expected: old cookie returns 401; a new login reflects the current role.

- [ ] **Step 7: Proposed commit checkpoint**

```bash
git add scripts/cms/import-users-to-postgres.ts scripts/cms/import-users-to-postgres.test.ts scripts/cms/api/server.ts .env.cms-dev.example
git commit -m "feat: migrate cms users to postgres"
```

## Plan 1 exit gate

- PostgreSQL 17 starts locally and all migrations apply from an empty database.
- Existing CMS login and user-management UI works without API shape changes.
- Sessions are revocable and role changes take effect immediately.
- No request path writes users or sessions to S3.
- Focused tests and lint are green.
