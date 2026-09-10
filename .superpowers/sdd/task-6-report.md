# Task 6 report: sidebar targeted-test regression

Status: FIXED

Root cause:

- `AdminSidebarNav` now validates overflow drag payloads against the current `overflowIds` prop.
- The regression fixture rendered the component without `overflowIds`, so the valid `site` payload was correctly rejected by runtime validation.

Scoped fix:

- Updated only `AdminSidebarNav.test.tsx` so the exchange test passes `overflowIds: ['site']` through `renderNav`.
- Runtime validation and unrelated files were not changed.

Verification evidence:

- Targeted sidebar tests: `npm run test -- src/admin/components/AdminSidebarNav.test.tsx --reporter=dot` — **7 passed**.
- Exact-file ESLint: `npx eslint src/admin/components/AdminSidebarNav.tsx src/admin/components/AdminSidebarNav.test.tsx` — **passed**.
- Typecheck: `npm run typecheck` — **passed**.
- `git diff --check` — **passed**; Git emitted only existing LF/CRLF normalization warnings for dirty files.
