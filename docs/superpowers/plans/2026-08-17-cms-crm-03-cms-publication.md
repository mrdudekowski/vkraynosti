# CMS Revision and Atomic Publication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move tour drafts and publication state to PostgreSQL and provide a review/publish/unpublish lifecycle that updates the public S3 catalog atomically without rebuilding the site.

**Architecture:** PostgreSQL stores stable tour identity, immutable content revisions and publication jobs. Publishing builds a complete versioned JSON artifact, verifies it, uploads it, and only then switches a small manifest; media continues to use the existing S3 store.

**Tech Stack:** PostgreSQL 17, Drizzle ORM, Hono, Zod, AWS SDK S3, React 19, Vitest, Playwright.

## Global Constraints

- Plans 1 and 2 exit gates are green before starting.
- Lifecycle is `draft -> review -> published`; review may return to draft; published content may be unpublished or archived.
- Slug becomes immutable after the first successful publication.
- A failed build/upload never replaces the last good public artifact.
- Published output remains compatible with current `CmsToursProvider` and `loadCmsToursFile` consumers.
- S3 contains public tour JSON and media only; drafts, review comments and audit data remain in PostgreSQL.
- No production S3 writes, deployment or commits without explicit approval.

---

### Task 1: Tour revision and publication schema

**Files:**
- Modify: `scripts/cms/api/db/schema.ts`
- Modify: `scripts/cms/api/db/schema.test.ts`
- Create: `drizzle/0002_cms_revisions.sql`

**Interfaces:**
- Produces tables `tours`, `tour_revisions`, `tour_publications`, `publication_jobs`.
- Produces enums `tour_workflow_status`, `publication_job_status`, `publication_action`.

- [ ] **Step 1: Add failing schema tests**

```ts
it('separates stable tour identity from immutable revisions', () => {
  expect(Object.keys(getTableColumns(tours))).toEqual(expect.arrayContaining([
    'id', 'slug', 'slugFrozenAt', 'workflowStatus', 'currentRevisionId', 'version'
  ]));
  expect(Object.keys(getTableColumns(tourRevisions))).toEqual(expect.arrayContaining([
    'tourId', 'revisionNumber', 'document', 'createdBy', 'createdAt'
  ]));
});

it('tracks publication artifact and active state', () => {
  expect(Object.keys(getTableColumns(tourPublications))).toEqual(expect.arrayContaining([
    'tourId', 'revisionId', 'artifactKey', 'checksum', 'publishedAt', 'unpublishedAt'
  ]));
});
```

- [ ] **Step 2: Verify failure**

Run: `npm.cmd test -- scripts/cms/api/db/schema.test.ts`

Expected: FAIL because CMS revision tables are absent.

- [ ] **Step 3: Add schema invariants**

Use enum values:

```ts
export const tourWorkflowStatus = pgEnum('tour_workflow_status', ['draft', 'review', 'published', 'archived']);
export const publicationJobStatus = pgEnum('publication_job_status', ['pending', 'processing', 'succeeded', 'failed']);
export const publicationAction = pgEnum('publication_action', ['publish', 'unpublish']);
```

Required constraints:

- unique lower-case slug;
- unique `(tour_id, revision_number)`;
- immutable revision JSONB document;
- `version INTEGER NOT NULL DEFAULT 1` on `tours`;
- one current successful publication per tour through an active partial index;
- publication jobs retain error text and attempt count but no secrets.

- [ ] **Step 4: Generate, inspect and apply migration**

Run: `npm.cmd run db:generate` then `npm.cmd run db:migrate` then `npm.cmd run db:check`.

Expected: `drizzle/0002_cms_revisions.sql` creates four tables and all constraints with no drift.

- [ ] **Step 5: Verify schema tests**

Run: `npm.cmd test -- scripts/cms/api/db/schema.test.ts`

Expected: all schema tests PASS.

- [ ] **Step 6: Proposed commit checkpoint**

