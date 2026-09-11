# Tour Price “From” Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a persisted `priceFrom` option to the tour editor, normalize numeric prices with a trailing `₽`, and render `от 5000 ₽` consistently across public price consumers.

**Architecture:** Keep the existing string `price` field for compatibility and add optional `priceFrom?: boolean` to the CMS document and text patch. Centralize parsing/normalization/display in a small price helper, use it from the editor and `useTourDisplayPrice`, and pass the new field through document-to-site and document-to-patch mappings.

**Tech Stack:** React, TypeScript, Zod, Vitest, Testing Library, Vite.

## Global Constraints

- Preserve existing unrelated working-tree changes in `src/admin/components/AdminProfileMenu.tsx`, `src/admin/components/InboxQueueTable.tsx`, and `src/index.css`.
- Keep the string `price` model; do not migrate to a numeric price object.
- `priceFrom` applies only to numeric prices and is false for `по запросу` or empty values.
- Numeric prices end in exactly one `₽`; normalization is idempotent.
- Public cards, tour detail, and Telegram must use the same formatted display price.
- Do not change `pricePrevious`, schedule prices, CRM behavior, or deployment configuration.

---

### Task 1: Add the price helper and public display contract

**Files:**
- Create: `src/cms/tourPrice.ts`
- Create: `src/cms/tourPrice.test.ts`
- Modify: `src/hooks/useTourDisplayPrice.ts`
- Modify: `src/components/tours/TourDetailPriceHighlight.tsx`
- Test: `src/components/tours/TourDetailPriceHighlight.test.tsx`

**Interfaces:**
- Produces `normalizeTourPrice(value: string): { price: string; priceFrom: boolean }` and `formatTourDisplayPrice(value: string, priceFrom?: boolean): string`.
- `useTourDisplayPrice` accepts `priceFrom?: boolean` and returns the normalized/formatted `displayPrice` while preserving `displayPricePrevious`.

- [ ] **Step 1: Write failing helper tests**

Add tests for these exact cases:

```ts
expect(normalizeTourPrice('5000')).toEqual({ price: '5000 ₽', priceFrom: false });
expect(normalizeTourPrice('  от 5 000 ₽ ')).toEqual({ price: '5 000 ₽', priceFrom: true });
expect(normalizeTourPrice('5 000 ₽')).toEqual({ price: '5 000 ₽', priceFrom: false });
expect(normalizeTourPrice('по запросу')).toEqual({ price: 'по запросу', priceFrom: false });
expect(formatTourDisplayPrice('5000', true)).toBe('от 5000 ₽');
expect(formatTourDisplayPrice('по запросу', true)).toBe('по запросу');
```

- [ ] **Step 2: Run the helper tests and verify the expected failure**

Run:

```powershell
npx vitest run src/cms/tourPrice.test.ts
```

Expected: FAIL because `src/cms/tourPrice.ts` does not yet exist.

- [ ] **Step 3: Implement the minimal helper**

Implement parsing in `src/cms/tourPrice.ts` by trimming whitespace, recognizing the optional leading `от`, recognizing `по запросу`, and treating only digits plus whitespace with an optional trailing `₽` as numeric. Return numeric values with one ` ₽`; return nonnumeric text unchanged apart from trimming. `formatTourDisplayPrice` must normalize first and prepend `от ` only when the normalized result is numeric and `priceFrom` is true.

- [ ] **Step 4: Wire the helper into `useTourDisplayPrice` and detail display**

Extend `TourDisplayPriceSource` with `priceFrom?: boolean`, call `formatTourDisplayPrice(tour.price, tour.priceFrom)`, and add `priceFrom` to `TourDetailPriceHighlightProps['tour']`.

- [ ] **Step 5: Add the public regression assertion and run tests**

Update `TourDetailPriceHighlight.test.tsx` with a tour whose `price` is `5000` and `priceFrom` is `true`; assert visible text `от 5000 ₽` and an accessible section label containing the same string.

Run:

```powershell
npx vitest run src/cms/tourPrice.test.ts src/hooks/useTourDisplayPrice.test.ts src/components/tours/TourDetailPriceHighlight.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit the self-contained display change**

```powershell
git add src/cms/tourPrice.ts src/cms/tourPrice.test.ts src/hooks/useTourDisplayPrice.ts src/components/tours/TourDetailPriceHighlight.tsx src/components/tours/TourDetailPriceHighlight.test.tsx
git commit -m "feat: format tour prices with from label"
```

### Task 2: Thread `priceFrom` through the CMS document and patch

**Files:**
- Modify: `src/cms/cmsTourDocument.ts`
- Modify: `src/cms/applyTourTextPatch.ts`
- Modify: `src/admin/patchFromDocument.ts`
- Modify: `src/cms/cmsDocumentToSiteTour.ts`
- Test: `src/cms/applyTourTextPatch.test.ts`
- Test: `src/cms/cmsDocumentToSiteTour.test.ts`

**Interfaces:**
- `CmsTourDocument` and `CmsTourTextPatch` expose `priceFrom?: boolean`.
- `patchFromDocument` and `storedTextPatchFromDocument` return the persisted `priceFrom` value.
- `applyTourTextPatch` preserves `priceFrom`, defaulting absent values to `false` when price is numeric and always forcing it false for nonnumeric price.

- [ ] **Step 1: Write failing persistence tests**

Add assertions that applying `{ price: '5000', priceFrom: true }` returns `{ price: '5000 ₽', priceFrom: true }`, applying `{ price: 'по запросу', priceFrom: true }` returns `priceFrom: false`, and `cmsDocumentToSiteTour` copies `priceFrom` to the public tour.

- [ ] **Step 2: Run the focused tests and verify failure**

```powershell
npx vitest run src/cms/applyTourTextPatch.test.ts src/cms/cmsDocumentToSiteTour.test.ts
```

Expected: FAIL because the schema, patch type, and mappings do not include `priceFrom`.

- [ ] **Step 3: Add the schema/type and mappings**

Add `priceFrom: z.boolean().optional()` beside `price` in `cmsTourDocumentSchema`; add `priceFrom?: boolean` to `CmsTourTextPatch`; include it in `textPatchFromDocument`, `applyTourTextPatch`, and `cmsDocumentToSiteTour`. Use `normalizeTourPrice` in `applyTourTextPatch` so storage is canonical and nonnumeric prices clear the flag.

- [ ] **Step 4: Run persistence tests**

```powershell
npx vitest run src/cms/applyTourTextPatch.test.ts src/cms/cmsDocumentToSiteTour.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit the CMS contract change**

