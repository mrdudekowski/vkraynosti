# Admin UI audit — 2026-09-11

## Scope

Reviewed `src/admin/**/*.tsx`, `src/admin/**/*.ts`, the admin block in `src/index.css`, and `src/admin/site-page.css`.

## Changes verified

- Added the semantic `publish` variant to `AdminButton`.
- Applied it to site content, schedule, inbox bulk/selected/row actions, tour editor, and publish confirmation.
- Kept `primary` for generic actions such as adding a departure and kept specialized controls as raw buttons where they provide tabs, menus, calendar cells, list navigation, or compact icon behavior.
- Consolidated the shared primary/publish color treatment in the root admin CSS. The publish variant retains only its semantic emphasis (`px-4`, `font-semibold`).
- Existing dirty worktree changes in `AdminProfileMenu.tsx`, the inbox grid classes in `InboxQueueTable.tsx`, and `src/index.css` were preserved; only the publish action hunk in the queue was staged with the feature.

## Findings

### P2 — `SitePage.tsx` is difficult to maintain

Several tab renderers and the page return tree are compressed into very long JSX lines, and some user-facing strings are inline instead of coming from `ADMIN_UI`. This makes review and future localization harder. It is a safe follow-up refactor, but outside the button-system change because formatting the whole file would create a large unrelated diff.

### P2 — Root CSS contains the admin design system

The root stylesheet is also the source of admin primitives because the current PostCSS setup does not support a separate admin component layer. The arrangement is documented in the file and the admin rules are grouped, but the file remains a broad coupling point. A future extraction should be done only after confirming Tailwind/PostCSS output parity.

### P2 — Specialized controls should not be forced through `AdminButton`

The raw-button inventory includes tabs, menus, calendar cells, selectable rows, overlay dismiss controls, and drag/drop controls. They use distinct interaction semantics and should keep their own classes. The review found no evidence that replacing them wholesale with `AdminButton` would improve consistency without harming layout or behavior.

### No confirmed critical style defects

- No admin `transition-all` usage was found.
- No admin hardcoded hex/rgb colors were found in the reviewed source.
- Dynamic inline styles are limited to runtime values such as focal-point coordinates, media object positioning, progress scale, container queries, and operational rail width.
- Shared admin buttons already provide visible focus rings, minimum touch height, disabled state, and reduced-motion handling.

## Verification

- Targeted publication workflow tests: 4 files, 55 tests passed.
- ESLint: passed.
- Remaining verification commands are recorded in the implementation handoff; the repository's known unrelated baseline suite failures must not be attributed to this change.
