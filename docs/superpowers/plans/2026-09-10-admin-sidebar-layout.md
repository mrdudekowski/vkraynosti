# Customizable Admin Sidebar Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a desktop-only, persistent eight-slot admin sidebar layout with drag-and-drop reordering, overflow exchange, keyboard alternatives, and safe recovery from invalid local state.

**Architecture:** Keep `AdminChrome` as the shell owner, but move layout rules into pure helpers and a dedicated hook. The hook stores only ordered `AdminNavId` lists in versioned `localStorage`; the sidebar and overflow dialog render the normalized result. Mobile and tablet navigation continue using their current independent arrangements.

**Tech Stack:** React, TypeScript, React Router, `lucide-react`, existing Tailwind/admin CSS classes, native drag events, Vitest, Testing Library.

## Global Constraints

- Show at most eight permitted navigation items in the desktop sidebar.
- Overflow items exchange with a visible slot; no navigation item is lost.
- Store the layout only as a per-browser preference under `admin.sidebar.layout.v1`.
- Reuse `AdminDialog`, existing focus-trap behavior, admin tokens, and glassmorphism classes.
- Do not change CMS/API/schema/permission rules or mobile/tablet navigation.
- Preserve unrelated dirty worktree changes in `src/admin/InboxPage.test.tsx`, `src/admin/components/AdminProfileMenu.tsx`, `src/admin/components/InboxQueueTable.tsx`, and `src/index.css`.
- Save after completed layout actions, never on pointer-move events.

## File Map

- Create `src/admin/adminSidebarLayout.ts`: pure layout type, defaulting, normalization, reorder, exchange, and reset helpers.
- Create `src/admin/adminSidebarLayout.test.ts`: exhaustive pure-state tests.
- Create `src/admin/hooks/useAdminSidebarLayout.ts`: safe localStorage initialization, normalization against session-visible items, persistence, and actions.
- Create `src/admin/hooks/useAdminSidebarLayout.test.ts`: storage and hook behavior tests.
- Create `src/admin/components/AdminSidebarNav.tsx`: desktop visible navigation rows, drag source/target states, and keyboard move controls.
- Create `src/admin/components/AdminSidebarOverflowDialog.tsx`: reusable `AdminDialog`-based overflow catalog and exchange drag source.
- Modify `src/admin/components/AdminChrome.tsx`: use the layout hook for desktop only, render the overflow trigger/dialog, and pass layout actions to the desktop sidebar.
- Modify `src/admin/components/AdminChrome.test.tsx`: integration coverage for visibility, exchange, persistence, and responsive boundaries.
- Modify `src/admin/constants/ui.ts`: add the required labels and accessible copy, following existing localization constants.

### Task 1: Add pure sidebar layout rules

**Files:**
- Create: `src/admin/adminSidebarLayout.ts`
- Test: `src/admin/adminSidebarLayout.test.ts`

**Interfaces:**
- `export const ADMIN_SIDEBAR_VISIBLE_LIMIT = 8`
- `export type AdminSidebarLayout = { visibleOrder: AdminNavId[]; overflowOrder: AdminNavId[] }`
- `export function createDefaultAdminSidebarLayout(items: readonly AdminNavItem[]): AdminSidebarLayout`
- `export function normalizeAdminSidebarLayout(saved: unknown, items: readonly AdminNavItem[]): AdminSidebarLayout`
- `export function reorderVisibleAdminSidebarItem(layout: AdminSidebarLayout, fromIndex: number, toIndex: number): AdminSidebarLayout`
- `export function exchangeAdminSidebarItem(layout: AdminSidebarLayout, overflowId: AdminNavId, visibleIndex: number): AdminSidebarLayout`