```bash
git add scripts/cms/api/db/schema.ts scripts/cms/api/db/schema.test.ts drizzle/0002_cms_revisions.sql
git commit -m "feat: add cms revision schema"
```

---

### Task 2: Tour repository and lifecycle rules

**Files:**
- Create: `scripts/cms/api/tours/tourRepository.ts`
- Create: `scripts/cms/api/tours/tourRepository.integration.test.ts`
- Create: `src/cms/cmsWorkflow.ts`
- Create: `src/cms/cmsWorkflow.test.ts`
- Modify: `src/cms/cmsTourMeta.ts`

**Interfaces:**
- Produces `TourRepository` methods `createTour`, `getTour`, `listTours`, `saveRevision`, `submitForReview`, `returnToDraft`, `markPublished`, `markUnpublished`, `archiveTour`.
- Produces `assertWorkflowTransition(from, to, role)` and `assertSlugChangeAllowed(tour, nextSlug)`.

- [ ] **Step 1: Write failing workflow tests**

```ts
expect(() => assertWorkflowTransition('draft', 'review', 'editor')).not.toThrow();
expect(() => assertWorkflowTransition('review', 'published', 'editor')).toThrow('admin_required');
expect(() => assertWorkflowTransition('review', 'published', 'admin')).not.toThrow();
expect(() => assertSlugChangeAllowed({ slug: 'old', slugFrozenAt: new Date() }, 'new')).toThrow('slug_frozen');
```

- [ ] **Step 2: Write failing repository tests**

Verify sequential revision numbers, stale version rejection, immutable earlier revision and one active publication after republish.

- [ ] **Step 3: Verify failure**

Run with `TEST_DATABASE_URL`: `npm.cmd test -- src/cms/cmsWorkflow.test.ts scripts/cms/api/tours/tourRepository.integration.test.ts`

Expected: FAIL because workflow/repository modules do not exist.

- [ ] **Step 4: Implement explicit workflow rules**

```ts
const allowed = {
  draft: ['review', 'archived'],
  review: ['draft', 'published'],
  published: ['draft', 'archived'],
  archived: ['draft'],
} as const;
```

Only admin can publish, unpublish/return a published tour, or archive. Editors may edit draft and submit for review. Return-to-draft requires a non-empty review comment.

- [ ] **Step 5: Implement repository transactions**

`saveRevision` locks the tour row, checks `expectedVersion`, validates the full document with `cmsTourDocumentSchema`, checks frozen slug, inserts the next immutable revision and increments the tour version in one transaction. Lifecycle operations append audit entries in the same transaction.

- [ ] **Step 6: Verify domain and repository**

Run the Task 2 command again.

Expected: workflow, immutability, concurrency and active-publication tests PASS.

- [ ] **Step 7: Proposed commit checkpoint**

```bash
git add scripts/cms/api/tours src/cms/cmsWorkflow.ts src/cms/cmsWorkflow.test.ts src/cms/cmsTourMeta.ts
git commit -m "feat: add cms review lifecycle"
```

---

### Task 3: Versioned public artifact publisher

**Files:**
- Create: `scripts/cms/api/publication/publicArtifact.ts`
- Create: `scripts/cms/api/publication/publicArtifact.test.ts`
- Create: `scripts/cms/api/publication/publicationService.ts`
- Create: `scripts/cms/api/publication/publicationService.integration.test.ts`
- Modify: `scripts/cms/api/store.ts`
- Modify: `src/cms/cmsContentUrls.ts`
- Modify: `src/cms/loadCmsToursFile.ts`

**Interfaces:**
- Produces artifact keys `public/cms/tours/versions/<sha256>.json` and manifest `public/cms/tours/manifest.json`.
- Produces manifest `{ schemaVersion: 1, artifactKey: string, checksum: string, publishedAt: string }`.
- Produces `publishCatalog(input): Promise<PublicationResult>` and `unpublishTour(input)`.

- [ ] **Step 1: Write failing artifact tests**

