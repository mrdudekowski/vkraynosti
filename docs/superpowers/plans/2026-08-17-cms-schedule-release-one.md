# CMS Schedule and Release One Implementation Plan

> **SUPERSEDED (2026-08-18).** Do not execute this file. Release 1 work is `docs/superpowers/plans/2026-08-18-cms-release-one.md`. Stale assumptions here: per-departure price, `paused`, equal list/calendar, Google Sheets import, teams in CMS.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver Release 1 in which PostgreSQL is the source of truth for the tour catalog and departures, and an administrator can edit and atomically release the complete public catalog and schedule without a site rebuild.

**Architecture:** Stable tour identity and structured catalog fields live in PostgreSQL beside immutable content revisions. Departures are first-class versioned rows linked to tours. Publication builds immutable, mutually consistent tour and schedule artifacts, verifies them, and activates them by writing one manifest last. Google Sheets becomes an import source only and is retired after a reconciled final import.

**Tech Stack:** PostgreSQL 17, Drizzle ORM/Kit, Hono 4, Zod 4, React 19, AWS SDK S3, Vitest 4, Playwright 1.58.

## Global Constraints

- Plan 1 PostgreSQL/auth exit gate and the CMS revision/publication schema are green before this plan starts.
- PostgreSQL 17 is the internal source of truth for tours, revisions, departures, releases and audit records.
- IDs are UUIDs; timestamps are UTC; departure calendar dates are PostgreSQL `date`; UI formatting uses `Asia/Vladivostok`.
- Money is stored as integer kopecks in PostgreSQL `BIGINT`; phase-one currency is RUB.
- Roles remain `admin` and `editor`: editors prepare tours and departures; only admins publish, unpublish, archive or activate a public release.
- Public S3 contains media and immutable versioned public JSON only. Drafts, internal comments, actor IDs, audit payloads and credentials never enter public artifacts.
- The development object store is bucket `vkraynosti-cms-dev` with CDN `ypnmfvotln.cdn.twcstorage.ru`; production S3 is not written during implementation.
- Existing Google Sheets/GAS JSON remains readable until an idempotent import, reconciliation and explicit cutover approval succeed.
- `planned` is a first-class operational departure status. The XLSX source label for planned maps to `planned` exactly and never maps to `open` or `paused`.
- No CRM implementation starts before the Release 1 exit gate is green.
- No push, PR, deployment, production S3 write, Timeweb change or external cutover occurs without separate explicit approval.

---

### Task 1: Structured tour and departure schema

**Files:**
- Modify: `scripts/cms/api/db/schema.ts`
- Modify: `scripts/cms/api/db/schema.test.ts`
- Create: `drizzle/0002_tour_schedule.sql`

**Interfaces:**
- Extends `tours` with `basePriceKopecks`, `durationType` and `catalogVersion`.
- Produces tables `tour_departures` and `catalog_releases`.
- Produces types `DepartureStatus`, `DurationType`, `DepartureRecord`, `CatalogReleaseRecord`.

- [ ] **Step 1: Add failing schema contract tests**

```ts
it('stores structured catalog fields on tours', () => {
  expect(Object.keys(getTableColumns(tours))).toEqual(expect.arrayContaining([
    'basePriceKopecks', 'durationType', 'catalogVersion'
  ]));
});

it('stores versioned departures and immutable release metadata', () => {
  expect(Object.keys(getTableColumns(tourDepartures))).toEqual(expect.arrayContaining([
    'id', 'tourId', 'startsOn', 'priceKopecks', 'seatsAvailable', 'status',
    'comment', 'version', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt', 'archivedAt'
  ]));
  expect(Object.keys(getTableColumns(catalogReleases))).toEqual(expect.arrayContaining([
    'id', 'releaseNumber', 'status', 'artifactPrefix', 'manifestKey',
    'catalogChecksum', 'scheduleChecksum', 'createdBy', 'createdAt', 'activatedAt', 'error'
  ]));
});
```

- [ ] **Step 2: Verify RED**

Run: `npm.cmd test -- scripts/cms/api/db/schema.test.ts`

Expected: FAIL because the structured tour fields and schedule tables do not exist.

- [ ] **Step 3: Define schema invariants**

Use enum values:

```ts
export const tourDurationType = pgEnum('tour_duration_type', ['single_day', 'multi_day']);
export const departureStatus = pgEnum('departure_status', [
  'planned', 'open', 'full', 'paused', 'cancelled', 'completed'
]);
export const catalogReleaseStatus = pgEnum('catalog_release_status', [
  'pending', 'succeeded', 'failed'
]);
```

