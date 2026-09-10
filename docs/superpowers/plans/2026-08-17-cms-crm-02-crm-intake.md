# CRM Core and Lead Intake Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `private/crm.json` runtime writes with PostgreSQL people, deals, touches and payments, then route site and Mini App requests through one idempotent API with reliable Telegram delivery.

**Architecture:** CRM repositories operate per entity inside database transactions. The public intake service normalizes identity, records the idempotency key, creates or reuses a person, creates one deal and enqueues a Telegram notification atomically; a separate worker delivers the outbox.

**Tech Stack:** PostgreSQL 17, Drizzle ORM, Hono, Zod, React 19, Vitest, Playwright, Telegram Bot API.

## Global Constraints

- Release 1 exit gate in `2026-08-17-cms-schedule-release-one.md` is green before starting.
- CRM consumes existing `tours.id` and `tour_departures.id`; it does not re-own or reimplement catalog/schedule publication.
- Phone identity uses E.164; only an exact normalized phone is auto-merged.
- Money uses `BIGINT` kopecks and RUB; JavaScript API serializes money as decimal strings.
- Payments are immutable; corrections use a compensating payment/refund.
- People and deals are archived, not physically deleted from UI.
- Every mutation validates an optimistic `version`; stale writes return HTTP 409.
- A Telegram failure never rolls back or loses an accepted lead.
- No production external calls, S3 writes or commits without explicit approval.

---

### Task 1: CRM relational schema and migrations

**Files:**
- Modify: `scripts/cms/api/db/schema.ts`
- Modify: `scripts/cms/api/db/schema.test.ts`
- Create: `drizzle/0003_crm_core.sql`

**Interfaces:**
- Produces tables `people`, `deals`, `touches`, `payments`, `inbound_requests`, `notification_outbox`.
- Produces enums `deal_stage`, `deal_kind`, `touch_kind`, `payment_kind`, `outbox_status`.

- [ ] **Step 1: Add failing schema tests**

```ts
it('stores people and multiple versioned deals', () => {
  expect(Object.keys(getTableColumns(people))).toEqual(expect.arrayContaining([
    'id', 'phoneE164', 'phoneRaw', 'email', 'source', 'version', 'archivedAt'
  ]));
  expect(Object.keys(getTableColumns(deals))).toEqual(expect.arrayContaining([
    'personId', 'kind', 'stage', 'priceKopecks', 'nextStep', 'nextStepAt', 'version'
  ]));
});

it('models immutable money and idempotent inbound requests', () => {
  expect(Object.keys(getTableColumns(payments))).toEqual(expect.arrayContaining([
    'dealId', 'amountKopecks', 'kind', 'occurredAt', 'createdBy'
  ]));
  expect(Object.keys(getTableColumns(inboundRequests))).toContain('idempotencyKey');
});
```

- [ ] **Step 2: Verify failure**

Run: `npm.cmd test -- scripts/cms/api/db/schema.test.ts`

Expected: FAIL because CRM tables are absent.

- [ ] **Step 3: Add schema with exact invariants**

Use these enum values:

```ts
export const dealStage = pgEnum('deal_stage', [
  'new', 'in_progress', 'prepaid', 'closed', 'no_answer', 'declined'
]);
export const dealKind = pgEnum('deal_kind', ['tour', 'individual']);
export const paymentKind = pgEnum('payment_kind', ['payment', 'refund']);
export const touchKind = pgEnum('touch_kind', ['call', 'message', 'note']);
```

Required database constraints and indexes:

- partial unique index on `people.phone_e164 WHERE phone_e164 IS NOT NULL AND archived_at IS NULL`;
- check `amount_kopecks > 0` for every payment/refund row;
- unique `inbound_requests.idempotency_key`;
- index `deals(stage, next_step_at)` for manager queue;
- index `deals(person_id)` and `payments(deal_id, occurred_at)`;
- `version INTEGER NOT NULL DEFAULT 1` on people and deals;
- all timestamps use `withTimezone: true`.

