# CMS/CRM Migration, Hardening and Pilot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Import legacy CMS/CRM data safely, restore a green project quality gate, prove backup/restore to PostgreSQL 17, verify security boundaries and complete a controlled real-manager pilot.

**Architecture:** Importers are dry-run-first, idempotent and evidence-producing. Hardening separates repository defects from generated trash, while final acceptance uses disposable infrastructure before any approved Timeweb or production switch.

**Tech Stack:** PostgreSQL 17, Drizzle, pg_dump/pg_restore, Hono, Vitest, Playwright, ESLint, TypeScript, Vite, S3-compatible storage.

## Global Constraints

- Plans 1–3 exit gates are green before starting.
- Original S3 JSON is preserved unchanged as a control copy.
- Ambiguous people are never auto-merged.
- Import, Timeweb access, S3 policy changes, production switch and commits require explicit user approval.
- `nm_trash_*` is not deleted without explicit approval; checks must exclude it through precise configuration.
- A backup is accepted only after restoration and data verification in a separate PostgreSQL 17 database.
- Pilot ends only when the manager confirms the parallel table is no longer required.

---

### Task 1: Legacy `crm.json` dry-run report and idempotent importer

**Files:**
- Create: `scripts/cms/import-crm-json.ts`
- Create: `scripts/cms/import-crm-json.test.ts`
- Create: `scripts/cms/crmImportReport.ts`
- Create: `scripts/cms/crmImportReport.test.ts`
- Create at runtime only: `.local/cms-import/` reports; keep ignored.
- Modify: `.gitignore`

**Interfaces:**
- Produces `analyzeLegacyCrm(file): CrmImportReport`.
- Produces CLI modes `--source <file>`, default dry run, optional `--apply`.
- Report contains source hash, entity counts, exact-phone merge groups, ambiguous groups, rejected rows and proposed inserts.

- [ ] **Step 1: Write failing report tests**

```ts
const report = analyzeLegacyCrm(fixture);
expect(report.exactPhoneGroups[0].normalizedPhone).toBe('+79141234567');
expect(report.ambiguousGroups).toContainEqual(expect.objectContaining({ reason: 'missing_or_invalid_phone' }));
expect(report.sourceSha256).toMatch(/^[a-f0-9]{64}$/);
```

Include fixture cases: same normalized phone, same name/different phone, invalid phone, one person with multiple deals, old `paid: true` and status values.

- [ ] **Step 2: Verify tests fail**

Run: `npm.cmd test -- scripts/cms/crmImportReport.test.ts scripts/cms/import-crm-json.test.ts`

Expected: FAIL because importer/report modules do not exist.

- [ ] **Step 3: Implement deterministic analysis**

Map old stages:

```ts
const stageMap = {
  new: 'new', in_progress: 'in_progress', booked: 'prepaid',
  declined: 'declined', no_answer: 'no_answer'
} as const;
```

`paid: true` cannot invent an amount: create an import warning and preserve it as an audit/import note; a manager must enter verified payment amount later. Exact phones auto-group; name/email similarities are report-only.

- [ ] **Step 4: Implement idempotent apply mode**

Store `(source_sha256, legacy_entity_type, legacy_id)` in an `import_ledger` table added by a new migration. One DB transaction inserts people/deals/touches and ledger entries; any rejected schema row aborts apply. A second run returns all rows as skipped.

- [ ] **Step 5: Protect runtime reports**

Add `/.local/cms-import/` to `.gitignore`. Reports may contain PII and must never be committed, uploaded to public S3 or printed in CI logs. Console output contains counts and report path only.

- [ ] **Step 6: Verify importer**

Run with `TEST_DATABASE_URL`: `npm.cmd test -- scripts/cms/crmImportReport.test.ts scripts/cms/import-crm-json.test.ts`

Expected: all mapping, ambiguity and idempotency tests PASS.

- [ ] **Step 7: Proposed commit checkpoint**

