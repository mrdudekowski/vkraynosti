# Tour Deletion Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add irreversible tour deletion from the three-dot admin menu while blocking deletion when departures or CRM applications depend on the tour.

**Architecture:** Add an explicit authenticated backend `DELETE /api/cms/tours/:id` endpoint that performs dependency checks and deterministic CMS cleanup through the existing store/key abstractions. Add a typed admin API adapter, a focused confirmation dialog, and page-level orchestration in `SeasonToursPage` so cache refresh and toast feedback stay with existing list ownership.

**Tech Stack:** TypeScript, Hono, Zod, React, React Router, Vitest, Testing Library, existing `CmsJsonStore` and admin design-system components.

## Global Constraints

- Deletion is physical and irreversible; do not add archive, soft-delete, undo, or bulk deletion.
- Backend blocks deletion with `409 tour_has_dependencies` when departures or CRM applications exist.
- Only CMS-owned media under the tour media prefix may be deleted; external URLs remain untouched.
- Reuse existing auth middleware, store/key helpers, `AdminTourActionsMenu`, `AdminDialog`, `AdminButton`, `AdminAlert`, and toast provider.
- Preserve unrelated dirty worktree changes, especially `src/admin/components/ScheduleWeekSplitLayout.tsx`.
- Work backend in `cms-crm-phase1-staging` and admin frontend in `codex/admin-app`.

---

### Task 1: Add backend deletion service and storage cleanup

**Files:**
- Create: `scripts/cms/api/deleteCmsTour.ts`
- Modify: `scripts/cms/api/app.ts`
- Test: `scripts/cms/api/deleteCmsTour.test.ts`

**Interfaces:**
- Consumes: `CmsJsonStore`, `CmsTourDocument`, CMS key helpers, current tour document, dependency counts.
- Produces: `deleteCmsTour(store, input): Promise<void>` that removes owned CMS objects and updates catalog/index JSON without touching unrelated tour records.

- [ ] **Step 1: Write the failing service tests**

Cover a draft-only tour, a published tour, draft-index removal, published catalog removal, owned media cleanup, and preservation of an external media URL. Assert unrelated tours and unrelated media remain.

- [ ] **Step 2: Run the service test to verify it fails**

Run: `node node_modules/vitest/vitest.mjs run scripts/cms/api/deleteCmsTour.test.ts --pool=threads --maxWorkers=1`

Expected: FAIL because `deleteCmsTour` does not exist.

- [ ] **Step 3: Implement deterministic cleanup**

Load and rewrite `CMS_PUBLISHED_CATALOG_KEY` without the target ID, load and rewrite `CMS_DRAFT_INDEX_KEY` without the target ID, delete `cmsDraftDocumentKey(id)`, `cmsDraftMetaKey(id)`, `cmsPublishedDocumentKey(id)`, and delete only keys returned by `mediaObjectKeysForAsset(id, asset)` for the target document.

- [ ] **Step 4: Run the service tests to verify they pass**

Run the same Vitest command. Expected: all deletion-service tests PASS.

- [ ] **Step 5: Commit**

Run in backend worktree:

```bash
git add scripts/cms/api/deleteCmsTour.ts scripts/cms/api/deleteCmsTour.test.ts scripts/cms/api/app.ts
git commit -m "feat(cms): add safe physical tour deletion"
```

### Task 2: Add backend DELETE route and dependency guards

**Files:**
- Modify: `scripts/cms/api/app.ts`
- Test: `scripts/cms/api/app.test.ts`

**Interfaces:**
- Consumes: `deleteCmsTour`, `departureRepository`, `loadCrmFile`, authenticated session, existing tour loaders.
- Produces: `DELETE /api/cms/tours/:id` returning `204`, `404 not_found`, `400 invalid_id`, or `409 tour_has_dependencies`.

- [ ] **Step 1: Write failing API tests**

Add tests for missing tour, invalid ID, a tour with departures, a tour referenced by a CRM application, and successful deletion returning `204` while subsequent list/get calls no longer return the tour.

- [ ] **Step 2: Run the API tests to verify they fail**

Run: `node node_modules/vitest/vitest.mjs run scripts/cms/api/app.test.ts --pool=threads --maxWorkers=1`

Expected: FAIL because the DELETE route is absent.

- [ ] **Step 3: Implement the route**

Validate the path ID, load the tour, query all departures for the tour, inspect CRM records for the tour ID, return the stable conflict response when either dependency exists, otherwise call `deleteCmsTour` and return `c.body(null, 204)`.

- [ ] **Step 4: Run backend verification**

Run the focused API tests and the CMS API test command used by the repository. Expected: new route tests PASS; unrelated database integration tests may remain blocked if the configured local database is unavailable.

- [ ] **Step 5: Commit**

```bash
git add scripts/cms/api/app.ts scripts/cms/api/app.test.ts
git commit -m "feat(cms): guard tour deletion dependencies"
```

### Task 3: Add admin API adapter and copy

**Files:**
- Modify: `src/admin/api.ts`
- Modify: `src/admin/constants/ui.ts`
- Test: `src/admin/api.test.ts`

**Interfaces:**
- Consumes: backend DELETE endpoint.
- Produces: `adminDeleteTour(id: string): Promise<void>` with stable errors `tour_not_found`, `tour_has_dependencies`, and `tour_delete_failed`.

