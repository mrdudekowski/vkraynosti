# Admin Button System and Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify admin publication buttons around the reference “Опубликовать на сайте” design, normalize generic admin actions, and fix confirmed admin/root-style accessibility and duplication problems.

**Architecture:** Extend the existing `AdminButton` primitive with a semantic `publish` variant and shared style tokens in `src/index.css`. Migrate only generic action controls to the primitive, preserve specialized controls such as tabs/calendars/menus, and audit `src/admin` plus `src/admin/site-page.css` for confirmed violations before making narrowly scoped fixes.

**Tech Stack:** React, TypeScript, Tailwind/PostCSS, Vitest, Testing Library, Vite.

## Global Constraints

- Work only in `E:\Cursor Projects\Vkrainosti-cms-crm-phase1-admin-app` on `codex/admin-app`; do not modify `E:\Cursor Projects\Vkrainosti-cms-crm-phase1`.
- Preserve the existing dirty files `src/admin/components/AdminProfileMenu.tsx`, `src/admin/components/InboxQueueTable.tsx`, and `src/index.css`; inspect `index.css` but stage only feature hunks and never overwrite their unrelated edits.
- Add `publish` to the existing `AdminButton` variant system; do not create a second button primitive or redesign specialized controls as large buttons.
- Apply `publish` only to actions that change public publication state: Site, tour publish queue, schedule publish, and equivalent publish actions.
- Preserve all existing permission, busy, disabled, confirmation, and navigation behavior.
- Do not change backend/API/public-site business logic.
- Keep justified dynamic inline styles for percentages, focal points, object position, and container configuration; remove only confirmed hardcoded presentation duplication.

---

### Task 1: Add and test the semantic publish button variant

**Files:**
- Modify: `src/admin/components/AdminButton.tsx`
- Modify: `src/index.css:591-613`
- Test: `src/admin/components/AdminButton.test.tsx`

**Interfaces:**
- `AdminButtonVariant` becomes `'primary' | 'secondary' | 'ghost' | 'destructive' | 'publish'`.
- `variant="publish"` maps to `admin-btn-publish`.

- [ ] **Step 1: Write the failing variant test**

Extend the existing render test with `<AdminButton variant="publish">Опубликовать на сайте</AdminButton>` and assert it has `admin-btn-publish`, while the existing four variants keep their current classes.

- [ ] **Step 2: Run the test and verify the expected failure**

```powershell
npx vitest run src/admin/components/AdminButton.test.tsx
```

Expected: FAIL because `publish` is not accepted/mapped.

- [ ] **Step 3: Implement the minimal variant**

Add the `publish` union member and mapping in `AdminButton.tsx`. Add `.admin-btn-publish` next to the existing admin variants in `src/index.css`, using the reference direction with explicit tokenized states:

```css
.admin-btn-publish {
  @apply admin-btn bg-brand-primary text-text-inverse hover:bg-brand-primary/90 active:bg-brand-primary/80;
}
```

Keep the shared `admin-btn` focus ring, min-height, disabled state, and reduced-motion behavior. Do not use `transition-all`.

- [ ] **Step 4: Run the test and inspect the class contract**

```powershell
npx vitest run src/admin/components/AdminButton.test.tsx
npm run typecheck
```

Expected: PASS with no TypeScript errors.

- [ ] **Step 5: Commit**

```powershell
git add src/admin/components/AdminButton.tsx src/admin/components/AdminButton.test.tsx
git add -p src/index.css
git commit -m "feat: add shared admin publish button variant"
```

When staging `src/index.css`, include only the new publish variant hunk and leave the pre-existing user changes untouched.

### Task 2: Apply the publish variant to all publication workflows

**Files:**
- Modify: `src/admin/SitePage.tsx`
- Modify: `src/admin/SchedulePage.tsx`
- Modify: `src/admin/InboxPage.tsx`
- Modify: `src/admin/TourEditorPage.tsx`
- Modify: `src/admin/components/AdminStickyContextBar.tsx`
- Modify: `src/admin/components/TourPublishReviewDialog.tsx`
- Test: `src/admin/SitePage.test.tsx`
- Test: `src/admin/SchedulePage.test.tsx`
- Test: `src/admin/InboxPage.test.tsx`
- Test: `src/admin/TourEditorPage.test.tsx`

**Interfaces:**
- All publish action controls use either `<AdminButton variant="publish">` or a navigation link with the shared `admin-btn-publish` class when the control is a `<Link>`.
- Existing labels, icons, permissions, disabled conditions, `aria-busy`, and publish API calls remain unchanged.

- [ ] **Step 1: Add failing class assertions for every workflow**

Update the relevant existing tests to assert `admin-btn-publish` for the Site publish action, schedule publish action, inbox publish actions, and tour editor publish action. Keep existing assertions for disabled/hidden permissions.

- [ ] **Step 2: Run the workflow tests and verify failures**

```powershell
npx vitest run src/admin/SitePage.test.tsx src/admin/SchedulePage.test.tsx src/admin/InboxPage.test.tsx src/admin/TourEditorPage.test.tsx
```

Expected: FAIL only on the new publish-class assertions.

- [ ] **Step 3: Migrate publish controls**

Use `variant="publish"` for button actions. For publish links, keep `<Link>` and apply `admin-btn-publish no-underline`; do not turn navigation into a `<button>`. In `SitePage`, replace hardcoded publish copy with the existing `ADMIN_UI` key if one exists; otherwise add one in `src/admin/constants/ui.ts`.

- [ ] **Step 4: Run workflow tests**

```powershell
npx vitest run src/admin/SitePage.test.tsx src/admin/SchedulePage.test.tsx src/admin/InboxPage.test.tsx src/admin/TourEditorPage.test.tsx
```

