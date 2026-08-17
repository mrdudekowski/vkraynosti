# CMS/CRM Phase One Execution Map

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the approved CMS/CRM vertical slice through four sequential, independently reviewable plans.

**Architecture:** PostgreSQL 17 becomes the internal source of truth; Hono owns transactional business operations; S3 retains media and versioned public artifacts. The plans preserve current public-site behavior while replacing S3 JSON writes behind stable API boundaries.

**Tech Stack:** TypeScript 5.9, Hono 4, React 19, PostgreSQL 17, Drizzle ORM, Zod 4, Vitest 4, Playwright 1.58, AWS SDK S3.

## Global Constraints

- PostgreSQL version is 17 locally and in Timeweb Cloud.
- IDs are UUIDs; timestamps are stored in UTC and displayed in `Asia/Vladivostok`.
- Money is stored as integer kopecks in `BIGINT`; phase-one currency is RUB.
- PostgreSQL contains internal CMS/CRM data; S3 contains media, versioned public JSON and backup exports only.
- No PII, finance, draft or private data may be written to public S3.
- Existing user changes in the dirty worktree must not be reset, cleaned or overwritten.
- Do not deploy, import production data or change external S3/Timeweb state without explicit user approval.
- Each task follows test-first development and ends with its own verification and review gate.
- Commits listed in child plans are proposed checkpoints; create them only after explicit user authorization under repository rules.

---

## Plan sequence

1. `2026-08-17-cms-crm-01-postgres-auth.md`
   - PostgreSQL runtime, migrations, users, revocable server sessions and audit foundation.
   - Exit: the current CMS login/user flows use PostgreSQL and pass API tests.
2. `2026-08-17-cms-crm-02-crm-intake.md`
   - People, deals, touches, payment ledger, manager queue, public intake, idempotency and Telegram outbox.
   - Exit: a request becomes one manageable CRM deal and survives Telegram failure.
3. `2026-08-17-cms-crm-03-cms-publication.md`
   - Tour revisions, review lifecycle, frozen slug and atomic versioned S3 publication.
   - Exit: an administrator publishes/unpublishes without a site rebuild or partial catalog exposure.
4. `2026-08-17-cms-crm-04-migration-pilot.md`
   - `crm.json` import, build/lint recovery, Timeweb restore rehearsal, security gates and real pilot checklist.
   - Exit: all acceptance gates in the approved design are evidenced.

## Dependency rule

Execute the plans in order. Each later plan consumes interfaces named in the preceding plan. Do not start a later plan while the preceding exit gate is red.

## Final acceptance

The phase is complete only after all twelve acceptance criteria in `docs/superpowers/specs/2026-08-17-cms-crm-phase-one-design.md` pass and the manager confirms that the parallel table is no longer required.
