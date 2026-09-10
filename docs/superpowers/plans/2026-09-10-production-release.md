# Production Release Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Выпустить минимальный проверяемый production-релиз с единой CMS-ценой тура и корректным отображением дней программы.

**Architecture:** Базой релиза служит фактический `origin/cms-crm-phase1-staging` (`e0721ad`), чтобы не переписывать удалённую историю. В релиз добавляются только изменения цены, сохранения `day`, публичных разделителей дней и admin-части; крупные CMS/site snapshot, SEO и showcase-изменения остаются вне этого релиза.

**Tech Stack:** React, TypeScript, Vite, Vitest, ESLint, GitHub Actions, GitHub Pages.

## Global Constraints

- CMS остаётся единственным production-источником цены тура.
- Цена отдельного выезда не принимается, не сохраняется и не публикуется.
- Не использовать force-push и не переписывать `origin/cms-crm-phase1-staging`.
- Не включать unrelated dirty-worktree files, SEO/showcase work и крупную snapshot-миграцию.
- До production push пройти tests, typecheck, lint и production builds для frontend и admin.
- Production обновляется двумя независимыми ветками: `cms-crm-phase1-staging` для frontend/backend и `codex/admin-app` для admin.

---

### Task 1: Prepare release candidate from the actual staging tip

**Files:**
- Create: `docs/superpowers/plans/2026-09-10-production-release.md`
- Worktree: `E:/Cursor Projects/Vkrainosti-cms-crm-phase1/.worktrees/production-release`

- [ ] Confirm `origin/cms-crm-phase1-staging` via `git ls-remote` and record its tip.
- [ ] Create an isolated release branch from that tip.
- [ ] Verify the release worktree is clean before applying changes.

### Task 2: Apply the scoped product fixes

**Files:**
- Apply: local commits `6e2a9aa` and `4c66993` where they apply cleanly.
- Apply: local admin commit `d39a80a` to the admin release line only if its patch applies without unrelated changes.
- Resolve conflicts by preserving the newer staging CMS/site architecture and the release requirements above.

- [ ] Apply the public day-separator change.
- [ ] Apply the CMS-only price change to public frontend/backend contracts.
- [ ] Apply the CMS-only price change to admin contracts and views.
- [ ] Confirm no active `overridePriceRub`, `departurePriceRub`, or departure-price UI remains in runtime source.

### Task 3: Verify behavior and release contracts

**Files:**
- Test: existing focused tests changed by the scoped commits.

- [ ] Run focused Vitest suites for public day separators, schedule payloads, price resolution, and admin price display.
- [ ] Run `npm run typecheck` and `npm run lint -- --quiet` in frontend and admin release worktrees.
- [ ] Run `npm run build` for the public frontend and `npm run build:admin` for admin.
- [ ] Inspect generated diff and ensure no unrelated files are staged.

### Task 4: Production branch gate

- [ ] Confirm the release candidate is based on the current `origin/cms-crm-phase1-staging` tip.
- [ ] After all frontend/backend checks pass, update `cms-crm-phase1-staging` with a normal fast-forward push.
- [ ] After all admin checks pass, update `codex/admin-app` with a normal fast-forward push.
- [ ] Do not use force-push; if either remote branch advances, stop and rebase/merge only after reviewing the new commits.
- [ ] Run the production smoke checks separately for the public site and admin.

### Task 5: Rollback evidence

- [ ] Record the pre-release SHA and release SHA for each of the two production branches.
- [ ] Confirm rollback means reverting the release commit or redeploying the pre-release SHA; do not reset shared branches.
- [ ] Report deployment result separately from local commit and Git push result.
