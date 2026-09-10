# Admin Sidebar Mouse-Only Drag Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task with verification checkpoints.

**Goal:** Replace sidebar arrow controls and keyboard exchange with mouse-only native drag-and-drop that shows a non-layout-shifting insertion line.

**Architecture:** Keep the existing `AdminSidebarLayout` persistence model and native HTML5 drag payloads. `AdminSidebarNav` will own transient row/edge drop-target state and render the insertion line; `AdminChrome` will continue to own layout mutations and overflow-dialog coordination. The overflow dialog keeps its existing glassmorphism shell and drag bridge, but loses its select/button keyboard exchange UI.

**Tech Stack:** React, TypeScript, React Router, Vitest, Testing Library, existing Tailwind/admin utility classes.

## Global Constraints

- Desktop sidebar only; mobile/tablet navigation is unchanged.
- Visible arrow controls and all non-mouse reorder controls are removed.
- Dragged rows keep their normal visual appearance; no opacity/captured styling.
- Drop feedback is a thin insertion line rendered without changing row layout.
- Reuse existing admin tokens/classes and `admin.sidebar.layout.v1` persistence.
- Preserve unrelated dirty worktree changes and stage only scoped files.

---

### Task 1: Remove non-mouse reorder controls

**Files:**
- Modify: `src/admin/components/AdminSidebarNav.tsx`
- Modify: `src/admin/components/AdminSidebarOverflowDialog.tsx`
- Modify: `src/admin/components/AdminChrome.tsx`
- Modify: `src/admin/constants/ui.ts`
- Test: `src/admin/components/AdminSidebarNav.test.tsx`
- Test: `src/admin/components/AdminSidebarOverflowDialog.test.tsx`

**Interfaces:**
- Remove `onKeyboardExchange`, keyboard target state, select, and exchange button from the overflow dialog.
- Keep native drag callbacks and `onDropOnVisible` unchanged.
- Remove `moveUp`/`moveDown` UI copy and all call sites.

- [ ] **Step 1: Write failing tests** asserting no arrow buttons exist and no keyboard exchange select/button is rendered.
- [ ] **Step 2: Run the focused component tests and verify they fail for the removed controls.**
- [ ] **Step 3: Remove the arrow span/buttons, keyboard exchange state/props, and `AdminChrome` keyboard callback wiring.
- [ ] **Step 4: Run focused component tests and verify the removal tests pass while native drag tests remain green.**
- [ ] **Step 5: Commit the scoped removal.**

### Task 2: Add insertion-line state and edge-aware visible reorder

**Files:**
- Modify: `src/admin/components/AdminSidebarNav.tsx`
- Modify: `src/admin/adminSidebarLayout.ts`
- Test: `src/admin/components/AdminSidebarNav.test.tsx`
- Test: `src/admin/adminSidebarLayout.test.ts`

**Interfaces:**
- Add a transient drop position type representing `{ index: number; edge: 'before' | 'after' }`.
- Keep `onReorder(fromIndex, toIndex)` as the parent callback, where `toIndex` is the final visible index.
- Update the layout helper to interpret `toIndex` as final index after removal, so dragging downward lands in the expected position.

- [ ] **Step 1: Write failing tests for before/after insertion positions, no-op self drops, absence of opacity class, and a visible insertion-line marker.
- [ ] **Step 2: Run the focused tests and verify the new assertions fail for the current row-index drop behavior.
- [ ] **Step 3: Implement midpoint-based `dragOver` state, line rendering with absolute positioning/overlay classes, and final-index calculation; clear state on drop/drag-end/leave.
- [ ] **Step 4: Update the layout helper with a focused final-index reorder test and implement the minimal reorder correction.
- [ ] **Step 5: Run the focused layout and component tests and verify all pass.
- [ ] **Step 6: Commit the insertion-line behavior.

### Task 3: Keep overflow drag aligned with the insertion line

**Files:**
- Modify: `src/admin/components/AdminSidebarNav.tsx`
- Modify: `src/admin/components/AdminChrome.tsx`
- Modify: `src/admin/components/AdminSidebarOverflowDialog.tsx`
- Test: `src/admin/components/AdminSidebarNav.test.tsx`
- Test: `src/admin/components/AdminSidebarOverflowDialog.test.tsx`
- Test: `src/admin/components/AdminChrome.test.tsx`

**Interfaces:**
- Overflow drag payload remains `application/x-admin-sidebar-overflow`.
- Visible row drop continues to call `onDropOverflow(overflowId, visibleIndex)` because exchange is row-based, while the row’s insertion line is only feedback for the target.
- Dialog overlay pointer passthrough and focus restoration remain unchanged.

- [ ] **Step 1: Add failing tests for the overflow payload over a visible row, insertion-line feedback during the drag, and no keyboard exchange controls.
- [ ] **Step 2: Run focused overflow/chrome tests and verify the new assertions fail.
- [ ] **Step 3: Wire the shared drag-target styling/state so overflow drags show the line without dimming the source or blocking the sidebar.
- [ ] **Step 4: Run focused overflow/chrome tests and verify they pass.
- [ ] **Step 5: Commit the overflow interaction update.

### Task 4: Full scoped verification

**Files:**
- No new production files.

- [ ] **Step 1: Run the five-file sidebar test suite.
- [ ] **Step 2: Run `npm run typecheck`.
- [ ] **Step 3: Run ESLint on all changed feature files.
- [ ] **Step 4: Run `git diff --check` and confirm only scoped files are staged.
- [ ] **Step 5: Record any unrelated pre-existing full-suite failures separately; do not modify unrelated dirty files.