```bash
git add scripts/cms/import-crm-json.ts scripts/cms/import-crm-json.test.ts scripts/cms/crmImportReport.ts scripts/cms/crmImportReport.test.ts scripts/cms/api/db/schema.ts drizzle .gitignore
git commit -m "feat: add safe legacy crm importer"
```

---

### Task 2: Restore clean lint, typecheck and build gates

**Files:**
- Modify: `eslint.config.js`
- Modify: `tsconfig.app.json`
- Modify: `src/admin/components/AboutSection.test.tsx`
- Modify: `src/admin/components/AdminAssetPreview.tsx`
- Modify: `src/cms/siteTourToCmsDocument.ts`
- Modify: files with Font Awesome declaration-subpath imports identified by current `tsc`
- Modify: file using the obsolete `react-day-picker` exported type identified by current `tsc`
- Modify: `package.json`

**Interfaces:**
- Produces scripts `typecheck`, `check:cms-crm`, and a full `build` that remains compatible with current deploy build.

- [ ] **Step 1: Capture the current failure baseline**

Run:

```powershell
npm.cmd run lint
npm.cmd exec tsc -b --pretty false
npm.cmd run build
```

Expected before fixes: lint enters `nm_trash_*`; TypeScript reports Font Awesome declaration subpaths, `react-day-picker` type mismatch, invalid Testing Library selector option, nullable preview value and unused `siteTourToCmsDocument` variable. Save only error counts and file paths in the task notes—never generated dependency contents.

- [ ] **Step 2: Exclude only generated trash**

Add exact global ignores `nm_trash_*/**` and `.local/**` to ESLint. Do not ignore `src`, `scripts`, tests or all untracked files.

- [ ] **Step 3: Fix source-level TypeScript errors with focused tests**

- Replace declaration-subpath Font Awesome imports with public package exports.
- Use the current `react-day-picker` v9 public type exported by the installed package.
- Replace unsupported selector option in `AboutSection.test.tsx` with a semantic scoped query.
- Narrow nullable media values before passing them to string-only props in `AdminAssetPreview.tsx`.
- Remove or use the verified unused value in `siteTourToCmsDocument.ts`; do not suppress `noUnusedLocals`.

Run the closest test after each file change and confirm it passes before moving on.

- [ ] **Step 4: Add explicit quality scripts**

```json
{
  "typecheck": "tsc -b --pretty false",
  "check:cms-crm": "vitest run scripts/cms src/cms src/crm src/admin && eslint scripts/cms src/cms src/crm src/admin && tsc -b --pretty false"
}
```

- [ ] **Step 5: Run the full gate**

Run: `npm.cmd run lint` then `npm.cmd run typecheck` then `npm.cmd test` then `npm.cmd run build`.

Expected: all commands exit 0. Browser smoke alone is not a substitute for these gates.

- [ ] **Step 6: Proposed commit checkpoint**

```bash
git add eslint.config.js tsconfig.app.json package.json src/admin src/cms
git commit -m "fix: restore project quality gates"
```

Review staged files before any authorized commit so unrelated dirty-worktree changes are not included.

---

### Task 3: Security, privacy and recovery gates

**Files:**
- Create: `scripts/cms/security/check-public-artifacts.ts`
- Create: `scripts/cms/security/check-public-artifacts.test.ts`
- Create: `scripts/cms/security/check-s3-policy.ts`
- Create: `scripts/cms/security/check-s3-policy.test.ts`
- Create: `scripts/cms/backup-postgres.ps1`
- Create: `scripts/cms/restore-postgres.ps1`
- Modify: `package.json`
- Modify: `.env.cms-dev.example`

**Interfaces:**
- Produces commands `cms:security:artifacts`, `cms:security:s3`, `db:backup`, `db:restore`.
- Backup/restore scripts require explicit file/database parameters; they never default to a broad directory or production URL.

- [ ] **Step 1: Write failing public-artifact tests**

```ts
expect(() => assertPublicArtifactSafe({ tours: [], people: [{ phone: '+7...' }] }))
  .toThrow('forbidden public key: people');
expect(() => assertPublicArtifactSafe(validToursFile)).not.toThrow();
```