```ts
const a = buildPublicArtifact([tourB, tourA], now);
const b = buildPublicArtifact([tourA, tourB], now);
expect(a.bytes).toEqual(b.bytes);
expect(a.checksum).toMatch(/^[a-f0-9]{64}$/);
expect(JSON.parse(a.bytes.toString()).tours).toHaveLength(2);
```

Test that drafts, review comments, actor IDs and internal versions are absent.

- [ ] **Step 2: Write failing publication safety test**

Use a fake object store that fails manifest upload. Assert the old manifest remains readable and the DB job is `failed`.

- [ ] **Step 3: Verify failure**

Run: `npm.cmd test -- scripts/cms/api/publication`

Expected: FAIL because publisher modules do not exist.

- [ ] **Step 4: Extend object-store boundary**

Add binary-safe methods without removing existing media methods:

```ts
type CmsObjectStore = {
  getJson(key: string): Promise<unknown | null>;
  putJson(key: string, value: unknown): Promise<void>;
  putBytes(key: string, bytes: Uint8Array, contentType: string): Promise<void>;
};
```

- [ ] **Step 5: Implement deterministic build and checksum**

Sort tours by stable ID, serialize with a fixed JSON shape and UTF-8 encoding, compute SHA-256, parse the result through `parseCmsToursFile`, then return bytes/key/checksum. Never include DB-only fields.

- [ ] **Step 6: Implement publish order**

1. Create pending DB job.
2. Build and validate complete catalog.
3. Upload versioned artifact.
4. Read the uploaded object back and verify checksum.
5. Upload manifest last.
6. In a DB transaction mark publication active, freeze slug on first publish, set workflow `published`, and mark job succeeded.

If steps 2–5 fail, mark job failed and do not alter DB active publication or the previous manifest.

- [ ] **Step 7: Add manifest-compatible public loader**

`loadCmsToursFile` first tries manifest, fetches its artifact and verifies schema; during rollout it falls back to the current direct `tours.json` URL if manifest is absent. Do not fall back after a manifest exists but points to invalid content—surface that as a publication fault.

- [ ] **Step 8: Verify publisher**

Run: `npm.cmd test -- scripts/cms/api/publication src/cms/loadCmsToursFile.test.ts src/cms/cmsContentUrls.test.ts`

Expected: deterministic output, failure safety and compatibility tests PASS.

- [ ] **Step 9: Proposed commit checkpoint**

```bash
git add scripts/cms/api/publication scripts/cms/api/store.ts src/cms/cmsContentUrls.ts src/cms/loadCmsToursFile.ts src/cms/*.test.ts
git commit -m "feat: publish versioned cms artifacts"
```

---

### Task 4: Lifecycle API and admin UI

**Files:**
- Modify: `scripts/cms/api/app.ts`
- Modify: `scripts/cms/api/app.test.ts`
- Modify: `src/admin/api.ts`
- Modify: `src/admin/TourEditorPage.tsx`
- Modify: `src/admin/ToursPage.tsx`
- Modify: `src/admin/components/AdminTourCard.tsx`
- Modify: `src/admin/tourStatusAppearance.ts`
- Modify: `src/admin/tourStatusAppearance.test.ts`
- Create: `src/admin/components/TourReviewActions.test.tsx`

**Interfaces:**
- Produces endpoints `POST /tours/:id/review`, `/return`, `/publish`, `/unpublish`, `/archive`.
- All mutation bodies include `version`; return body contains `document`, `meta`, `workflowStatus`, `version`.

- [ ] **Step 1: Add failing API role/lifecycle tests**

Assert editor can submit, cannot publish; admin can publish/unpublish; return requires comment; stale version returns 409; frozen slug returns 409 `slug_frozen`.

- [ ] **Step 2: Add failing UI tests**

```tsx
expect(screen.getByRole('button', { name: 'Отправить на проверку' })).toBeVisible();
expect(screen.queryByRole('button', { name: 'Опубликовать' })).not.toBeInTheDocument();
```

