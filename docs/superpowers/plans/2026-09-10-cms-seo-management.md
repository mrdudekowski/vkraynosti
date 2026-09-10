# CMS SEO Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Добавить простое управление SEO туров и основных страниц сайта в CMS, связать его с существующей публикацией и передать опубликованные значения в публичный frontend.

**Architecture:** SEO тура хранится внутри `CmsTourDocument`; SEO главной и сезонных страниц хранится отдельным CMS-документом `site-seo`. Изменение SEO тура участвует в обычной ревизии тура и публикуется через `canPublishTours`; SEO страниц сайта публикуется через существующее `canEditSiteContent`. Frontend использует только published-данные, а технические robots, canonical, Sitemap, OG Image и Schema.org вычисляет автоматически.

**Tech Stack:** React, TypeScript, Zod, Hono, Vitest, существующие S3/JSON CMS snapshots, Vite public frontend.

## Global Constraints

- Рабочая ветка CMS: `codex/admin-app` в `E:\Cursor Projects\Vkrainosti-cms-crm-phase1-admin-app`.
- Существующие незапрошенные изменения не изменять и не включать в коммиты.
- Право `canPublishSeo` не создавать.
- SEO тура публиковать существующим `canPublishTours`.
- SEO страниц сайта публиковать существующим `canEditSiteContent`.
- OG Image тура всегда брать из обложки тура.
- Редактор не редактирует `robots`, `canonical`, Sitemap, Schema.org и произвольные маршруты.
- Пустые SEO-поля не блокируют сохранение; используются системные fallback-значения.
- `seoDescription` сохранить для обратной совместимости.
- Не добавлять отдельный UI rollback в этот этап.
- До state-changing действий во внешних Google/Yandex панелях получать отдельное подтверждение.

---

### Task 1: Расширить схемы CMS для SEO тура и SEO страниц

**Files:**
- Modify: `src/cms/cmsTourDocument.ts`
- Modify: `src/cms/siteContentDocument.ts`
- Create: `src/cms/siteSeoDocument.ts`
- Test: `src/cms/cmsTourDocument.test.ts`
- Test: `src/cms/siteSeoDocument.test.ts`
- Mirror the same contract in `E:\Cursor Projects\Vkrainosti-cms-crm-phase1\src\cms\cmsTourDocument.ts` and its tests.

**Interfaces:**
- Produce `CmsTourSeo`, `SiteSeoPage`, `SiteSeoDocument`, `parseSiteSeoDocument(input: unknown)`.
- Preserve parsing of legacy `seoDescription`.

- [ ] **Step 1: Write failing schema tests**

Add tests proving that a tour accepts `seo.title`, `seo.description`, `seo.h1`, a legacy tour without `seo` still parses, and a site SEO document accepts exactly `home`, `winter`, `spring`, `summer`, and `fall` page keys with fixed paths.

- [ ] **Step 2: Run the focused tests and confirm failure**

Run:

```powershell
npm test -- --run src/cms/cmsTourDocument.test.ts src/cms/siteSeoDocument.test.ts
```

Expected: the new imports/types or schema assertions fail because the SEO object and document do not yet exist.

- [ ] **Step 3: Implement the minimal Zod schemas**

Add an optional `seo` object to `cmsTourDocumentSchema`, keep `seoDescription`, and create a site SEO document with a fixed page-key/path map. Reject unknown page keys and paths that are not the five supported public routes.

- [ ] **Step 4: Run the focused tests and confirm they pass**

Run the same command. Expected: all existing tour schema tests and new SEO schema tests pass.

- [ ] **Step 5: Commit only this task**

```powershell
git add src/cms/cmsTourDocument.ts src/cms/cmsTourDocument.test.ts src/cms/siteSeoDocument.ts src/cms/siteSeoDocument.test.ts src/cms/siteContentDocument.ts
git commit -m "feat(cms): add SEO document schemas"
```

### Task 2: Add draft/published site SEO storage and API

**Files:**
- Backend repo: `E:\Cursor Projects\Vkrainosti-cms-crm-phase1\src\cms\siteContentPackageKeys.ts`
- Backend repo: `E:\Cursor Projects\Vkrainosti-cms-crm-phase1\scripts\cms\api\siteContentRoutes.ts`
- Backend repo: `E:\Cursor Projects\Vkrainosti-cms-crm-phase1\scripts\cms\api\app.ts`
- Admin client: `src/admin/api.ts`
- Backend test: `E:\Cursor Projects\Vkrainosti-cms-crm-phase1\scripts\cms\api\siteContentRoutes.test.ts`
- Admin test: `src/admin/api.test.ts`