Expected: PASS, including existing permission and busy-state tests.

- [ ] **Step 5: Commit**

```powershell
git add src/admin/SitePage.tsx src/admin/SchedulePage.tsx src/admin/InboxPage.tsx src/admin/TourEditorPage.tsx src/admin/components/AdminStickyContextBar.tsx src/admin/components/TourPublishReviewDialog.tsx src/admin/constants/ui.ts src/admin/SitePage.test.tsx src/admin/SchedulePage.test.tsx src/admin/InboxPage.test.tsx src/admin/TourEditorPage.test.tsx
git commit -m "feat: unify admin publication actions"
```

### Task 3: Normalize generic admin actions without changing specialized controls

**Files:**
- Modify: `src/admin/DashboardPage.tsx`
- Modify: `src/admin/SeasonToursPage.tsx`
- Modify: `src/admin/components/AdminUnusedMediaPicker.tsx`
- Modify: `src/admin/components/InboxSummaryCards.tsx`
- Modify: `src/admin/components/InboxQueueTable.tsx`
- Modify: `src/admin/components/AdminProfileMenu.tsx`
- Modify: `src/admin/site-page.css`
- Modify: `src/index.css` only for shared admin utility rules
- Test: the existing tests for each modified component/page

**Interfaces:**
- Generic actions use `AdminButton`, `AdminIconButton`, or shared link classes according to semantics.
- Specialized calendar cells, tabs, menus, dropdown options, selection cards, and modal mode radios retain their specialized markup/classes.

- [ ] **Step 1: Write regression tests for confirmed generic-control issues**

Add focused assertions for the controls selected during audit: every converted generic action remains keyboard-accessible, has its original accessible name, and retains navigation or callback behavior. For `InboxQueueTable` row actions, assert the existing callback still fires and the control has a visible focus class.

- [ ] **Step 2: Run the selected tests before edits**

```powershell
npx vitest run src/admin/DashboardPage.test.tsx src/admin/SeasonToursPage.test.tsx src/admin/components/InboxQueueTable.test.tsx src/admin/components/AdminProfileMenu.test.tsx src/admin/SitePage.test.tsx
```

Expected: baseline tests pass or report only known unrelated failures; new regression assertions fail where the shared class is absent.

- [ ] **Step 3: Apply minimal conversions**

Replace only generic action buttons/links with existing primitives. Add shared focus styling to raw row actions if needed. Convert the file-picker label in `AdminUnusedMediaPicker` only if its semantics are currently misleading; preserve the underlying input activation. Keep dynamic inline style exceptions listed in the spec.

- [ ] **Step 4: Consolidate confirmed CSS duplication**

Compare `src/index.css` admin classes with `src/admin/site-page.css`. Keep `site-page.css` only for the Site modal mode-specific pattern; move or delete duplicate generic button/focus rules only when no consumer depends on the class. Replace any admin `transition-all` with explicit properties and ensure each `outline-none` has a `focus-visible` replacement.

- [ ] **Step 5: Run focused tests, typecheck, and lint**

```powershell
npx vitest run src/admin/DashboardPage.test.tsx src/admin/SeasonToursPage.test.tsx src/admin/components/InboxQueueTable.test.tsx src/admin/components/AdminProfileMenu.test.tsx src/admin/SitePage.test.tsx
npm run typecheck
npm run lint
```

Expected: PASS with no new accessibility or lint errors.

- [ ] **Step 6: Commit**

```powershell
git add src/admin/DashboardPage.tsx src/admin/SeasonToursPage.tsx src/admin/components/AdminUnusedMediaPicker.tsx src/admin/components/InboxSummaryCards.tsx src/admin/components/InboxQueueTable.tsx src/admin/components/AdminProfileMenu.tsx src/admin/site-page.css
git add -p src/index.css
git commit -m "refactor: normalize admin action controls"
```

### Task 4: Complete admin/root audit and verify the release candidate

**Files:**
- Create: `docs/superpowers/audits/2026-09-11-admin-ui-audit.md`
- Modify only if Task 4 finds a confirmed critical issue not covered by Tasks 1–3; add its focused test in the same change.

- [ ] **Step 1: Run static inventory checks**

```powershell
rg -n "<button|style=|transition-all|outline-none|admin-btn-(primary|secondary|ghost|destructive)|admin-modal-mode-option" src/admin src/index.css --glob '*.tsx' --glob '*.ts' --glob '*.css'
rg -n "className=\"[^\"]*(bg-|text-|rounded-|min-h-|px-|py-|transition-)" src/admin --glob '*.tsx'
```

Classify each result as shared primitive, specialized control, justified dynamic style, or actionable duplication/accessibility issue.

- [ ] **Step 2: Run complete admin tests**

```powershell
npx vitest run src/admin
```

Expected: all new/affected tests pass; document any pre-existing failures separately and do not attribute them to this change.

- [ ] **Step 3: Build and verify the admin artifact**

```powershell
npm run build:admin
node scripts/verify-admin-build.mjs
```

Expected: both commands pass and the generated admin artifact contains the publish variant styles.

- [ ] **Step 4: Write the audit report**

Record actionable findings grouped by severity and file/line, fixed items, intentionally retained specialized controls, justified inline styles, and remaining non-critical issues. Use the Web Interface Guidelines terse format for accessibility findings.

- [ ] **Step 5: Final repository checks**

```powershell
git diff --check
git status --short --branch
git diff --name-only origin/codex/admin-app...HEAD
```

Expected: feature files are the only committed changes relative to the pushed branch, and the three pre-existing dirty files remain uncommitted and unstaged.

- [ ] **Step 6: Commit the audit report**

```powershell
git add -f docs/superpowers/audits/2026-09-11-admin-ui-audit.md
git commit -m "docs: record admin ui audit findings"
```