Required constraints:

- `base_price_kopecks BIGINT`, nullable for “price on request”, never negative;
- departure price is a nullable override and never negative;
- `seats_available INTEGER` is nullable and never negative;
- one non-archived departure per `(tour_id, starts_on)`;
- `version INTEGER NOT NULL DEFAULT 1` for optimistic concurrency;
- `tour_id` references `tours(id)` with deletion restricted;
- actor references use `users(id)` and retain history;
- one active successful release through a partial unique index on `activated_at IS NOT NULL` and no superseding release marker.

- [ ] **Step 4: Generate and inspect migration**

Run: `npm.cmd run db:generate -- --name tour_schedule`

Expected: `drizzle/0002_tour_schedule.sql` contains the new enums, columns, tables, foreign keys, checks and indexes. Do not hand-edit a migration after it has been applied anywhere.

- [ ] **Step 5: Apply and verify migration**

Run with local `DATABASE_URL`: `npm.cmd run db:migrate` then `npm.cmd run db:check` then `npm.cmd test -- scripts/cms/api/db/schema.test.ts`.

Expected: migration applies to PostgreSQL 17, Drizzle reports no drift and schema tests pass.

- [ ] **Step 6: Proposed local checkpoint**

```bash
git add scripts/cms/api/db/schema.ts scripts/cms/api/db/schema.test.ts drizzle/0002_tour_schedule.sql
git commit -m "feat: add tour schedule schema"
```

---

### Task 2: Tour catalog fields and departure repository

**Files:**
- Modify: `scripts/cms/api/tours/tourRepository.ts`
- Modify: `scripts/cms/api/tours/tourRepository.integration.test.ts`
- Create: `scripts/cms/api/schedule/departureRepository.ts`
- Create: `scripts/cms/api/schedule/departureRepository.integration.test.ts`
- Create: `src/cms/tourCatalogFields.ts`
- Create: `src/cms/tourCatalogFields.test.ts`

**Interfaces:**
- Produces `updateCatalogFields(tourId, expectedVersion, input, actorUserId)`.
- Produces `DepartureRepository` with `list`, `get`, `create`, `update`, `archive` and `restore`.
- Produces `resolveDeparturePrice(basePriceKopecks, overridePriceKopecks)`.

- [ ] **Step 1: Write failing domain tests**

```ts
expect(resolveDeparturePrice(600_000n, null)).toBe(600_000n);
expect(resolveDeparturePrice(600_000n, 650_000n)).toBe(650_000n);
expect(() => parseSeatsAvailable(-1)).toThrow('seats_invalid');
```

- [ ] **Step 2: Write failing integration tests**

Test all of the following against `TEST_DATABASE_URL` with per-run UUID/login namespaces and targeted cleanup only:

- create a departure for an existing tour;
- reject duplicate non-archived `(tour, date)`;
- update date, price, seats, status and comment with expected version;
- return `version_conflict` for a stale update;
- archive without deleting history and restore when no active duplicate exists;
- reject a missing/archived tour;
- update base price and duration type transactionally with audit.

- [ ] **Step 3: Verify RED**

Run: `$env:TEST_DATABASE_URL='postgres://vkrainosti:local-vkrainosti-only@127.0.0.1:54327/vkrainosti'; npm.cmd test -- src/cms/tourCatalogFields.test.ts scripts/cms/api/schedule/departureRepository.integration.test.ts scripts/cms/api/tours/tourRepository.integration.test.ts`

Expected: FAIL because catalog-field and departure repository modules are absent.

- [ ] **Step 4: Implement domain and repository rules**

Use Drizzle bound values only. Every mutation locks or conditionally updates the target version, increments `version`, writes an audit event in the same transaction and returns the committed row. Missing rows return `null`; conflicts use stable codes `departure_duplicate`, `version_conflict`, `tour_not_found`, `departure_not_found`.

- [ ] **Step 5: Verify GREEN**

Run the Task 2 focused command again.

Expected: domain, concurrency, archive/restore and targeted-cleanup tests pass with no warnings.

- [ ] **Step 6: Proposed local checkpoint**

```bash
git add scripts/cms/api/tours scripts/cms/api/schedule src/cms/tourCatalogFields.ts src/cms/tourCatalogFields.test.ts
git commit -m "feat: add tour departure repository"
```

---

### Task 3: Schedule API and CMS screens