**Interfaces:**
- Add `cmsDraftSiteSeoKey()`, `cmsDraftSiteSeoMetaKey()`, and `cmsPublishedSiteSeoKey()`.
- Add `adminGetSiteSeo()`, `adminSaveSiteSeo(rev, document)`, and `adminPublishSiteSeo(rev)`.
- Add authenticated CMS routes for GET/PUT/POST publish using `canEditSiteContent`.

- [ ] **Step 1: Write failing API tests**

Cover GET of the default site SEO document, PUT with a matching revision, `409` on stale revision, `403` for a user without `canEditSiteContent`, and POST publish writing the published site SEO key.

- [ ] **Step 2: Run focused API tests and confirm failure**

```powershell
npm test -- --run scripts/cms/api/app.test.ts src/admin/api.test.ts
```

Expected: missing key helpers, client functions, or routes cause failures.

- [ ] **Step 3: Implement storage and routes**

Use the existing backend site-content draft/meta/publish flow and revision checks. Seed a valid default document for all five pages. Do not add a separate permission; reuse `canEditSiteContent`.

- [ ] **Step 4: Run focused API tests and confirm pass**

Run the same command and verify the new route cases and existing API tests pass.

- [ ] **Step 5: Commit only this task**

```powershell
Stage backend files in `cms-crm-phase1-staging` and API client files in `admin-app` separately; do not stage unrelated existing changes.
git commit -m "feat(cms): expose site SEO draft and publication API"
```

### Task 3: Make tour queue detect and label SEO changes

**Files:**
- Modify: `src/cms/publishQueue.ts`
- Modify: `src/admin/inboxQueueView.ts`
- Modify: `src/admin/constants/ui.ts`
- Test: `src/cms/publishQueue.test.ts`
- Test: `src/admin/inboxQueueView.test.ts`

**Interfaces:**
- Add pure helper `tourChangedFields(draft, published): { content: string[]; seo: string[] }`.
- Queue items expose `changedFields` and `hasSeoChanges` without changing departure behavior.
- The visible labels remain `Изменение тура` and `Изменение тура и SEO`.

- [ ] **Step 1: Write failing queue tests**

Test only SEO changed, only content changed, both changed, and no changes. Assert that only SEO produces one tour queue item marked with SEO changes and both changes produce one combined queue item.

- [ ] **Step 2: Run the focused tests and confirm failure**

```powershell
npm test -- --run src/cms/publishQueue.test.ts src/admin/inboxQueueView.test.ts
```

Expected: current JSON comparison does not expose changed fields or combined labels.

- [ ] **Step 3: Implement field-aware diffing**

Compare normalized documents while separating `seo`/legacy `seoDescription` from the remaining content. Treat an absent SEO object and an empty SEO object consistently. Keep one queue item per tour.

- [ ] **Step 4: Update visible queue copy**

Show changed SEO fields in the detail area while retaining current readiness rules for normal tour content.

- [ ] **Step 5: Run tests and commit**

```powershell
npm test -- --run src/cms/publishQueue.test.ts src/admin/inboxQueueView.test.ts
git add src/cms/publishQueue.ts src/cms/publishQueue.test.ts src/admin/inboxQueueView.ts src/admin/inboxQueueView.test.ts src/admin/constants/ui.ts
git commit -m "feat(cms): label tour SEO changes in publication queue"
```

### Task 4: Add the SEO tab to the tour editor

**Files:**
- Modify: `src/admin/tourEditorTabs.ts`
- Modify: `src/admin/TourEditorPage.tsx`
- Create: `src/admin/components/TourSeoSection.tsx`
- Test: `src/admin/tourEditorTabs.test.ts`
- Test: `src/admin/components/TourSeoSection.test.tsx`
- Test: `src/admin/TourEditorPage.test.tsx`

**Interfaces:**
- `TourSeoSection` accepts the current `CmsTourDocument`, an `onChange(patch)` callback, and the current published document.
- It renders title, description, H1, fallback warnings, character guidance, OG-cover preview, and a compact snippet preview.

