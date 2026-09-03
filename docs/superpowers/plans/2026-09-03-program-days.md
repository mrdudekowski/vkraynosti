# Program Days Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task with review checkpoints.

**Goal:** Add durable `day` selection to tour program steps, driven by tour duration and rendered correctly in CMS, admin, and public site.

**Architecture:** Extend the canonical CMS program-step schema with `day` while accepting legacy records without it as Day 1. Thread the normalized field through draft/patch and site conversion layers. Update the admin editor to filter by a day tab and add new steps to the active day; group public output by day only for multi-day tours.

**Tech Stack:** TypeScript, Zod, React, Vitest, Vite.

## Global Constraints

- Legacy program steps without `day` must normalize to `day: 1`.
- `day` is an integer greater than or equal to 1.
- Existing one-day public rendering remains visually compatible.
- Do not delete steps when duration decreases; show an actionable warning.
- Preserve the existing mobile drag/hold reorder behavior within a day.
- Run tests before each implementation step and `npm run build:admin` before handoff.

---

### Task 1: Canonical program-step schema and normalization

**Files:**
- Modify: `src/cms/cmsTourDocument.ts`
- Modify: `src/cms/patchFromDocument.ts`
- Modify: `src/cms/applyTourTextPatch.ts`
- Test: `src/cms/cmsTourDocument.test.ts`
- Test: `src/admin/patchFromDocument.test.ts`
- Test: `src/cms/applyTourTextPatch.test.ts`

**Interfaces:**
- Produce `ProgramStep = { day: number; timeLabel: string; description: string }` at canonical boundaries.
- Accept legacy `{ timeLabel, description }` input and normalize missing `day` to `1`.

- [ ] **Step 1: Write failing schema/patch tests** asserting legacy normalization, explicit day preservation, and rejection of `day: 0`.
- [ ] **Step 2: Run `npm test -- --run src/cms/cmsTourDocument.test.ts src/admin/patchFromDocument.test.ts src/cms/applyTourTextPatch.test.ts` and verify the new assertions fail because `day` is absent.
- [ ] **Step 3: Add the Zod field with a default-compatible transform/preprocess and copy `day` through draft and patch serialization.
- [ ] **Step 4: Run the same focused tests and verify green.
- [ ] **Step 5: Run existing CMS conversion tests to catch type-contract regressions.

### Task 2: CMS ↔ public conversion contract

**Files:**
- Modify: `src/cms/cmsDocumentToSiteTour.ts`
- Modify: `src/cms/siteTourToCmsDocument.ts`
- Modify: `src/cms/buildCmsToursFile.ts`
- Test: `src/cms/cmsDocumentToSiteTour.test.ts`
- Test: `src/cms/siteTourToCmsDocument.test.ts`
- Test: `src/cms/buildCmsToursFile.test.ts`

**Interfaces:**
- `siteTour.program` retains `day` for every step.
- Round-trip conversion preserves day and step order.

- [ ] **Step 1: Add failing round-trip tests with two days.
- [ ] **Step 2: Run the three focused test files and verify failure.
- [ ] **Step 3: Update conversion mappings and generated file serialization.
- [ ] **Step 4: Run focused tests and verify green.

### Task 3: Duration-driven admin day tabs

**Files:**
- Modify: `src/admin/components/ProgramSection.tsx`
- Modify: `src/admin/TourEditorPage.tsx`
- Modify: `src/admin/constants/ui.ts`
- Test: `src/admin/components/ProgramSection.test.tsx`
- Test: `src/admin/TourEditorPage.test.tsx`

**Interfaces:**
- `ProgramSection` accepts `durationDays: number | undefined`.
- The active day is local UI state, clamped to available days.
- New step creation sets `day` to the active day.

- [ ] **Step 1: Add failing tests for day tabs, filtering, and adding a step to Day 2.
- [ ] **Step 2: Run focused admin tests and verify failure.
- [ ] **Step 3: Implement day tabs using `TOUR_DURATION_DAY_OPTIONS` up to `durationDays`, with Day 1 fallback when duration is unset.
- [ ] **Step 4: Add an overflow warning when program steps have `day > durationDays`; do not remove those steps.
- [ ] **Step 5: Run focused tests and verify green.

### Task 4: Per-day ordering and mobile interaction

**Files:**
- Modify: `src/admin/components/ProgramSection.tsx`
- Test: `src/admin/components/ProgramSection.test.tsx`

**Interfaces:**
- Drag/hold reorder operates only on the active day.
- The saved program array retains all days and stable order.

- [ ] **Step 1: Add failing test proving a Day 1 move cannot reorder a Day 2 step.
- [ ] **Step 2: Run the test and verify failure.
- [ ] **Step 3: Scope reorder indices to the filtered day list and merge the reordered subset back into the full program.
- [ ] **Step 4: Run the full ProgramSection test file and verify green.

### Task 5: Public grouping and compatibility

**Files:**
- Modify: `src/pages/TourDetailPageFull.tsx`
- Test: `src/pages/TourDetailPageFull.test.tsx` (create if absent, after confirming the existing page test convention).

**Interfaces:**
- One-day programs render without a new day heading.
- Multi-day programs render `День N` groups containing only that day's steps.

- [ ] **Step 1: Add failing one-day/multi-day render tests around `src/pages/TourDetailPageFull.tsx`.
- [ ] **Step 2: Run the renderer tests and verify failure.
- [ ] **Step 3: Implement stable grouping and Russian day headings without changing existing step markup unnecessarily.
- [ ] **Step 4: Run renderer tests and verify green.

### Task 6: Full verification and handoff

**Files:**
- No new source files.
- Verify all modified files and generated output.

- [ ] **Step 1: Run all relevant CMS/admin/public tests.
- [ ] **Step 2: Run `npm run build:admin`.
- [ ] **Step 3: Run `npm run build` if available and confirm no public TypeScript regressions.
- [ ] **Step 4: Inspect `git diff --check` and `git status --short`.
- [ ] **Step 5: Report exact tests/build results and any production migration/deploy steps; do not claim deployment until the branch is pushed and Timeweb build is verified.
