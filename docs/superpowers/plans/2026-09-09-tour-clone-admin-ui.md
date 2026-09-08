# Tour Clone Admin UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a season-selecting clone workflow to the admin tour list that creates a backend draft clone and automatically opens its editor page.

**Architecture:** Keep the API adapter in `src/admin/api.ts`, isolate the form/dialog in `CloneTourModal`, and coordinate the operation from `SeasonToursPage`, which already owns navigation, toast feedback, list refresh, and the analogous `CreateTourModal` workflow. Pass a single `onClone` callback through `TourList`, `AdminTourCard`, and `AdminTourActionsMenu` so cards and list rows share exactly the same entry point. On success invalidate/refresh the tour cache, close the dialog, navigate to the returned tour ID, and push a toast.

**Tech Stack:** React 18, TypeScript, React Router, Vitest, Testing Library, existing admin primitives (`AdminDialog`, `AdminSelect`, `AdminButton`, `AdminAlert`) and existing toast/cache utilities.

## Global Constraints

- Clone only tour content; never create or copy departures, bookings, or CRM data.
- The target season is explicitly selected; do not silently preselect a destination season.
- The backend owns generation of the new ID and unique slug; the UI navigates using `document.id` from the response.
- A successful clone is a draft and must not be presented as published.
- Reuse the existing admin design system and do not modify `ScheduleWeekSplitLayout.tsx`.
- Preserve keyboard focus, visible labels, error association, loading feedback, and touch targets of at least 44px.

---

### Task 1: Add the admin API adapter and UI copy

**Files:**
- Modify: `src/admin/api.ts` near `adminCreateTour`
- Modify: `src/admin/constants/ui.ts` near the existing tour/create-tour labels
- Test: `src/admin/api.test.ts` if an API adapter test file exists; otherwise cover the request through the modal integration test in Task 2

**Interfaces:**
- Consumes: `CmsTourDocument['season']`, `CmsTourDocument`, `CmsTourMeta`
- Produces: `adminCloneTour(id: string, targetSeason: CmsTourDocument['season']): Promise<{ document: CmsTourDocument; meta: CmsTourMeta }>`

- [ ] **Step 1: Add the failing request contract test**

Create or extend the admin API test harness so a mocked `fetch` can assert:

```ts
await adminCloneTour('winter-1', 'summer');
expect(fetchMock).toHaveBeenCalledWith('/api/cms/tours/winter-1/clone', {
  method: 'POST',
  credentials: 'include',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ targetSeason: 'summer' }),
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```powershell
npm exec vitest run src/admin/api.test.ts -t "clone"
```

Expected: failure because `adminCloneTour` does not exist yet. If the repository has no API test file, use the modal test from Task 2 as the first executable contract instead.

- [ ] **Step 3: Implement the adapter and stable UI messages**

Add the adapter following the existing `adminCreateTour` response handling:

```ts
export async function adminCloneTour(
  id: string,
  targetSeason: CmsTourDocument['season'],
): Promise<{ document: CmsTourDocument; meta: CmsTourMeta }> {
  const response = await fetch(`/api/cms/tours/${encodeURIComponent(id)}/clone`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ targetSeason }),
  });
  if (!response.ok) {
    const body = (await response.json()) as { error?: string };
    throw new Error(body.error ?? 'clone_failed');
  }
  return readJson(response);
}
```

Add localized constants for the action, dialog, helper, submit/loading labels, success toast, and the errors `not_found`, `source_media_not_found`, and generic `clone_failed`. Use the existing `seasons` map for option labels.

- [ ] **Step 4: Run the focused test and verify it passes**

Run the command from Step 2. Expected: PASS, with the request body and URL encoded correctly.

- [ ] **Step 5: Commit the isolated API/copy change**

```powershell
git add src/admin/api.ts src/admin/constants/ui.ts src/admin/api.test.ts
git commit -m "feat(admin): add tour clone API adapter"
```

If `src/admin/api.test.ts` is not created, omit it from the command and rely on the modal integration test.

### Task 2: Build the season-selection dialog

**Files:**
- Create: `src/admin/components/CloneTourModal.tsx`
- Create: `src/admin/components/CloneTourModal.test.tsx`

**Interfaces:**
- Consumes: `tour: AdminTourListItem`, `busy: boolean`, `error: string | null`, `onClose: () => void`, `onSubmit: (targetSeason: Season) => void`
- Produces: a controlled accessible dialog; it does not call the API or navigate

- [ ] **Step 1: Write failing component tests**

Cover these observable behaviors:

```tsx
render(<CloneTourModal tour={tour} busy={false} error={null} onClose={close} onSubmit={submit} />);
expect(screen.getByRole('dialog', { name: ADMIN_UI.cloneTourTitle })).toBeInTheDocument();
expect(screen.getByText(tour.title)).toBeInTheDocument();
expect(screen.getByRole('button', { name: ADMIN_UI.cloneTourSubmit })).toBeDisabled();