- [ ] **Step 1: Write failing tests for defaults and invariants.**

  Use a local test fixture of ten `AdminNavItem` records so the tests do not depend on the current seven-item production catalog. Assert that the first eight IDs are visible and the remainder are overflow.

  ```ts
  it('places at most eight canonical items in visible order', () => {
    const result = createDefaultAdminSidebarLayout(items(10));
    expect(result.visibleOrder).toEqual(ids.slice(0, 8));
    expect(result.overflowOrder).toEqual(ids.slice(8));
  });
  ```

- [ ] **Step 2: Run the focused test and verify it fails because the helpers do not exist.**

  Run: `npm run test -- src/admin/adminSidebarLayout.test.ts`

  Expected: FAIL with missing module/exports.

- [ ] **Step 3: Implement the pure helpers.**

  Normalize by accepting only IDs from the currently permitted `items`, removing duplicates while preserving saved order, filling missing IDs in canonical order, and enforcing the eight-item visible limit. Treat malformed saved values as empty. Exchange must replace the target visible ID and append the displaced ID to overflow while preserving the remaining overflow order.

- [ ] **Step 4: Add tests for all transitions.**

  Cover unknown IDs, duplicates, permission removal, newly permitted items, visible reorder, invalid indexes, overflow exchange, and reset/default behavior. Assert that the union of both lists contains every permitted ID exactly once.

- [ ] **Step 5: Run the focused test and verify it passes.**

  Run: `npm run test -- src/admin/adminSidebarLayout.test.ts`

  Expected: PASS.

- [ ] **Step 6: Commit the pure model.**

  ```powershell
  git add src/admin/adminSidebarLayout.ts src/admin/adminSidebarLayout.test.ts
  git commit -m "feat(admin): add sidebar layout rules"
  ```

### Task 2: Add persistent layout hook

**Files:**
- Create: `src/admin/hooks/useAdminSidebarLayout.ts`
- Test: `src/admin/hooks/useAdminSidebarLayout.test.ts`

**Interfaces:**
- `export const ADMIN_SIDEBAR_LAYOUT_STORAGE_KEY = 'admin.sidebar.layout.v1'`
- `export function useAdminSidebarLayout(items: readonly AdminNavItem[], enabled: boolean): { layout: AdminSidebarLayout; overflowItems: AdminNavItem[]; setVisibleOrder: (fromIndex: number, toIndex: number) => void; exchangeOverflowItem: (overflowId: AdminNavId, visibleIndex: number) => void; reset: () => void }`

- [ ] **Step 1: Write failing storage tests.**

  Mock `localStorage` and verify the hook reads a valid JSON layout, ignores malformed JSON, removes IDs no longer permitted, appends newly permitted IDs, and writes only after an action.

- [ ] **Step 2: Run the focused hook test and verify failure.**

  Run: `npm run test -- src/admin/hooks/useAdminSidebarLayout.test.ts`

  Expected: FAIL because the hook is not defined.

- [ ] **Step 3: Implement safe initialization and persistence.**

  Use lazy `useState` initialization. Guard both reads and writes with `try/catch`, normalize against `items`, and keep the existing `useAdminStoredState`/collapsed preference independent. Serialize only the two ordered lists; do not persist route objects, labels, icons, or permission data.

- [ ] **Step 4: Handle catalog changes without destructive state changes.**

  When the permitted `items` set changes, derive a normalized layout and update in memory only if the normalized lists differ. Persist the normalized result after a user action or a meaningful catalog normalization, never from drag movement.

- [ ] **Step 5: Run focused hook tests.**

  Run: `npm run test -- src/admin/hooks/useAdminSidebarLayout.test.ts`

  Expected: PASS.

- [ ] **Step 6: Commit the hook.**

  ```powershell
  git add src/admin/hooks/useAdminSidebarLayout.ts src/admin/hooks/useAdminSidebarLayout.test.ts
  git commit -m "feat(admin): persist sidebar layout"
  ```

### Task 3: Add desktop visible navigation component

**Files:**
- Create: `src/admin/components/AdminSidebarNav.tsx`
- Create: `src/admin/components/AdminSidebarNav.test.tsx`