For admin/review state, assert publish and return controls; for published state, assert unpublish.

- [ ] **Step 3: Verify failures**

Run: `npm.cmd test -- scripts/cms/api/app.test.ts src/admin/tourStatusAppearance.test.ts src/admin/components/TourReviewActions.test.tsx`

Expected: FAIL because lifecycle routes/actions do not exist.

- [ ] **Step 4: Replace S3 draft request paths with repository calls**

Create/list/get/save routes use `TourRepository`; asset binary upload remains in S3 and its public URL is referenced by the saved revision. Remove `persistDraft` and direct catalog mutation from request handlers after parity tests pass.

- [ ] **Step 5: Add lifecycle API client methods**

```ts
adminSubmitTour(id, version)
adminReturnTour(id, version, comment)
adminPublishTour(id, version)
adminUnpublishTour(id, version)
adminArchiveTour(id, version)
```

Map `version_conflict`, `slug_frozen`, `admin_required` and publish blockers to distinct UI errors.

- [ ] **Step 6: Implement role-aware controls**

Show current workflow state and next valid actions. Disable slug input after first publication and explain why. Require confirmation for unpublish/archive and a comment for return. On 409 retain unsaved local fields and offer reload.

- [ ] **Step 7: Verify API/UI**

Run Task 4 tests plus `npm.cmd test -- src/admin/ToursPage.test.tsx src/admin/SeasonToursPage.test.tsx`.

Expected: lifecycle, role visibility and existing list behavior PASS.

- [ ] **Step 8: Proposed commit checkpoint**

```bash
git add scripts/cms/api/app.ts scripts/cms/api/app.test.ts src/admin/api.ts src/admin/TourEditorPage.tsx src/admin/ToursPage.tsx src/admin/components/AdminTourCard.tsx src/admin/components/TourReviewActions.test.tsx src/admin/tourStatusAppearance.ts src/admin/tourStatusAppearance.test.ts
git commit -m "feat: add tour review and unpublish workflow"
```

---

### Task 5: CMS migration compatibility and end-to-end publication gate

**Files:**
- Create: `scripts/cms/import-tours-to-postgres.ts`
- Create: `scripts/cms/import-tours-to-postgres.test.ts`
- Create: `e2e/cms-publication.spec.ts`
- Modify: `scripts/cms/api/server.ts`
- Retain read-only during transition: `scripts/cms/api/store.ts`

**Interfaces:**
- Importer returns `{ tours: number; revisions: number; published: number; skipped: number; errors: ImportError[] }`.
- Import is idempotent by existing tour ID and source revision fingerprint.

- [ ] **Step 1: Write importer tests**

Given a published catalog plus a newer draft, assert one tour, two revisions, current revision points to draft, publication points to published revision, and a second run inserts nothing.

- [ ] **Step 2: Verify importer test fails**

Run: `npm.cmd test -- scripts/cms/import-tours-to-postgres.test.ts`

Expected: FAIL because importer does not exist.

- [ ] **Step 3: Implement dry-run-first importer**

Read through `CmsJsonStore`, validate every source document, compute a deterministic revision fingerprint, print counts/errors by tour ID, and require `--apply` for DB writes. Abort the transaction if any source document fails schema validation.

- [ ] **Step 4: Add E2E lifecycle test**

Use a disposable database and fake S3 server. Login as editor, edit and submit; login as admin, publish; load public manifest/artifact and see the tour; unpublish and confirm the next artifact excludes it. Assert no app rebuild command runs.

- [ ] **Step 5: Run complete Plan 3 gate**

```powershell
npm.cmd test -- scripts/cms/api/tours scripts/cms/api/publication scripts/cms/import-tours-to-postgres.test.ts src/cms src/admin
npm.cmd run lint -- --quiet scripts/cms/api scripts/cms/import-tours-to-postgres.ts src/cms src/admin
npm.cmd exec playwright test e2e/cms-publication.spec.ts
```