- [ ] **Step 1: Write failing component tests**

Assert that the tab is named `SEO`, renders the three editable fields, uses the tour cover as OG preview, warns on blank values, and emits patches without exposing robots/canonical/Sitemap controls.

- [ ] **Step 2: Run focused component tests and confirm failure**

```powershell
npm test -- --run src/admin/tourEditorTabs.test.ts src/admin/components/TourSeoSection.test.tsx src/admin/TourEditorPage.test.tsx
```

- [ ] **Step 3: Implement the isolated section**

Reuse existing admin field, tab, character-count, and autosave components. Move the existing `seoDescription` input into this section; do not delete its data path. Map edits to `document.seo` while maintaining `seoDescription` compatibility on save.

- [ ] **Step 4: Integrate the tab and preserve publish behavior**

Place SEO after the content sections. Ensure a changed SEO field marks the tour dirty and the existing publish button submits the same tour revision through `canPublishTours`.

- [ ] **Step 5: Run tests and commit**

```powershell
npm test -- --run src/admin/tourEditorTabs.test.ts src/admin/components/TourSeoSection.test.tsx src/admin/TourEditorPage.test.tsx
git add src/admin/tourEditorTabs.ts src/admin/tourEditorTabs.test.ts src/admin/TourEditorPage.tsx src/admin/TourEditorPage.test.tsx src/admin/components/TourSeoSection.tsx src/admin/components/TourSeoSection.test.tsx
git commit -m "feat(admin): add SEO tab to tour editor"
```

### Task 5: Add SEO management to the `САЙТ` page

**Files:**
- Modify: `src/admin/SitePage.tsx`
- Modify: `src/admin/SitePage.test.tsx`
- Modify: `src/admin/api.ts`
- Create: `src/admin/components/SiteSeoSection.tsx`
- Test: `src/admin/components/SiteSeoSection.test.tsx`

**Interfaces:**
- `SiteSeoSection` accepts `SiteSeoDocument`, `onChange`, `canEditSiteContent`, and publication state.
- It renders only the five fixed page cards and title/description/H1 fields.

- [ ] **Step 1: Write failing UI tests**

Test that `САЙТ` displays all five fixed pages, does not render arbitrary route inputs or technical SEO controls, shows fallback warnings, and hides save/publish actions when `canEditSiteContent` is false.

- [ ] **Step 2: Run focused tests and confirm failure**

```powershell
npm test -- --run src/admin/SitePage.test.tsx src/admin/components/SiteSeoSection.test.tsx
```

- [ ] **Step 3: Implement the section and load/save wiring**

Use the existing site-content page loading and autosave patterns. Add a visible publication label `Изменение SEO страницы` when the draft differs from the published document.

- [ ] **Step 4: Implement publish action**

Call `adminPublishSiteSeo(rev)` only from the existing site-content publication flow and preserve revision conflict handling.

- [ ] **Step 5: Run tests and commit**

```powershell
npm test -- --run src/admin/SitePage.test.tsx src/admin/components/SiteSeoSection.test.tsx
git add src/admin/SitePage.tsx src/admin/SitePage.test.tsx src/admin/api.ts src/admin/components/SiteSeoSection.tsx src/admin/components/SiteSeoSection.test.tsx
git commit -m "feat(admin): manage SEO for public site pages"
```

### Task 6: Build public SEO resolution from published CMS data

**Files:**
- Public repo: `E:\Cursor Projects\Vkrainosti-cms-crm-phase1\src\constants\seo.ts`
- Public repo: `E:\Cursor Projects\Vkrainosti-cms-crm-phase1\src\cms\loadSiteContent.ts`
- Public repo: `E:\Cursor Projects\Vkrainosti-cms-crm-phase1\src\cms\loadSiteContent.test.ts`
- Public repo: relevant document-to-site mapping and public bootstrap files found by `rg -n "getTourSeoEntry|SEO_DEFAULTS|loadSiteContent|generateSitemap" src scripts`
- Test: public repo existing SEO and SSG tests

**Interfaces:**
- `loadPublishedSiteSeo()` returns a validated `SiteSeoDocument` or a safe default.
- `getTourSeoEntry()` prefers `tour.seo` values and falls back to existing generated metadata.

- [ ] **Step 1: Write failing public resolver tests**