**Interfaces:**
- Props include `items`, `compact`, `pathname`, `onNavigate`, `onReorder`, and `onDropOverflow`.
- The component must preserve the existing `NavLink` behavior and active-route calculation.

- [ ] **Step 1: Write failing component tests.**

  Assert labels/icons render, active state is retained, compact mode keeps accessible labels, an internal drag/drop calls `onReorder`, an overflow drop target calls `onDropOverflow`, and keyboard move controls call the same reorder callback.

- [ ] **Step 2: Run the focused component test and verify failure.**

  Run: `npm run test -- src/admin/components/AdminSidebarNav.test.tsx`

  Expected: FAIL because the component is not defined.

- [ ] **Step 3: Implement the component by extracting the current row rendering.**

  Preserve `admin-sidebar-nav`, `admin-sidebar-nav-active`, `AdminIcon`, title behavior, `aria-current`, and route click handling. Use native `draggable` and `onDragStart/onDragOver/onDrop/onDragEnd`. Keep the click target usable; drag state must not navigate.

- [ ] **Step 4: Add accessible keyboard alternatives.**

  Expose labeled move-up/move-down actions or an equivalent roving action per item. Disable actions at the relevant list boundaries. Keep focus-visible rings visible against `bg-brand-primary`.

- [ ] **Step 5: Run the focused test and inspect the rendered states.**

  Run: `npm run test -- src/admin/components/AdminSidebarNav.test.tsx`

  Expected: PASS.

- [ ] **Step 6: Commit the visible navigation component.**

  ```powershell
  git add src/admin/components/AdminSidebarNav.tsx src/admin/components/AdminSidebarNav.test.tsx
  git commit -m "feat(admin): add draggable sidebar navigation"
  ```

### Task 4: Add overflow dialog and trigger

**Files:**
- Create: `src/admin/components/AdminSidebarOverflowDialog.tsx`
- Create: `src/admin/components/AdminSidebarOverflowDialog.test.tsx`
- Modify: `src/admin/constants/ui.ts`

**Interfaces:**
- Props include `items`, `onClose`, `onNavigate`, `onDropOnVisible`, `onReset`, and `visibleItemCount`.

- [ ] **Step 1: Add copy constants and failing dialog tests.**

  Add labels for overflow, close, reset, drag instruction, and moved feedback to `ADMIN_UI`. Test that the dialog uses the existing `AdminDialog`, lists items, closes through Escape/backdrop/close control, and invokes exchange/reset callbacks.

- [ ] **Step 2: Run the focused test and verify failure.**

  Run: `npm run test -- src/admin/components/AdminSidebarOverflowDialog.test.tsx`

  Expected: FAIL because the component/copy is not implemented.

- [ ] **Step 3: Implement the dialog with existing admin primitives.**

  Use `AdminDialog` with `size="lg"`, existing border/background/shadow/backdrop classes, and a compact list/grid. Each item remains clickable for normal navigation and draggable for exchange. Keep focus restoration delegated to the existing dialog/focus-trap pattern.

- [ ] **Step 4: Add reset and empty-state behavior.**

  Render `Сбросить порядок` in the footer. The component must not render when there are no overflow items. Do not create a new modal or glassmorphism token.

- [ ] **Step 5: Run the focused dialog test.**

  Run: `npm run test -- src/admin/components/AdminSidebarOverflowDialog.test.tsx`

  Expected: PASS.

- [ ] **Step 6: Commit the overflow dialog.**

  ```powershell
  git add src/admin/components/AdminSidebarOverflowDialog.tsx src/admin/components/AdminSidebarOverflowDialog.test.tsx src/admin/constants/ui.ts
  git commit -m "feat(admin): add sidebar overflow dialog"
  ```

### Task 5: Integrate desktop layout into AdminChrome