**Files:**
- Modify: `scripts/cms/api/app.ts`
- Modify: `scripts/cms/api/app.test.ts`
- Modify: `src/admin/api.ts`
- Modify: `src/admin/AdminApp.tsx`
- Modify: `src/admin/constants/routes.ts`
- Modify: `src/admin/constants/ui.ts`
- Create: `src/admin/SchedulePage.tsx`
- Create: `src/admin/SchedulePage.test.tsx`
- Create: `src/admin/components/DepartureEditor.tsx`
- Create: `src/admin/components/DepartureEditor.test.tsx`
- Modify: `src/admin/TourEditorPage.tsx`

**Interfaces:**
- Produces `GET /api/cms/departures?from=&to=&tourId=&status=&includeArchived=`.
- Produces `POST /api/cms/departures`, `PUT /api/cms/departures/:id`, `DELETE /api/cms/departures/:id`, `POST /api/cms/departures/:id/restore`.
- Extends tour editing with structured base price and duration type.

- [ ] **Step 1: Write failing API role and validation tests**

Assert authenticated editors and admins can list/create/update/archive departures; unauthenticated requests return 401. Every mutation requires `version` after creation, rejects invalid ISO dates, negative price/seats, unknown tours and duplicates, and never returns internal audit payloads.

- [ ] **Step 2: Write failing CMS UI tests**

Assert the schedule page provides:

- calendar and list views over the same query state;
- season/tour/status/date filters;
- “Добавить выезд” and edit actions;
- fields: tour, date, price override, available seats, status, comment;
- duplicate/archive/restore confirmations;
- visible “есть неопубликованные изменения” state;
- 409 conflict handling that preserves local input and offers reload.

- [ ] **Step 3: Verify RED**

Run: `npm.cmd test -- scripts/cms/api/app.test.ts src/admin/SchedulePage.test.tsx src/admin/components/DepartureEditor.test.tsx`

Expected: FAIL because schedule routes and UI do not exist.

- [ ] **Step 4: Implement API contracts**

Validate query/body data with Zod. Serialize kopecks as decimal strings in API DTOs to avoid JavaScript precision loss. Return UTC timestamps, ISO calendar dates and stable error codes. Do not couple these routes to CRM bookings.

- [ ] **Step 5: Implement operator workflow**

Add `/schedule` navigation for both roles. Default to the next 90 days, with an explicit past toggle. Allow quick add from a tour editor with that tour preselected. Show effective price (override or tour base), seats, status and whether the row differs from the active release.

- [ ] **Step 6: Verify API and UI**

Run the Task 3 focused command plus `npm.cmd test -- src/admin/ToursPage.test.tsx src/admin/SeasonToursPage.test.tsx`.

Expected: CRUD, roles, validation, conflict recovery and existing tour navigation pass.

- [ ] **Step 7: Proposed local checkpoint**

```bash
git add scripts/cms/api/app.ts scripts/cms/api/app.test.ts src/admin/api.ts src/admin/AdminApp.tsx src/admin/constants src/admin/SchedulePage.tsx src/admin/SchedulePage.test.tsx src/admin/components/DepartureEditor.tsx src/admin/components/DepartureEditor.test.tsx src/admin/TourEditorPage.tsx
git commit -m "feat: add cms schedule editor"
```

---

### Task 4: Atomic catalog and schedule release

**Files:**
- Modify: `scripts/cms/api/publication/publicArtifact.ts`
- Modify: `scripts/cms/api/publication/publicArtifact.test.ts`
- Modify: `scripts/cms/api/publication/publicationService.ts`
- Modify: `scripts/cms/api/publication/publicationService.integration.test.ts`
- Modify: `src/cms/cmsContentUrls.ts`
- Modify: `src/cms/loadCmsToursFile.ts`
- Modify: `src/services/fetchTourSchedule.ts`
- Modify: `src/services/fetchTourSchedule.test.ts`
- Modify: `src/admin/api.ts`
- Modify: `src/admin/SchedulePage.tsx`

**Interfaces:**
- Produces versioned keys `public/cms/releases/<release-id>/tours.json`, `tours_list.json`, `schedule.json`.
- Produces manifest `public/cms/releases/manifest.json` with all three keys, SHA-256 checksums, schema version and activation time.
- Produces admin-only `POST /api/cms/releases` and `GET /api/cms/releases/current`.

- [ ] **Step 1: Write failing deterministic bundle tests**

Build the same database snapshot in different input order and assert byte-identical artifacts/checksums. Assert public JSON excludes drafts, review comments, actor IDs, row versions, archived departures and internal audit fields.

- [ ] **Step 2: Write failing preflight tests**

Block release when a public departure references a non-publishable tour, when base/override price cannot be resolved for a released event that requires a price, when duplicate `(tourId, date)` exists, or when a tour revision fails the CMS public schema. `cancelled` departures remain valid data but are filtered according to the existing public contract.