await user.selectOptions(screen.getByLabelText(ADMIN_UI.cloneTourSeason), 'summer');
expect(screen.getByRole('button', { name: ADMIN_UI.cloneTourSubmit })).toBeEnabled();
await user.click(screen.getByRole('button', { name: ADMIN_UI.cloneTourSubmit }));
expect(submit).toHaveBeenCalledWith('summer');
```

Also assert `busy` disables select/cancel/submit, `error` renders with `role="alert"`, and cancel calls `onClose` without `onSubmit`.

- [ ] **Step 2: Run the focused component test and verify it fails**

```powershell
npm exec vitest run src/admin/components/CloneTourModal.test.tsx
```

Expected: FAIL because the component and UI constants do not exist.

- [ ] **Step 3: Implement the minimal dialog**

Use `AdminDialog` with `size="md"`, `initialFocusId`, and a form. Keep season state local and validate through the existing `SEASON_ORDER` list:

```tsx
const [season, setSeason] = useState<Season | ''>('');

<AdminSelect
  id="admin-clone-tour-season"
  value={season}
  disabled={busy}
  aria-invalid={error != null}
  onChange={(event) => setSeason(isSeason(event.target.value) ? event.target.value : '')}
>
  <option value="">{ADMIN_UI.cloneTourSeasonPlaceholder}</option>
  {SEASON_ORDER.map((item) => <option key={item} value={item}>{ADMIN_UI.seasons[item]}</option>)}
</AdminSelect>
```

Render the explicit content-only helper text and map the supplied error code to `ADMIN_UI` copy. Submit only when `season !== ''`; do not close the dialog from inside the component after submit.

- [ ] **Step 4: Run the component test and verify it passes**

```powershell
npm exec vitest run src/admin/components/CloneTourModal.test.tsx
```

Expected: all dialog tests PASS, including keyboard/focus behavior provided by `AdminDialog`.

- [ ] **Step 5: Commit the isolated dialog change**

```powershell
git add src/admin/components/CloneTourModal.tsx src/admin/components/CloneTourModal.test.tsx src/admin/constants/ui.ts
git commit -m "feat(admin): add tour clone season dialog"
```

### Task 3: Connect the action menu in both tour list views

**Files:**
- Modify: `src/admin/components/AdminTourActionsMenu.tsx`
- Modify: `src/admin/components/AdminTourCard.tsx`
- Modify: `src/admin/components/TourList.tsx`
- Modify: `src/admin/components/TourList.test.tsx`

**Interfaces:**
- Consumes: `onClone: (tourId: string) => void` from `TourList`
- Produces: a single callback from the list; `SeasonToursPage` owns the modal and operation state; cards and list rows expose the same menu item

- [ ] **Step 1: Extend tests for the action-menu callback**

In `TourList.test.tsx`, render with `onChangeGuestVisibility` so the menu is present, click the first `ADMIN_UI.tourMenu`, then click the new menu item and assert the clone workflow opens with the correct tour title. Assert the same behavior after switching to list view.

- [ ] **Step 2: Run the list test to verify the new assertions fail**

```powershell
npm exec vitest run src/admin/components/TourList.test.tsx -t "клонир"
```

Expected: FAIL because the action menu has no clone callback/item.

- [ ] **Step 3: Add the callback without duplicating menu logic**

Extend props with `onClone?: () => void` in `AdminTourActionsMenu`, `AdminTourCard`, and `TourList`. Make the menu render when either a guest-visibility action or `onClone` exists; cloning must remain available even if a tour has no public page and even when the visibility callbacks are absent. Render a menu item using a copy/duplicate icon only when the callback is supplied. In `AdminTourCard`, pass the callback through and include it in the `showMenu` condition. In `TourList`, call `onClone(tour.id)` for both `AdminDataList` and cards; do not add API or dialog state to the list component.

Keep the existing visibility action behavior unchanged and ensure clone does not require a public page or active status; drafts are valid clone sources.

- [ ] **Step 4: Run the list tests and verify they pass**

```powershell
npm exec vitest run src/admin/components/TourList.test.tsx
```

Expected: all existing tests plus the new cards/list clone-entry tests PASS.

- [ ] **Step 5: Commit the action-menu wiring**

```powershell
git add src/admin/components/AdminTourActionsMenu.tsx src/admin/components/AdminTourCard.tsx src/admin/components/TourList.tsx src/admin/components/TourList.test.tsx
git commit -m "feat(admin): expose tour clone action"
```

### Task 4: Orchestrate clone, cache refresh, toast, and navigation

**Files:**
- Modify: `src/admin/SeasonToursPage.tsx`
- Modify: `src/admin/SeasonToursPage.test.tsx`

**Interfaces:**
- Consumes: `onClone(tourId)` from `TourList`, `adminCloneTour`, `invalidateAdminTours`, `refreshAdminTours`, `ADMIN_PATHS.tour`, `useAdminToast`
- Produces: page-owned `CloneTourModal` state and `onSubmit(targetSeason)` that performs the approved workflow and navigates to the API-returned `document.id`

- [ ] **Step 1: Write failing orchestration tests**

Mock `adminCloneTour`, cache refresh, and `useNavigate` in `SeasonToursPage.test.tsx`. Assert the complete success path:

```tsx
await user.click(screen.getByRole('menuitem', { name: ADMIN_UI.cloneTourAction }));
await user.selectOptions(screen.getByLabelText(ADMIN_UI.cloneTourSeason), 'summer');
await user.click(screen.getByRole('button', { name: ADMIN_UI.cloneTourSubmit }));