Forbidden key patterns include phone, email, payment, password, session, audit, draft, reviewComment and private payload.

- [ ] **Step 2: Verify test fails**

Run: `npm.cmd test -- scripts/cms/security`

Expected: FAIL because security modules do not exist.

- [ ] **Step 3: Implement structural artifact scan**

Walk parsed JSON keys recursively, validate the final file with `parseCmsToursFile`, cap file size, and report JSON paths without echoing forbidden values.

- [ ] **Step 4: Implement S3 policy probe**

Given configured public base URL and known test keys, make unauthenticated GET/HEAD requests. Public manifest/artifact/media must be readable; generated private/draft probe keys must return 403/404. Never print signed URLs or credentials.

- [ ] **Step 5: Implement parameterized backup and restore scripts**

Backup signature:

```powershell
param([Parameter(Mandatory)][string]$DatabaseUrl,
      [Parameter(Mandatory)][string]$OutputFile)
pg_dump --format=custom --no-owner --no-privileges --file $OutputFile $DatabaseUrl
```

Restore signature:

```powershell
param([Parameter(Mandatory)][string]$DatabaseUrl,
      [Parameter(Mandatory)][string]$InputFile)
pg_restore --clean --if-exists --no-owner --no-privileges --dbname $DatabaseUrl $InputFile
```

Before either operation resolve the file path and refuse directories. Never log the URL password.

- [ ] **Step 6: Verify security scripts locally**

Run: `npm.cmd test -- scripts/cms/security` and run artifact scan against local public CMS JSON.

Expected: tests PASS; local public file has no forbidden keys.

- [ ] **Step 7: Verify backup restoration to a separate local DB**

Create an explicitly named disposable database `vkrainosti_restore_check`, backup the development DB, restore into the disposable DB, apply `db:check`, compare table counts and sample checksums, then drop only the verified disposable database.

Expected: schema/migration version, counts and sample hashes match.

- [ ] **Step 8: Proposed commit checkpoint**

```bash
git add scripts/cms/security scripts/cms/backup-postgres.ps1 scripts/cms/restore-postgres.ps1 package.json .env.cms-dev.example
git commit -m "chore: add cms security and recovery gates"
```

---

### Task 4: Timeweb Cloud restore rehearsal

**Files:**
- Create: `docs/cms-timeweb-runbook.md`
- Create locally only: `.local/cms-import/timeweb-restore-evidence.md`

**Interfaces:**
- Produces an operator runbook with preflight, restore, verification, rollback and secret-rotation steps.
- Consumes official Timeweb PostgreSQL connection details supplied by the user at execution time.

- [ ] **Step 1: Write the runbook before touching cloud state**

Document PostgreSQL 17 cluster creation, TLS connection string, IP allowlist/firewall, migration application, custom dump restore with `--no-owner --no-privileges`, verification queries, app secret switch and rollback to the old connection string.

- [ ] **Step 2: Obtain explicit cloud authorization**

Do not connect until the user supplies/approves the test Timeweb database and authorizes network writes. Store credentials in environment variables only.

- [ ] **Step 3: Preflight the empty test cluster**

Verify `SELECT version()` reports PostgreSQL 17, TLS is active, required extensions are available, the target database is empty, and the role has create/alter/select/insert/update permissions needed by migrations.

- [ ] **Step 4: Restore a sanitized or approved dump**

Apply migrations, run `pg_restore --no-owner --no-privileges`, then run schema check. Do not use Timeweb panel direct import from a laptop unless the source is intentionally reachable from Timeweb subnet `92.53.116.0/24`.

- [ ] **Step 5: Verify restored data**

Compare migration version, row counts, aggregate payment totals, active publication count and deterministic sample hashes. Run API smoke against the test DB with Telegram and production S3 disabled/mocked.

- [ ] **Step 6: Prove rollback**

Switch the test API back to the local DB secret and verify health/login. This proves configuration rollback without deleting the cloud test database.