- [ ] **Step 4: Generate and inspect migration**

Run: `npm.cmd run db:generate`

Expected: `drizzle/0003_crm_core.sql` contains all six tables, FKs, checks, unique constraints and queue indexes.

- [ ] **Step 5: Apply and verify**

Run: `npm.cmd run db:migrate` then `npm.cmd run db:check` then `npm.cmd test -- scripts/cms/api/db/schema.test.ts`.

Expected: migration and tests PASS with no drift.

- [ ] **Step 6: Proposed commit checkpoint**

```bash
git add scripts/cms/api/db/schema.ts scripts/cms/api/db/schema.test.ts drizzle/0003_crm_core.sql
git commit -m "feat: add relational crm schema"
```

---

### Task 2: Phone normalization and CRM domain contracts

**Files:**
- Create: `src/crm/normalizePhone.ts`
- Create: `src/crm/normalizePhone.test.ts`
- Create: `src/crm/crmTypes.ts`
- Create: `src/crm/dealBalance.ts`
- Create: `src/crm/dealBalance.test.ts`
- Retain temporarily: `src/crm/crmDocument.ts`

**Interfaces:**
- Produces: `normalizeRussianPhone(raw: string): string | null`.
- Produces DTOs `CrmPersonDto`, `CrmDealDto`, `CrmTouchDto`, `CrmPaymentDto`, `ManagerQueueDto`.
- Produces: `calculateDealBalance(priceKopecks: string, payments): { paidKopecks: string; balanceKopecks: string }`.

- [ ] **Step 1: Write failing phone tests**

```ts
it.each([
  ['8 (914) 123-45-67', '+79141234567'],
  ['+7 914 123 45 67', '+79141234567'],
  ['79141234567', '+79141234567'],
])('normalizes %s', (raw, expected) => {
  expect(normalizeRussianPhone(raw)).toBe(expected);
});

it.each(['', '12345', '+1 202 555 0100'])('does not invent a Russian identity for %s', (raw) => {
  expect(normalizeRussianPhone(raw)).toBeNull();
});
```

- [ ] **Step 2: Write failing balance tests**

```ts
expect(calculateDealBalance('100000', [
  { kind: 'payment', amountKopecks: '40000' },
  { kind: 'refund', amountKopecks: '10000' },
])).toEqual({ paidKopecks: '30000', balanceKopecks: '70000' });
```

- [ ] **Step 3: Verify tests fail**

Run: `npm.cmd test -- src/crm/normalizePhone.test.ts src/crm/dealBalance.test.ts`

Expected: FAIL because modules do not exist.

- [ ] **Step 4: Implement normalization and bigint-safe balance**

```ts
export function normalizeRussianPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  const normalized = digits.length === 11 && digits.startsWith('8')
    ? `7${digits.slice(1)}` : digits;
  return normalized.length === 11 && normalized.startsWith('7') ? `+${normalized}` : null;
}

export function calculateDealBalance(price: string, rows: PaymentAmount[]) {
  const paid = rows.reduce((sum, row) =>
    sum + (row.kind === 'payment' ? BigInt(row.amountKopecks) : -BigInt(row.amountKopecks)), 0n);
  return { paidKopecks: String(paid), balanceKopecks: String(BigInt(price) - paid) };
}
```

- [ ] **Step 5: Define stable DTOs**

`CrmDealDto` must include `version`, stage, owner, next step, `priceKopecks`, `paidKopecks`, `balanceKopecks`, timestamps and person summary. It must not expose raw database bigint or internal payloads.

- [ ] **Step 6: Verify domain tests**

Run: `npm.cmd test -- src/crm/normalizePhone.test.ts src/crm/dealBalance.test.ts`

Expected: all cases PASS.

- [ ] **Step 7: Proposed commit checkpoint**

