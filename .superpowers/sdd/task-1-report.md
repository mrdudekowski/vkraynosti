# Task 1 implementation report

## Status

DONE

## Scope

Implemented the pure desktop sidebar layout rules requested in `task-1-brief.md`:

- `src/admin/adminSidebarLayout.ts`
- `src/admin/adminSidebarLayout.test.ts`

No unrelated dirty files were modified or staged.

## Implementation

- Added `ADMIN_SIDEBAR_VISIBLE_LIMIT = 8`.
- Added `AdminSidebarLayout` with visible and overflow ID orders.
- Added canonical default layout creation.
- Added saved-layout normalization that:
  - accepts only currently permitted item IDs;
  - removes duplicates while preserving saved order;
  - appends newly permitted IDs in canonical order;
  - enforces the eight-item visible limit;
  - falls back to canonical defaults for malformed saved values.
- Added visible-item reordering with immutable results and invalid-index no-ops.
- Added visible/overflow exchange with immutable results, preserved overflow order, and invalid-input no-ops.

## TDD evidence

1. Wrote the focused test first.
2. Ran `npm run test -- src/admin/adminSidebarLayout.test.ts` and observed the expected missing-module failure.
3. Implemented the helpers.
4. Corrected one test expectation after the first green attempt exposed that saved overflow order is intentionally preserved before canonical filling.
5. Reran the focused test successfully.

## Verification

- `npm run test -- src/admin/adminSidebarLayout.test.ts` — passed: 1 test file, 7 tests.
- `npm run typecheck` — passed.
- `npx eslint src/admin/adminSidebarLayout.ts src/admin/adminSidebarLayout.test.ts` — passed.
- `git diff --check` — passed.

## Commit

- `c335d33c911c19a153695f0c5b1b742e2ecf71d0` — `feat(admin): add sidebar layout rules`
- `c28ba32ab17e90932fbd6d97326aa49a7b59f33b` — `docs(admin): record sidebar layout task report`

## Self-review

- Helpers are pure and return new arrays; caller-owned layout data is not mutated.
- Normalization derives permission membership from the supplied `AdminNavItem[]`, so removed permissions and newly permitted items are handled without stale IDs.
- Reorder and exchange guard negative and out-of-range indexes.
- Exchange removes the selected overflow item and appends the displaced visible item, preserving the remaining overflow order.
- Existing `AdminNavId` and `AdminNavItem` types are used in the production API.

## Concerns

- The current repository `AdminNavId` union contains 7 production IDs, while the brief requires a ten-item fixture. The test uses three local synthetic runtime IDs via a fixture-only cast; production types remain unchanged.
- This task intentionally does not wire the helpers into `AdminChrome`, localStorage persistence, dialogs, or drag-and-drop. Those belong to later tasks in the implementation plan.
- Git emitted normal LF-to-CRLF working-copy warnings for the new files; no content or test issue resulted.