**Files:**
- Modify: `src/admin/components/AdminChrome.tsx`
- Modify: `src/admin/components/AdminChrome.test.tsx`

**Interfaces:**
- `SidebarBody` receives the normalized visible items and layout callbacks.
- `AdminChrome` enables the hook only when `viewport === 'desktop'` and continues passing canonical `bottomItems`/`moreItems` to mobile.

- [ ] **Step 1: Add failing integration tests for seven, eight, and nine items.**

  Keep the current seven-item production behavior unchanged. Use a controlled test catalog/session fixture with nine permitted items to assert that `Ещё` appears, hidden items are listed, and the desktop sidebar remains capped at eight.

- [ ] **Step 2: Add failing tests for exchange and reload persistence.**

  Drag an overflow item onto a visible item, assert the visible item is replaced and the displaced item appears in the dialog, then remount with the same mocked storage and assert the layout is restored.

- [ ] **Step 3: Wire the hook into desktop `AdminChrome`.**

  Compute canonical permitted items once, call `useAdminSidebarLayout(items, viewport === 'desktop')`, render `AdminSidebarNav` in `SidebarBody`, and render the `Ещё` trigger/dialog only for desktop overflow. Keep tablet overlay content canonical and keep mobile bottom navigation/`MoreSheet` canonical.

- [ ] **Step 4: Add feedback for completed exchange and reset.**

  Use the existing `useAdminToast` context already mounted by `AdminApp` and push a quiet `Раздел перемещён в сайдбар` message after a successful exchange. Wrap the new `AdminChrome` integration tests with the existing `AdminToastProvider`; do not add another notification provider.

- [ ] **Step 5: Run the focused AdminChrome tests.**

  Run: `npm run test -- src/admin/components/AdminChrome.test.tsx`

  Expected: PASS, with existing tests unchanged except for the new desktop layout assertions.

- [ ] **Step 6: Commit the integration.**

  ```powershell
  git add src/admin/components/AdminChrome.tsx src/admin/components/AdminChrome.test.tsx
  git commit -m "feat(admin): integrate customizable desktop sidebar"
  ```

### Task 6: Verify responsive behavior and full quality gates

**Files:**
- Modify only if test or accessibility findings require it: the files from Tasks 1–5.

- [ ] **Step 1: Run all targeted sidebar tests.**

  Run: `npm run test -- src/admin/adminSidebarLayout.test.ts src/admin/hooks/useAdminSidebarLayout.test.ts src/admin/components/AdminSidebarNav.test.tsx src/admin/components/AdminSidebarOverflowDialog.test.tsx src/admin/components/AdminChrome.test.tsx`

  Expected: PASS.

- [ ] **Step 2: Run typecheck and diff validation.**

  Run: `npm run typecheck` and `git diff --check`.

  Expected: both commands succeed; unrelated existing modifications remain present and unmodified.

- [ ] **Step 3: Run the desktop acceptance scenario.**

  With nine permitted items at desktop width: open `Ещё`, exchange an overflow item into a visible slot, reload, verify persistence, reorder visible items, reset order, and verify the active route remains correct. Test both expanded and collapsed sidebar states.

- [ ] **Step 4: Run the responsive acceptance scenario.**

  At tablet width, verify the overlay sidebar still opens and uses canonical navigation. At mobile width, verify the bottom navigation and `MoreSheet` remain unchanged and the desktop layout preference does not reorder them.

- [ ] **Step 5: Check keyboard and failure paths.**

  Verify focus enters the overflow dialog, Escape/backdrop close restores focus to the trigger, keyboard move controls work without drag, malformed localStorage falls back safely, and disabled/private localStorage does not block navigation.

- [ ] **Step 6: Review the final diff before any publication.**

  Run: `git status --short --branch` and `git diff --stat HEAD~5..HEAD`.

  Confirm only the sidebar feature commits are included in the feature range; do not reset, clean, push, or alter unrelated dirty files without explicit instruction.