```bash
git add src/crm/normalizePhone.ts src/crm/normalizePhone.test.ts src/crm/crmTypes.ts src/crm/dealBalance.ts src/crm/dealBalance.test.ts
git commit -m "feat: define crm domain contracts"
```

---

### Task 3: Transactional CRM repository

**Files:**
- Create: `scripts/cms/api/crm/crmRepository.ts`
- Create: `scripts/cms/api/crm/crmRepository.integration.test.ts`
- Create: `scripts/cms/api/audit/auditRepository.ts`
- Retain temporarily: `scripts/cms/api/crmStore.ts`

**Interfaces:**
- Produces `CrmRepository` methods `findOrCreatePerson`, `createDeal`, `updateDeal`, `addTouch`, `addPayment`, `listPersonDeals`, `getManagerQueue`.
- Every mutation accepts `actorUserId`; update methods accept `expectedVersion`.

- [ ] **Step 1: Write failing integration tests**

Cover exact phone reuse, two deals for one person, stale version conflict, payment/refund balance, immutable payment rows and queue ordering.

```ts
const first = await repo.findOrCreatePerson({ name: 'Анна', phoneRaw: '8 914 123-45-67', source: 'site' });
const second = await repo.findOrCreatePerson({ name: 'Анна', phoneRaw: '+7 914 123-45-67', source: 'mini_app' });
expect(second.id).toBe(first.id);

await expect(repo.updateDeal(deal.id, 1, { stage: 'in_progress' }, actorId)).resolves.toMatchObject({ version: 2 });
await expect(repo.updateDeal(deal.id, 1, { stage: 'closed' }, actorId)).rejects.toMatchObject({ code: 'VERSION_CONFLICT' });
```

- [ ] **Step 2: Verify failure**

Run with `TEST_DATABASE_URL`: `npm.cmd test -- scripts/cms/api/crm/crmRepository.integration.test.ts`

Expected: FAIL because repository does not exist.

- [ ] **Step 3: Implement repository errors and transactions**

```ts
export class CrmVersionConflictError extends Error { readonly code = 'VERSION_CONFLICT'; }
export type CrmRepository = {
  findOrCreatePerson(input: PersonInput, tx?: CmsTransaction): Promise<PersonRecord>;
  createDeal(input: DealInput, actorUserId: string, tx?: CmsTransaction): Promise<CrmDealDto>;
  updateDeal(id: string, expectedVersion: number, patch: DealPatch, actorUserId: string): Promise<CrmDealDto>;
  addTouch(input: NewTouch, actorUserId: string): Promise<CrmTouchDto>;
  addPayment(input: NewPayment, actorUserId: string): Promise<CrmPaymentDto>;
  listPersonDeals(personId: string): Promise<CrmDealDto[]>;
  getManagerQueue(now: Date): Promise<ManagerQueueDto>;
};
```

Use `UPDATE ... WHERE id = ? AND version = ? RETURNING *`; zero rows means `CrmVersionConflictError`. Insert audit rows in the same transaction as stage and payment mutations.

- [ ] **Step 4: Make payment rows append-only**

Repository exposes insert/list only. Do not implement update/delete payment methods. A refund is a positive amount with `kind='refund'`.

- [ ] **Step 5: Verify repository behavior**

Run the Task 3 integration command again.

Expected: all transactional, conflict and balance tests PASS.

- [ ] **Step 6: Proposed commit checkpoint**

```bash
git add scripts/cms/api/crm scripts/cms/api/audit
git commit -m "feat: add transactional crm repository"
```

---

### Task 4: Entity-based CRM API and admin client

**Files:**
- Rewrite: `scripts/cms/api/crmRoutes.ts`
- Modify: `scripts/cms/api/app.ts`
- Modify: `src/admin/api.ts`
- Test: `scripts/cms/api/app.test.ts`
- Create: `src/admin/api.test.ts`