Assert that published tour SEO overrides generated title/description/H1, empty fields use fallback values, OG Image resolves from the cover, and hidden/in-development robots rules remain automatic.

- [ ] **Step 2: Run focused public tests and confirm failure**

```powershell
npm test -- --run src/cms/loadSiteContent.test.ts src/constants/seoDescriptionLimits.test.ts
```

- [ ] **Step 3: Implement published-data loading and mapping**

Load only `published/site-seo/document.json` and published tour documents. Do not read draft data in the public frontend. Keep old static defaults for snapshots created before the new schema.

- [ ] **Step 4: Verify rendered metadata and Sitemap behavior**

Run the public SEO/SSG verification scripts and assert that active tours appear in Sitemap, hidden tours do not, and all generated metadata is present in prerendered HTML.

- [ ] **Step 5: Commit in the public frontend branch separately**

Use the public frontend worktree and target branch `cms-crm-phase1-staging`; stage only the SEO contract changes and tests.

### Task 7: Add end-to-end publication and permission coverage

**Files:**
- Modify: `scripts/cms/api/app.test.ts`
- Modify: `src/admin/InboxPage.test.tsx`
- Modify: `src/admin/SitePage.test.tsx`
- Modify: `src/admin/TourEditorPage.test.tsx`
- No new browser e2e file in this phase; use the existing API and component integration tests listed below.

- [ ] **Step 1: Write failing integration tests**

Cover editor changes tour SEO, autosave persists it, queue labels it, a `canPublishTours` user publishes it, public data reads it; separately, `canEditSiteContent` publishes home/season SEO and a user without that permission receives `403`.

- [ ] **Step 2: Run integration tests and confirm failure**

```powershell
npm test -- --run scripts/cms/api/app.test.ts src/admin/InboxPage.test.tsx src/admin/SitePage.test.tsx src/admin/TourEditorPage.test.tsx
```

- [ ] **Step 3: Fix only integration gaps revealed by the tests**

Do not weaken existing permissions or bypass revision checks. Keep one consistent published revision for a tour whose content and SEO changed together.

- [ ] **Step 4: Run all relevant tests**

```powershell
npm test
npm run typecheck
npm run lint
npm run build:admin
```

- [ ] **Step 5: Commit the integration coverage**

```powershell
git add scripts/cms/api/app.test.ts src/admin/InboxPage.test.tsx src/admin/SitePage.test.tsx src/admin/TourEditorPage.test.tsx
git commit -m "test(cms): cover SEO publication workflow"
```

### Task 8: Production-like SEO verification and handoff

**Files:**
- Public repo verification scripts: `scripts/check-seo-indexing.mjs`, `scripts/verify-prerender.mjs`, `scripts/verify-og-shells.ts`
- Admin repo affected files from Tasks 1–7 only

- [ ] **Step 1: Run the complete admin verification suite**

```powershell
npm test
npm run typecheck
npm run lint
npm run build:admin
```

- [ ] **Step 2: Run the public frontend build and SEO checks**

```powershell
npm run build:deploy
npm run check:seo -- --base https://vkraynosti.ru
```

Expected: current Sitemap URLs return `200`, active tours are indexable, hidden tours are excluded, canonical/robots metadata is valid, and the boot screen remains invisible to crawlers.

- [ ] **Step 3: Inspect Git diff and worktree safety**

```powershell
git status --short --branch
git diff --check
git diff --stat
```

Confirm that pre-existing unrelated modifications are not staged.

- [ ] **Step 4: Perform read-only Google/Yandex checks**

Verify the published home page, one season page, one active tour, and one hidden/old URL. Do not click `Request indexing`, `Submit`, `Validate fix`, or equivalent without fresh user confirmation.

- [ ] **Step 5: Prepare handoff**

Report exact commits, branches, tests, deployed build identifier, current Sitemap URL count, and any remaining stale search-engine reports separately from current live HTTP results.

## Self-review checklist

- Schema, API, UI, queue, permissions, frontend mapping, Sitemap, and tests each have a task.
- No task deletes legacy `seoDescription`.
- No task gives editors technical robots/canonical controls.
- Combined content+SEO publication remains one tour revision.
- `canPublishSeo` is not introduced.
- Every task has a failing-test step before implementation.
- External search-console actions remain confirmation-gated.