```powershell
git add src/cms/cmsTourDocument.ts src/cms/applyTourTextPatch.ts src/admin/patchFromDocument.ts src/cms/cmsDocumentToSiteTour.ts src/cms/applyTourTextPatch.test.ts src/cms/cmsDocumentToSiteTour.test.ts
git commit -m "feat: persist tour price from option"
```

### Task 3: Add the editor checkbox and input normalization

**Files:**
- Modify: `src/admin/components/TourCatalogFields.tsx`
- Modify: `src/admin/TourEditorPage.tsx`
- Modify: `src/admin/constants/ui.ts`
- Test: `src/admin/components/TourCatalogFields.test.tsx`

**Interfaces:**
- `TourCatalogFieldsProps` consumes `priceFrom: boolean` and emits `{ price, priceFrom }` patches.
- The checkbox label is the existing product-language string `от` and is rendered only for a numeric price.

- [ ] **Step 1: Write failing editor tests**

Extend the component test with a numeric price and `priceFrom={false}`; assert a checkbox labeled `от` exists, toggling it calls `onChange({ priceFrom: true })`, and typing/blur normalizes the price to one trailing `₽`. Add a second render with `price="по запросу"`; assert no checkbox labeled `от` exists.

- [ ] **Step 2: Run the editor test and verify failure**

```powershell
npx vitest run src/admin/components/TourCatalogFields.test.tsx
```

Expected: FAIL because `priceFrom` is not a prop and the checkbox is not rendered.

- [ ] **Step 3: Implement the minimal editor behavior**

Pass `priceFrom={patch.priceFrom ?? document.priceFrom ?? false}` from `TourEditorPage`. In `TourCatalogFields`, derive the normalized numeric state from `normalizeTourPrice(price)`, render the checkbox only when numeric, and emit the normalized price plus `priceFrom: false` when the current value is nonnumeric. Use an accessible native checkbox with `id="admin-price-from"` and `<label htmlFor="admin-price-from">от</label>`; keep the existing price input and icon layout.

- [ ] **Step 4: Run editor tests and typecheck**

```powershell
npx vitest run src/admin/components/TourCatalogFields.test.tsx src/admin/TourEditorPage.test.tsx
npm run typecheck
```

Expected: PASS with no TypeScript errors.

- [ ] **Step 5: Commit the editor change**

```powershell
git add src/admin/components/TourCatalogFields.tsx src/admin/TourEditorPage.tsx src/admin/constants/ui.ts src/admin/components/TourCatalogFields.test.tsx
git commit -m "feat: add from checkbox to tour price editor"
```

### Task 4: Verify all consumers and repository health

**Files:**
- Modify only if a compile/test failure identifies a missed `Tour` consumer: the relevant file and its focused test.

- [ ] **Step 1: Search every price consumer**

Run:

```powershell
rg -n "useTourDisplayPrice|priceFrom|\.price\b" src | Select-Object -First 300
```

Confirm all rendered public prices use the shared formatter or already receive the canonical CMS price.

- [ ] **Step 2: Run the complete focused regression set**

```powershell
npx vitest run src/cms/tourPrice.test.ts src/cms/applyTourTextPatch.test.ts src/cms/cmsDocumentToSiteTour.test.ts src/admin/components/TourCatalogFields.test.tsx src/admin/TourEditorPage.test.tsx src/components/tours/TourDetailPriceHighlight.test.tsx src/components/telegram/TelegramTourCard.test.tsx
```

Expected: PASS. If a listed Telegram test file does not exist, omit only that nonexistent path and run the available focused tests.

- [ ] **Step 3: Run repository verification**

```powershell
npm run typecheck
npm run lint
git diff --check
git status --short --branch
```

Expected: typecheck, lint, and diff check pass; only the three pre-existing user-modified files remain outside the feature commits, plus any explicitly intended feature files if commits are not retained.

- [ ] **Step 4: Review the final diff**

Verify the implementation contains no changes to schedule pricing, CRM fields, `pricePrevious`, or the three pre-existing dirty files. Confirm old values `от 5000 ₽` and `5000` produce one canonical public display, and `по запросу` never displays `от` or `₽`.