**Interfaces:**
- Produces endpoints `GET /api/cms/crm/queue`, `GET/POST /api/cms/crm/people`, `GET /people/:id/deals`, `POST/PATCH /deals`, `POST /deals/:id/touches`, `GET/POST /deals/:id/payments`.
- Replaces global `CrmFile.rev` with per-entity `version`.

- [ ] **Step 1: Add failing route tests**

Assert authenticated queue response, 409 on stale deal version, 201 payment insertion, 400 on zero/negative amount and 403 for unauthenticated access.

```ts
expect(await app.request('/api/cms/crm/deals/d1', {
  method: 'PATCH', headers: authHeaders,
  body: JSON.stringify({ version: 1, patch: { stage: 'in_progress' } }),
})).toHaveProperty('status', 200);
```

- [ ] **Step 2: Verify route tests fail**

Run: `npm.cmd test -- scripts/cms/api/app.test.ts src/admin/api.test.ts`

Expected: FAIL because the new routes/client methods do not exist.

- [ ] **Step 3: Implement Zod request schemas and route mapping**

Return errors as `{ error: 'validation_failed' | 'version_conflict' | 'not_found' }`. Serialize all bigint amounts as strings. Use current auth middleware and derive `actorUserId` from the DB session.

- [ ] **Step 4: Replace admin client methods**

Add exact functions:

```ts
export const adminGetManagerQueue = (): Promise<ManagerQueueDto>;
export const adminGetPersonDeals = (personId: string): Promise<CrmDealDto[]>;
export const adminPatchDeal = (id: string, version: number, patch: DealPatch): Promise<CrmDealDto>;
export const adminAddTouch = (dealId: string, input: TouchInput): Promise<CrmTouchDto>;
export const adminAddPayment = (dealId: string, input: PaymentInput): Promise<CrmPaymentDto>;
```

Map HTTP 409 to `new Error('version_conflict')` so existing UI conflict handling can be reused.

- [ ] **Step 5: Verify API and client**

Run the Task 4 tests again.

Expected: all new route contracts PASS and no response contains a global CRM document.

- [ ] **Step 6: Proposed commit checkpoint**

```bash
git add scripts/cms/api/crmRoutes.ts scripts/cms/api/app.ts scripts/cms/api/app.test.ts src/admin/api.ts src/admin/api.test.ts
git commit -m "feat: expose entity based crm api"
```

---

### Task 5: Manager queue and deal workspace UI

**Files:**
- Modify: `src/admin/LeadsPage.tsx`
- Modify: `src/admin/IndividualToursPage.tsx`
- Modify: `src/admin/components/CrmPersonPanel.tsx`
- Modify: `src/admin/components/CrmCreateModal.tsx`
- Create: `src/admin/components/CrmDealWorkspace.tsx`
- Create: `src/admin/components/CrmPaymentLedger.tsx`
- Test: `src/admin/LeadsPage.test.tsx`
- Create: `src/admin/components/CrmPaymentLedger.test.tsx`

**Interfaces:**
- Consumes DTO/client functions from Tasks 2 and 4.
- Produces manager actions for stage, next step, touch, payment and refund.

- [ ] **Step 1: Write failing UI tests**

```tsx
render(<LeadsPage />);
expect(await screen.findByRole('heading', { name: 'Новые заявки' })).toBeVisible();
expect(screen.getByRole('heading', { name: 'Просроченные действия' })).toBeVisible();

await user.click(screen.getByRole('button', { name: 'Добавить оплату' }));
await user.type(screen.getByLabelText('Сумма'), '1500');
await user.click(screen.getByRole('button', { name: 'Сохранить оплату' }));
expect(adminAddPayment).toHaveBeenCalledWith('deal-1', expect.objectContaining({ amountKopecks: '150000' }));
```

- [ ] **Step 2: Verify tests fail**

Run: `npm.cmd test -- src/admin/LeadsPage.test.tsx src/admin/components/CrmPaymentLedger.test.tsx`