- [ ] **Step 1: Write failing adapter tests**

Assert the encoded DELETE URL, credentials, response handling for `204`, and mapping of backend error codes.

- [ ] **Step 2: Run the adapter tests to verify they fail**

Run: `node node_modules/vitest/vitest.mjs run src/admin/api.test.ts --pool=threads --maxWorkers=1`

Expected: FAIL because `adminDeleteTour` is absent.

- [ ] **Step 3: Implement the adapter and UI copy**

Use the same fetch/error pattern as `adminDeleteDeparture` and add Russian labels for the action, dialog, warning, success, dependency error, and generic error.

- [ ] **Step 4: Run the adapter tests**

Expected: all adapter tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/admin/api.ts src/admin/api.test.ts src/admin/constants/ui.ts
git commit -m "feat(admin): add tour deletion API adapter"
```

### Task 4: Add confirmation dialog and menu action

**Files:**
- Create: `src/admin/components/DeleteTourModal.tsx`
- Modify: `src/admin/components/AdminTourActionsMenu.tsx`
- Modify: `src/admin/components/AdminTourCard.tsx`
- Modify: `src/admin/components/TourList.tsx`
- Test: `src/admin/components/DeleteTourModal.test.tsx`
- Test: `src/admin/components/TourList.test.tsx`

**Interfaces:**
- Consumes: `AdminTourListItem`, `ADMIN_UI`, existing dialog/button/alert components.
- Produces: `onDelete?: () => void` through the existing menu/list callback chain and a modal accepting `tour`, `busy`, `error`, `onClose`, and `onConfirm`.

- [ ] **Step 1: Write failing component tests**

Cover menu visibility, confirmation text, cancel behavior, disabled submit while busy, and dependency error rendering.

- [ ] **Step 2: Run component tests to verify they fail**

Expected: FAIL because the delete action and modal are absent.

- [ ] **Step 3: Implement the modal and destructive menu item**

Place `Удалить тур` in the existing three-dot menu, open `DeleteTourModal`, render the irreversible warning and tour title, associate errors with the dialog status region, and preserve focus behavior through existing `AdminDialog` conventions.

- [ ] **Step 4: Run component tests**

Expected: all delete modal/list tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/admin/components/DeleteTourModal.tsx src/admin/components/DeleteTourModal.test.tsx src/admin/components/AdminTourActionsMenu.tsx src/admin/components/AdminTourCard.tsx src/admin/components/TourList.tsx src/admin/components/TourList.test.tsx
git commit -m "feat(admin): add tour deletion confirmation"
```

### Task 5: Orchestrate deletion from the season tours page

**Files:**
- Modify: `src/admin/SeasonToursPage.tsx`
- Test: `src/admin/SeasonToursPage.test.tsx`

**Interfaces:**
- Consumes: `adminDeleteTour`, `DeleteTourModal`, existing admin cache and toast APIs.
- Produces: successful deletion refreshes the current list and pushes a success toast; blocked and unexpected failures keep the modal open with the mapped message.

- [ ] **Step 1: Write failing page tests**

Add tests for success, dependency error, generic error, repeated-submit protection, cache invalidation/refresh, modal closure, and success toast.

- [ ] **Step 2: Run page tests to verify they fail**

Expected: FAIL because SeasonToursPage does not own delete state or callback.

- [ ] **Step 3: Implement page-level orchestration**

Track the selected tour, busy state, and error; call `adminDeleteTour`; on success invalidate/refresh tours and publish queue, close the dialog, and push the success toast; on failure map `tour_has_dependencies` to its specific message and keep the dialog open.

- [ ] **Step 4: Run focused admin tests**

Run:

```bash
node node_modules/vitest/vitest.mjs run src/admin/api.test.ts src/admin/components/DeleteTourModal.test.tsx src/admin/components/TourList.test.tsx src/admin/SeasonToursPage.test.tsx --pool=threads --maxWorkers=1
```

Expected: all affected admin tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/admin/SeasonToursPage.tsx src/admin/SeasonToursPage.test.tsx
git commit -m "feat(admin): complete tour deletion workflow"
```

### Task 6: Verify both worktrees and prepare handoff

**Files:**
- Modify: none unless verification reveals a feature regression.

- [ ] **Step 1: Run admin typecheck and build**

Run `npm run typecheck` and `npm run build:admin` in `codex/admin-app`. Expected: both exit successfully.

- [ ] **Step 2: Run backend focused tests**

Run the new service/API tests in `cms-crm-phase1-staging`. Expected: deletion tests pass; report separately any environment-dependent integration blocker.

- [ ] **Step 3: Inspect diffs and worktree safety**

Run `git diff --check`, `git status --short --branch`, and review both branch logs. Confirm no unrelated dirty file was staged.

- [ ] **Step 4: Perform end-to-end scenario review**

Verify the path: open three-dot menu -> choose delete -> see irreversible warning -> cancel or confirm -> dependency block or physical deletion -> list refresh -> toast.

- [ ] **Step 5: Report publication separately**

Do not push either branch until explicitly requested. Report local commits, test results, and any unrelated existing changes separately from remote publication status.