- [ ] **Step 7: Record evidence without secrets**

Record date, PostgreSQL version, migration ID, count comparison, test commands and PASS/FAIL only in the local evidence file. Do not include hostname credentials, tokens or PII.

- [ ] **Step 8: Proposed documentation commit checkpoint**

```bash
git add docs/cms-timeweb-runbook.md
git commit -m "docs: add timeweb postgres migration runbook"
```

---

### Task 5: Critical E2E suite and controlled manager pilot

**Files:**
- Create: `e2e/cms-crm-critical.spec.ts`
- Create: `docs/cms-crm-pilot-checklist.md`
- Modify: `playwright.config.ts` only if disposable API/DB startup is not already supported.

**Interfaces:**
- E2E covers one lead, idempotent retry, returning person/new deal, payments, publication/unpublication, conflict and Telegram outage.
- Pilot checklist records acceptance criterion, owner, evidence and result without PII.

- [ ] **Step 1: Write the failing critical E2E**

Test sequence:

1. submit one site lead;
2. replay same key and assert one deal;
3. submit new key/same phone and assert two deals/one person;
4. manager records contact, prepayment, final payment and closes;
5. balance reaches zero;
6. stale second browser receives conflict;
7. Telegram mock outage leaves lead pending, recovery sends once;
8. editor submits tour, admin publishes then unpublishes;
9. public artifact changes without running build.

- [ ] **Step 2: Verify E2E fails before final wiring**

Run: `npm.cmd exec playwright test e2e/cms-crm-critical.spec.ts`

Expected: at least one incomplete acceptance branch fails with a specific assertion, not infrastructure ambiguity.

- [ ] **Step 3: Fix only acceptance wiring defects**

Use TDD per defect. Do not add calendar editor, analytics, tasks, chat, acquiring, 1C, homepage editor or client account.

- [ ] **Step 4: Run complete automated acceptance**

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
npm.cmd exec playwright test e2e/cms-publication.spec.ts e2e/cms-crm-critical.spec.ts
```

Expected: every command exits 0 with no skipped critical scenario.

- [ ] **Step 5: Run approved limited pilot**

Before pilot: verified backup, rollback connection, S3 privacy PASS, on-call owner and short observation window. During pilot: manager handles approved real leads only in CRM while import source remains read-only. Do not write new data back to `crm.json`.

- [ ] **Step 6: Collect manager acceptance**

Manager confirms they can find new/overdue/payment work, contact client, change stage, schedule next step, add payment/refund, read balance and see repeat trips. Record friction as follow-up issues; only blockers to the agreed flow are fixed in this phase.

- [ ] **Step 7: Close legacy write paths after acceptance**

Remove runtime imports and writes through `scripts/cms/api/crmStore.ts` and `scripts/cms/api/usersStore.ts`; retain migration tools and immutable control exports. Confirm code search shows no request handler referencing `CRM_PRIVATE_KEY` or the old user JSON key.

- [ ] **Step 8: Final verification after cleanup**

Repeat the complete automated acceptance command and search:

```powershell
rg -n "crmStore|usersStore|CRM_PRIVATE_KEY|private/crm\.json" scripts src
```

Expected: only explicitly documented importer/control-copy references remain; all gates stay green.

- [ ] **Step 9: Proposed final commit checkpoint**

```bash
git add e2e/cms-crm-critical.spec.ts docs/cms-crm-pilot-checklist.md scripts/cms/api src package.json
git commit -m "feat: complete cms crm phase one pilot"
```

## Plan 4 exit gate

- Legacy data import has a reviewed report, control hash and repeatable result.
- Ambiguous duplicates remain separate and visible for manual review.
- Full lint, typecheck, unit/integration tests, build and critical E2E are green.
- Public S3 has no PII, finance, draft or private data; private probes are inaccessible.
- A custom-format dump restores successfully into separate local PostgreSQL 17 and approved Timeweb test PostgreSQL 17.
- Rollback is proven and documented.
- Manager completes the real pilot and confirms the parallel table is no longer required.