Expected: FAIL because queue sections and ledger do not exist.

- [ ] **Step 3: Implement queue sections and deal workspace**

Show new, overdue, today, expected-payment and no-answer groups. In the selected deal show person history, call/messenger actions, stage select, next step/date, touch composer, price, ledger, paid and balance.

- [ ] **Step 4: Implement safe money entry**

Convert a Russian decimal ruble input to kopecks without floating-point arithmetic. Reject more than two fractional digits and non-positive values; show server conflict without replacing current form values.

- [ ] **Step 5: Verify UI behavior**

Run Task 5 tests.

Expected: queue renders, mutations receive correct IDs/versions, payments use kopeck strings, and conflict feedback is visible.

- [ ] **Step 6: Proposed commit checkpoint**

```bash
git add src/admin/LeadsPage.tsx src/admin/IndividualToursPage.tsx src/admin/components/CrmPersonPanel.tsx src/admin/components/CrmCreateModal.tsx src/admin/components/CrmDealWorkspace.tsx src/admin/components/CrmPaymentLedger.tsx src/admin/**/*.test.tsx
git commit -m "feat: add crm manager workspace"
```

---

### Task 6: Idempotent public lead intake

**Files:**
- Create: `scripts/cms/api/crm/inboundService.ts`
- Create: `scripts/cms/api/crm/inboundService.integration.test.ts`
- Modify: `scripts/cms/api/crmRoutes.ts`
- Modify: `src/services/sendTourRequestLead.ts`
- Modify: `src/services/sendTourRequestLead.test.ts`
- Modify: `vite.config.ts`
- Modify: `.env.example`

**Interfaces:**
- Produces public endpoint `POST /api/public/leads`.
- Produces response `{ ok: true, dealId: string, duplicate: boolean }`.
- Consumes caller-provided `idempotencyKey`; retry must reuse the same key.

- [ ] **Step 1: Write failing intake tests**

```ts
const first = await service.accept(payload, 'site');
const retry = await service.accept(payload, 'site');
expect(retry).toEqual({ ...first, duplicate: true });
expect(await countDeals()).toBe(1);
expect(await countOutbox()).toBe(1);
```

Also test a returning phone with a new idempotency key: one person, two deals.

- [ ] **Step 2: Verify service test fails**

Run with `TEST_DATABASE_URL`: `npm.cmd test -- scripts/cms/api/crm/inboundService.integration.test.ts`

Expected: FAIL because service does not exist.

- [ ] **Step 3: Implement one-transaction intake**

Within one database transaction: insert idempotency row; if conflict, load existing result; normalize phone; find/create person; create deal; link inbound request; insert one outbox row. Store a whitelisted payload only—never `userAgent` or arbitrary client fields in audit/public logs.

- [ ] **Step 4: Add public safety middleware**

Limit JSON body to 32 KiB, validate with Zod, accept only same-site configured origins, and apply an IP/idempotency rate limit. Return 202 for a new accepted lead and 200 for an idempotent replay.

- [ ] **Step 5: Preserve one idempotency key across frontend retry**

Change `sendTourRequestLead` so `buildLeadPayload` accepts an externally created key and a retry of the same submission reuses it. Default endpoint becomes `/api/public/leads`; retain `VITE_TOUR_REQUEST_ENDPOINT_URL` only as an explicit compatibility override during rollout.

- [ ] **Step 6: Proxy public API locally and verify**

Add `/api/public` to the same Vite proxy target. Run:

`npm.cmd test -- scripts/cms/api/crm/inboundService.integration.test.ts src/services/sendTourRequestLead.test.ts scripts/cms/api/app.test.ts`

Expected: new/retry/returning-person tests PASS.

- [ ] **Step 7: Proposed commit checkpoint**