Expected: focused unit/integration tests, lint and CMS E2E PASS.

- [ ] **Step 6: Manual rollback smoke test**

Force an artifact upload/readback failure, attempt publication, then load the public site.

Expected: admin sees failure, audit/job records it, and the public site still renders the previous valid catalog.

- [ ] **Step 7: Proposed commit checkpoint**

```bash
git add scripts/cms/import-tours-to-postgres.ts scripts/cms/import-tours-to-postgres.test.ts e2e/cms-publication.spec.ts scripts/cms/api/server.ts
git commit -m "test: prove atomic cms publication flow"
```

---

### Task 6: Administrator audit viewer

**Files:**
- Modify: `scripts/cms/api/audit/auditRepository.ts`
- Modify: `scripts/cms/api/app.ts`
- Modify: `scripts/cms/api/app.test.ts`
- Modify: `src/admin/api.ts`
- Create: `src/admin/AuditPage.tsx`
- Create: `src/admin/AuditPage.test.tsx`
- Modify: `src/admin/AdminApp.tsx`
- Modify: `src/admin/constants/routes.ts`

**Interfaces:**
- Produces admin-only endpoint `GET /api/cms/audit?cursor=<id>&limit=50&entityType=<type>&entityId=<id>`.
- Produces response `{ items: AuditItemDto[]; nextCursor: string | null }` with actor login, action, entity reference, safe summary and UTC timestamp.

- [ ] **Step 1: Write failing repository and route tests**

Assert reverse-chronological cursor pagination, entity filtering, admin 200, editor 403 and absence of password/session/token values in serialized payload.

```ts
const response = await app.request('/api/cms/audit?limit=50', { headers: adminHeaders });
expect(response.status).toBe(200);
expect(await response.json()).toMatchObject({ items: [expect.objectContaining({ action: 'tour.published' })] });
```

- [ ] **Step 2: Write failing UI test**

```tsx
render(<AuditPage />);
expect(await screen.findByRole('heading', { name: 'Журнал действий' })).toBeVisible();
expect(screen.getByText('Тур опубликован')).toBeVisible();
```

- [ ] **Step 3: Verify failures**

Run: `npm.cmd test -- scripts/cms/api/app.test.ts src/admin/AuditPage.test.tsx`

Expected: FAIL because audit listing and page do not exist.

- [ ] **Step 4: Implement safe paginated audit reading**

Repository selects at most 100 records, joins actor login, uses `(created_at, id)` cursor ordering and maps raw action codes to a whitelisted summary. API never returns password hashes, session hashes, arbitrary inbound payload or secret-bearing error text.

- [ ] **Step 5: Add admin-only audit page**

Add route/navigation visible only to `admin`. Render action, actor, entity and Vladivostok-localized date; provide entity filters and “Показать ещё”. Editors navigating directly receive the existing forbidden state.

- [ ] **Step 6: Verify audit behavior**

Run: `npm.cmd test -- scripts/cms/api/app.test.ts src/admin/AuditPage.test.tsx`

Expected: pagination, redaction, role and UI tests PASS.

- [ ] **Step 7: Proposed commit checkpoint**

```bash
git add scripts/cms/api/audit/auditRepository.ts scripts/cms/api/app.ts scripts/cms/api/app.test.ts src/admin/api.ts src/admin/AuditPage.tsx src/admin/AuditPage.test.tsx src/admin/AdminApp.tsx src/admin/constants/routes.ts
git commit -m "feat: expose admin audit log"
```

## Plan 3 exit gate

- Drafts/revisions/workflow state are stored in PostgreSQL.
- Editors submit; admins return, publish, unpublish and archive according to role rules.
- First publication freezes slug.
- Public artifacts are deterministic, versioned and activated by manifest last.
- Administrators can inspect a redacted, paginated audit log; editors cannot.
- Failed publication leaves the prior artifact active.
- Existing public loader remains compatible during controlled rollout.
- Focused tests, lint and publication E2E are green.
