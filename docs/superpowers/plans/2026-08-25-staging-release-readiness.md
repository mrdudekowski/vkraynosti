# Staging Release Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:verification-before-completion before claiming release readiness. Preserve unrelated user changes and commit only reviewed production scope.

**Goal:** Prepare `origin/cms-crm-phase1-staging` as a deployable site + CMS/CRM release without losing existing user work or publishing secrets and local-only tooling.

**Architecture:** Treat the dirty checkout as source material. First classify tracked and untracked changes into production, tests, migrations, documentation, and local-only artifacts; then validate each production group with targeted checks. Create only reviewed commits from an isolated temporary Git index, push staging, and verify the remote hash and deployment contract.

**Tech Stack:** Vite, React, TypeScript, Vitest, ESLint, Drizzle, Node.js 20, GitHub staging branch, Timeweb Backend App.

## Global Constraints

- Workspace: `E:\Cursor Projects\Vkrainosti-cms-crm-phase1` only.
- Never run `reset`, `clean`, destructive checkout, or mass formatting.
- Do not read, print, stage, or commit `CMS_AUTH_SECRET`, `CMS_ADMIN_PASSWORD`, `CMS_CRM_INBOUND_SECRET`, `DATABASE_URL`, or `S3_SECRET_KEY` values.
- Preserve unrelated user changes; use a temporary Git index for reviewed commits where needed.
- Do not change `package.json` location, framework preset, production branch, domain, database, or repository secrets.

## Tasks

### Task 1: Inventory and classify the dirty checkout

- [ ] Record current branch, HEAD, remote staging hash, status counts, staged paths, tracked diffs, and untracked paths.
- [ ] Mark production candidates, test-only files, docs, generated assets, local diagnostics, env files, and secret-bearing paths.
- [ ] Confirm no secret values are inspected or included in candidate paths.

### Task 2: Stabilize validation gates

- [ ] Run `npm run typecheck`, `npm run lint`, `npm run build`, and targeted changed-area tests.
- [ ] Fix only verified lint/test/accessibility defects, with a focused test rerun after each fix.
- [ ] Run the complete Vitest suite with a bounded worker configuration; record failures, warnings, and infrastructure-only limitations.
- [ ] Run `git diff --check` and leave unrelated whitespace untouched unless it blocks the release gate.

### Task 3: Validate CMS/CRM deployment contract

- [ ] Inspect `package.json`, `scripts/cms/api/server.ts`, health route, runtime env loading, and database migration scripts without printing secret values.
- [ ] Confirm `npm run cms:api` is the root start command and Node 20-compatible dependencies are present.
- [ ] Run repository-local CMS/API tests that do not require production credentials; identify database-dependent tests separately.

### Task 4: Build the reviewed staging commit set

- [ ] Stage only reviewed production files, required tests, migrations, and required documentation.
- [ ] Exclude `.env*` secrets, probes, restore scripts, S3 diagnostics, generated runtime output, and unrelated experiments.
- [ ] Create focused commit(s), inspect each commit with `git show --stat` and `git diff-tree`, and verify the normal worktree remains intact.

### Task 5: Push and verify final staging

- [ ] Run final typecheck, lint, build, targeted tests, and diff checks against the commit candidate.
- [ ] Push the reviewed commit set to `origin/cms-crm-phase1-staging`.
- [ ] Verify `git ls-remote origin refs/heads/cms-crm-phase1-staging` equals the local release HEAD.
- [ ] Report exact commit hashes, validation results, exclusions, and whether Timeweb can redeploy.