```bash
git add scripts/cms/api/crm/inboundService.ts scripts/cms/api/crm/inboundService.integration.test.ts scripts/cms/api/crmRoutes.ts src/services/sendTourRequestLead.ts src/services/sendTourRequestLead.test.ts vite.config.ts .env.example
git commit -m "feat: route public leads into crm"
```

---

### Task 7: Telegram transactional outbox

**Files:**
- Create: `scripts/cms/api/notifications/telegramClient.ts`
- Create: `scripts/cms/api/notifications/outboxWorker.ts`
- Create: `scripts/cms/api/notifications/outboxWorker.integration.test.ts`
- Modify: `scripts/cms/api/env.ts`
- Modify: `scripts/cms/api/server.ts`
- Modify: `.env.cms-dev.example`

**Interfaces:**
- Produces `startOutboxWorker({ db, telegram, signal, pollMs }): Promise<void>`.
- Telegram client exposes `sendLeadNotification(payload): Promise<void>`.

- [ ] **Step 1: Write failing retry tests**

```ts
telegram.sendLeadNotification
  .mockRejectedValueOnce(new Error('timeout'))
  .mockResolvedValueOnce(undefined);
await worker.runOnce(now);
expect(await row()).toMatchObject({ status: 'pending', attempts: 1 });
await worker.runOnce(afterBackoff);
expect(await row()).toMatchObject({ status: 'sent', attempts: 2 });
```

- [ ] **Step 2: Verify failure**

Run with `TEST_DATABASE_URL`: `npm.cmd test -- scripts/cms/api/notifications/outboxWorker.integration.test.ts`

Expected: FAIL because worker does not exist.

- [ ] **Step 3: Implement claim/send/ack loop**

Claim rows with `FOR UPDATE SKIP LOCKED`, mark them processing, commit, call Telegram, then mark sent or pending with `next_attempt_at`. Backoff is `min(5 minutes, 2^attempts seconds)`; after 10 failures mark `failed` and expose it to admin diagnostics.

- [ ] **Step 4: Add safe Telegram formatting**

Message includes deal ID, name, normalized contact, tour/date and source. Escape Telegram markup and never include internal payload, session data, audit data or payment details.

- [ ] **Step 5: Start and stop worker with the API**

Read `TELEGRAM_BOT_TOKEN` and `TELEGRAM_MANAGER_CHAT_ID` from env. Start worker only when both exist; log a configuration warning without secrets otherwise. Stop it through `AbortController` during server shutdown.

- [ ] **Step 6: Verify outbox and focused regression suite**

Run:

```powershell
npm.cmd test -- scripts/cms/api/crm scripts/cms/api/notifications src/crm src/admin/LeadsPage.test.tsx src/admin/components/CrmPaymentLedger.test.tsx src/services/sendTourRequestLead.test.ts scripts/cms/api/app.test.ts
npm.cmd run lint -- --quiet scripts/cms/api src/crm src/admin src/services/sendTourRequestLead.ts
```

Expected: all focused tests PASS and lint has zero errors.

- [ ] **Step 7: Manual failure smoke test**

Use an intentionally unreachable mock Telegram endpoint, submit a local lead, verify the CRM deal exists immediately and the outbox row remains pending. Restore the mock endpoint and verify the same row becomes sent without a second deal.

- [ ] **Step 8: Proposed commit checkpoint**

```bash
git add scripts/cms/api/notifications scripts/cms/api/env.ts scripts/cms/api/server.ts .env.cms-dev.example
git commit -m "feat: deliver crm leads through outbox"
```

## Plan 2 exit gate

- CRM reads and writes PostgreSQL entities, not `private/crm.json`.
- Exact normalized phone reuses the person; a new request creates a new deal.
- Per-deal optimistic concurrency returns 409 on stale writes.
- Payment/refund rows are append-only and balance is derived exactly.
- Site and Mini App requests are idempotent and appear in the manager queue.
- Telegram outage leaves the lead intact and retries the notification.
- Focused API, integration, UI tests and lint are green.