await waitFor(() => {
  expect(adminCloneTour).toHaveBeenCalledWith('winter-1', 'summer');
  expect(navigate).toHaveBeenCalledWith(ADMIN_PATHS.tour('summer-1'));
  expect(pushToast).toHaveBeenCalledWith({ message: ADMIN_UI.cloneTourSuccess });
});
```

Add tests for loading/repeated-submit protection and for `source_media_not_found` / generic errors keeping the modal open.

- [ ] **Step 2: Run the focused orchestration tests and verify they fail**

```powershell
npm exec vitest run src/admin/components/TourList.test.tsx -t "клон"
```

Expected: FAIL because the API call and navigation orchestration are not wired.

- [ ] **Step 3: Implement parent state and success/error flow**

Add state in `SeasonToursPage` beside `creating`:

```ts
const [cloneTour, setCloneTour] = useState<AdminTourListItem | null>(null);
const [cloneBusy, setCloneBusy] = useState(false);
const [cloneError, setCloneError] = useState<string | null>(null);
```

Use the existing `useNavigate()` and `useAdminToast()` in `SeasonToursPage`. Pass `onClone={(tourId) => { setCloneTour(tours.find((tour) => tour.id === tourId) ?? null); setCloneError(null); }}` to `TourList`. On submit:

```ts
setCloneBusy(true);
setCloneError(null);
try {
  const result = await adminCloneTour(cloneTour.id, targetSeason);
  invalidateAdminTours();
  void refreshAdminTours();
  setCloneTour(null);
  void navigate(ADMIN_PATHS.tour(result.document.id));
  push({ message: ADMIN_UI.cloneTourSuccess });
} catch (caught) {
  setCloneError(caught instanceof Error ? caught.message : 'clone_failed');
} finally {
  setCloneBusy(false);
}
```

Render one `CloneTourModal` next to `CreateTourModal` when `cloneTour != null`. Translate backend error codes in the modal. Keep the modal mounted until success or explicit cancel. The list remains a presentational/action-entry component and does not call the API.

- [ ] **Step 4: Run the full affected admin tests**

```powershell
npm exec vitest run src/admin/components/CloneTourModal.test.tsx src/admin/components/TourList.test.tsx src/admin/SeasonToursPage.test.tsx
```

Expected: PASS, including success navigation, toast, errors, and both list presentations.

- [ ] **Step 5: Commit the orchestration**

```powershell
git add src/admin/components/TourList.tsx src/admin/components/TourList.test.tsx
git commit -m "feat(admin): navigate to cloned tour"
```

### Task 5: Final verification and handoff

**Files:**
- No source changes expected; only verification of the implementation commits

- [ ] **Step 1: Run formatting/diff checks**

```powershell
git diff --check
git status --short --branch
```

Expected: no whitespace errors; the pre-existing `ScheduleWeekSplitLayout.tsx` change remains the only unrelated modified file.

- [ ] **Step 2: Run focused regression tests**

```powershell
npm exec vitest run src/admin/components/CloneTourModal.test.tsx src/admin/components/TourList.test.tsx src/admin/components/AdminButton.test.tsx
```

Expected: all selected tests PASS.

- [ ] **Step 3: Run the admin typecheck/build command**

```powershell
npm run typecheck
npm run build
```

Expected: no new errors attributable to the clone workflow. Existing unrelated errors must be reported separately rather than hidden.

- [ ] **Step 4: Verify the user scenario manually**

1. Open the tour catalog as an editor.
2. Open actions for a draft and an active tour.
3. Choose «Клонировать».
4. Confirm submit is disabled until a target season is selected.
5. Submit once and verify the button locks while the request is pending.
6. Verify navigation to the returned clone ID and that the editor shows a draft.
7. Verify no departures appear for the clone.
8. Force an API error and verify the dialog remains open with a readable error.

- [ ] **Step 5: Record the verification result**

Report the focused test results, any environment blockers, the final branch, and the fact that `ScheduleWeekSplitLayout.tsx` was preserved.