- [ ] **Step 3: Write failing activation safety test**

Use a fake object store that fails artifact upload, readback or manifest upload. Assert the previous manifest remains readable and the release row becomes `failed` without exposing secret-bearing errors.

- [ ] **Step 4: Verify RED**

Run: `npm.cmd test -- scripts/cms/api/publication src/services/fetchTourSchedule.test.ts src/cms/loadCmsToursFile.test.ts`

Expected: FAIL because a combined release bundle and manifest do not exist.

- [ ] **Step 5: Implement manifest-last activation**

1. Lock release creation and capture one repeatable-read database snapshot.
2. Validate every included tour and departure.
3. Build all three artifacts and checksums.
4. Upload immutable objects under the release prefix.
5. Read each object back, verify checksum and parse through current public schemas.
6. Upload the single manifest last.
7. Mark the release active and the prior release superseded in one database transaction.

If any step before manifest activation fails, the public site continues reading the previous release.

- [ ] **Step 6: Preserve controlled compatibility**

Public loaders try the release manifest first. While Release 1 is in local/dev validation, absence of a manifest falls back to the current direct CMS/Google Sheets JSON. Once a manifest exists but is invalid, loaders surface a release fault and do not silently mix old and new sources.

- [ ] **Step 7: Add admin release control**

Show preflight counts, blockers, last successful release and pending changes. Only `admin` sees “Выпустить изменения”. Require confirmation. Editors can prepare data but cannot call the endpoint. Individual tour publish/unpublish changes DB workflow; the public site changes only after a successful catalog release.

- [ ] **Step 8: Verify GREEN**

Run Task 4 tests and assert failed activation preserves the previous catalog and schedule together.

- [ ] **Step 9: Proposed local checkpoint**

```bash
git add scripts/cms/api/publication src/cms src/services/fetchTourSchedule.ts src/services/fetchTourSchedule.test.ts src/admin/api.ts src/admin/SchedulePage.tsx
git commit -m "feat: release catalog and schedule atomically"
```

---

### Task 5: Google Sheets migration and cutover evidence

**Files:**
- Create: `scripts/cms/import-google-schedule-to-postgres.ts`
- Create: `scripts/cms/import-google-schedule-to-postgres.test.ts`
- Create: `scripts/cms/api/schedule/scheduleImport.ts`
- Create: `docs/runbooks/cms-schedule-cutover.md`
- Modify: `scripts/cms/api/server.ts`

**Interfaces:**
- Importer consumes validated `tours_list.json` and `schedule.json` produced by the existing Google Sheets/GAS pipeline.
- Importer returns `{ toursMatched, toursUpdated, departuresInserted, departuresUpdated, skipped, errors }`.
- CLI is dry-run by default and requires `--apply` for PostgreSQL writes.

- [ ] **Step 1: Write failing importer tests**


Create fixtures for:

- a valid catalog and schedule;
- unknown `tourId`;
- duplicate `(tourId, date)` rows;
- invalid date/status/seats/price;
- a second identical import;
- a changed existing departure;
- a tour whose title changed but stable ID did not.

Assert dry run never writes, invalid input aborts apply, identical re-run is idempotent and changed rows require the expected current version.

- [ ] **Step 2: Verify RED**

Run with `TEST_DATABASE_URL`: `npm.cmd test -- scripts/cms/import-google-schedule-to-postgres.test.ts`

Expected: FAIL because the importer does not exist.

- [ ] **Step 3: Implement deterministic mapping and report**

Validate both source files before opening the write transaction. Match tours only by stable legacy tour ID; never guess by title. Convert rubles to integer kopecks without floating-point arithmetic. Normalize ISO dates and current status values. Preserve source row numbers in errors, but do not persist spreadsheet-only formatting.
The XLSX source label for planned maps exactly to `planned`; it is preserved as its own status and is never normalized to `open` or `paused`.

The report contains source checksums, totals, inserts, updates, unchanged rows, rejects and blocking errors. Console output contains counts and report path, not full source data.

- [ ] **Step 4: Implement safe apply mode**

`--apply` requires a clean validation report and imports in one database transaction. Upsert by stable tour ID and `(tourId, date)`, check optimistic versions, append audit entries and record source checksums in an import ledger. A repeated source checksum is a no-op. Any blocking row rolls back the whole apply.

- [ ] **Step 5: Write the cutover runbook**

Document exact local/dev steps:

1. Export the latest `tours_list.json` and `schedule.json` from the current Google Sheets/GAS pipeline.
2. Preserve immutable source copies and record SHA-256 checksums.
3. Run dry-run import and resolve every blocker.
4. Back up PostgreSQL, apply import, compare row counts and sample records.
5. Edit one imported departure through CMS and verify audit/version behavior.
6. Build and validate a combined release locally.
7. Only after separate approval, upload to the development bucket and verify the development CDN.
8. Keep Google Sheets read-only as rollback evidence until production cutover is separately approved.

- [ ] **Step 6: Verify migration evidence**

Run importer unit/integration tests. Against a disposable local database, run dry run, apply, repeat apply, then export the public schedule and compare normalized tour IDs, dates, statuses, seats and prices with the source fixtures.

Expected: zero unexplained differences; second apply produces zero writes.

- [ ] **Step 7: Proposed local checkpoint**

```bash
git add scripts/cms/import-google-schedule-to-postgres.ts scripts/cms/import-google-schedule-to-postgres.test.ts scripts/cms/api/schedule/scheduleImport.ts scripts/cms/api/server.ts docs/runbooks/cms-schedule-cutover.md
git commit -m "feat: migrate google schedule into postgres"
```

---

### Task 6: Release 1 verification and operator acceptance

**Files:**
- Create: `tests/e2e/cms-schedule-release.spec.ts`
- Create: `docs/runbooks/cms-release-one-checklist.md`
- Modify: `package.json`

**Interfaces:**
- Produces `check:cms-release-one` for the complete local quality gate.
- Produces a signed-off checklist with command, timestamp, result and evidence path for every release criterion.

- [ ] **Step 1: Add the end-to-end operator scenario**

Cover login, create/edit a tour, submit/review/publish it, create/edit/cancel/archive departures in list and calendar views, reject a stale concurrent update, deny editor release access, run preflight, activate a release and verify the public loaders read one matching catalog/schedule manifest.

- [ ] **Step 2: Add the complete local gate**

```json
{
  "check:cms-release-one": "npm run db:check && npm run typecheck && npm run lint && npm test && npm run build && playwright test tests/e2e/cms-schedule-release.spec.ts"
}
```

Do not weaken existing tests, exclude relevant source, or treat browser smoke as a substitute for unit, integration, type, lint and build checks.

- [ ] **Step 3: Prove recovery and publication safety**

On disposable PostgreSQL 17 infrastructure, create a backup, restore it into a separate database and verify tour/departure/release counts and checksums. Simulate an artifact upload failure and an invalid manifest; the prior complete release must remain active. Confirm public artifacts contain no sessions, draft documents, review comments, actor IDs or other private fields.

- [ ] **Step 4: Run operator acceptance locally**

An administrator completes the schedule workflow without Google Sheets: find a date, filter by tour/status, add a departure, override price/seats, edit, cancel, archive, inspect validation errors and release all changes. An editor can prepare catalog/schedule changes but cannot activate a release. Record any usability blocker as release-blocking.

- [ ] **Step 5: Run the full gate and record evidence**

Run `npm.cmd run check:cms-release-one`. Record exact command output, local database migration version, source/import checksums, backup/restore evidence, E2E screenshots or trace and the final operator checklist. All failures must be resolved or explicitly accepted by the user before any deployment decision.

---

## Release 1 exit gate

Release 1 is ready for a deployment decision only when all conditions are true:

- PostgreSQL 17 is the source of truth for users, sessions, full tour catalog, revisions, departures, audit and release state.
- Operational departure statuses are exactly `planned`, `open`, `full`, `paused`, `cancelled`, `completed`; the XLSX planned label survives import as `planned`.
- CMS lets authorized staff create and edit complete tour information and manage departures in list/calendar views.
- Roles are enforced server-side: editor prepares data; admin manages users and activates/unpublishes releases.
- Google Sheets catalog/schedule imports through a dry-run-first, idempotent and evidenced process with zero unexplained differences.
- One manifest atomically activates compatible `tours.json`, `tours_list.json` and `schedule.json`; failed activation preserves the last good release.
- Unit, integration, API, UI, E2E, lint, typecheck, build, migration drift, backup/restore, security and operator-acceptance gates pass.
- No production or development deployment, S3/CDN write, push or PR has occurred without separate explicit approval.

At this checkpoint, stop and present evidence to the user. Deployment is a separate decision.

## Boundary after Release 1

CRM is Release 2. It may reference stable `tours.id` and `tour_departures.id`, but Release 1 does not include people, deals, payments, manager queues, Telegram outbox or CRM migration. Do not begin `2026-08-17-cms-crm-02-crm-intake.md` until the user approves the Release 1 checkpoint.
