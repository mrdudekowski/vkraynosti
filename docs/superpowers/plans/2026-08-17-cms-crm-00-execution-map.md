# CMS/CRM Phase One Execution Map

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver CMS Release 1 first (PostgreSQL, tour catalog, calendar of departures, independent tour/schedule publication), then CRM as later releases.

**Architecture:** PostgreSQL 17 is the internal source of truth. Hono owns validation, auth and transactions. S3 holds media and published public JSON only. Release 1 does not implement CRM (leads, contacts, payments, teams as data).

**Tech Stack:** TypeScript 5.9, Hono 4, React 19, PostgreSQL 17, Drizzle ORM, Zod 4, Vitest 4, Playwright 1.58, AWS SDK S3.

**Product SSOT:** `docs/handoffs/2026-08-18-cms-crm-plan-funkcionala.docx`

## Global Constraints

- PostgreSQL 17 locally (and later in Timeweb Cloud).
- IDs are UUIDs; timestamps UTC in DB; UI `Asia/Vladivostok`.
- Money is integer kopecks in `BIGINT`; currency RUB.
- No PII, drafts or audit in public S3.
- Do not reset/clean the dirty `web-vkr-test` worktree.
- No push, PR, deploy, production S3, Timeweb or XLSX apply without separate explicit approval.
- Test-first. Proposed git commits in child plans are checkpoints only — commit only when the user asks.
- Do not start CRM plans while any Release 1 gate is red.

---

## Plan sequence

### Release 1 — CMS (current work)

1. Finish postgres auth already in this branch (`users` / `sessions` / `audit_log`, `authRepository`).
   - Exit: CMS login and user admin use PostgreSQL, not `cms-users.json`. Opaque session tokens hashed in DB. Existing `scripts/cms/api/session.test.ts` and `app.test.ts` stay in scope.
2. `2026-08-18-cms-release-one.md`
   - Completeness, duration-in-days, one tour price, departures, calendar, publish permissions, inbox, home widgets, XLSX dry-run.
   - Exit: local acceptance of Release 1.

**Superseded for Release 1 (do not execute as written):**

- `2026-08-17-cms-schedule-release-one.md` — stale: per-departure price, paused status, equal list/calendar, Google Sheets importer, teams in CMS.
- Review/reject loop and admin-only publish in `2026-08-17-cms-crm-03-cms-publication.md` — replaced by inbox + two publish flags. Artifact/manifest ideas may be reused only where they match the new plan.

**Release 1 checkpoint:** stop. No CRM, no deploy, no push until the user accepts evidence.

### Release 2 — for further development

- Product: `2026-08-18-cms-crm-plan-funkcionala.docx` §4.
- Technical child: rewrite `2026-08-17-cms-crm-02-crm-intake.md` after Release 1; do not start it now.

### Release 3 — for further development

- Product: same docx §5. No technical plan until Release 2 is accepted.

## Final acceptance

Release 1 is complete when an administrator can manage the catalog and calendar in PostgreSQL-backed CMS, publish tours and dates independently under the agreed permissions, and the public site shows only published tours and guest-visible statuses. XLSX dry-run is deterministic. Production deploy remains a separate decision.
