# Vkrainosti SEO Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every public SEO route publish deterministic initial HTML, metadata, structured data, sitemap membership, and publication-aware indexing directives without changing the visual design.

**Architecture:** Keep the existing React/Vite SPA for interactive UI. Treat `src/constants/seo.ts`, `src/constants/tourSeoRoutes.ts`, and the route-generation helpers as the SEO source of truth; generate data-SSG bodies and OG shells during the deployment build. Add verification gates that inspect the generated files and a local HTTP preview, while leaving Telegram, legal, hidden, and draft policies explicit.

**Tech Stack:** React 19, TypeScript, Vite 7, React Router 7, `react-helmet-async`, Node.js scripts, Vitest, Playwright.

## Global Constraints

- Work only in branch `cms-crm-phase1`; do not push or deploy.
- Preserve all existing unrelated modified and untracked files.
- Do not change the visual design, layout, copy style, or interactive behavior unless required to prevent loading/error text from becoming the only SEO content.
- Use static rendering, prerendering, or hydration; do not add bot-specific cloaking or dynamic rendering.
- `active` tours are `index,follow` and belong in sitemap; `in_development` tours are `noindex,follow` and excluded from sitemap; hidden tours are not public routes.
- `/safety`, `/privacy`, `/telegram`, unknown routes, and 404 content remain non-indexable according to the design specification.
- Do not add CMS SEO override fields in this implementation; keep the metadata generator extensible for future `seoTitle`, `seoDescription`, and `seoImage` values.
- Do not claim Search Console or Yandex Webmaster data without authenticated access.

---

### Task 1: Freeze the SEO route and metadata contract

**Files:**
- Modify: `src/constants/seo.ts`
- Modify: `src/constants/tourSeoRoutes.ts`
- Modify: `scripts/lib/seoRoutes.mjs`
- Test: `src/constants/seo.test.ts`
- Test: `scripts/lib/seoRoutes.test.mjs`

**Interfaces:**
- Consumes: `Tour`, `Season`, `TourPublicationStatus`, `ROUTES`, and `tourSlugs.ts`.
- Produces: stable `SeoEntry`, `getTourSeoEntry`, `getCanonicalUrl`, `getSitemapRoutePaths`, `getRenderableRoutePaths`, and publication-aware route sets used by all generators.

- [ ] **Step 1: Add failing tests for the policy matrix.**

  Add cases that assert:

  ```ts
  expect(getTourSeoEntry(activeTour, { publicationStatus: 'active' }).robots).toBe('index,follow');
  expect(getTourSeoEntry(activeTour, { publicationStatus: 'in_development' }).robots).toBe('noindex,follow');
  expect(getTourSeoEntry(activeTour, { publicationStatus: 'hidden' }).robots).toBe('noindex,nofollow');
  expect(getCanonicalUrl('/tours/summer/example')).toBe(
    'https://vkraynosti.ru/tours/summer/example/',
  );
  ```

  Add route-set assertions that `/safety`, `/privacy`, and `/telegram` never enter the indexable set, while an active tour does and an in-development tour does not enter the sitemap.

- [ ] **Step 2: Run focused tests and verify the baseline result.**

  Run:

  ```text
  npm test -- src/constants/seo.test.ts scripts/lib/seoRoutes.test.mjs
  ```

  Expected: the new policy assertions fail only where the current implementation violates the stated contract.

- [ ] **Step 3: Implement the smallest contract changes.**

  Keep `SEO_DEFAULTS` and the existing helper names. Normalize canonical paths with the existing canonical helper, keep status-to-robots mapping in one place, and make route-set filtering use the same non-SEO route constants used by the generators. Do not duplicate title or description strings in route scripts.

- [ ] **Step 4: Run focused tests again.**

  Run the command from Step 2. Expected: all focused tests pass with zero failures.

- [ ] **Step 5: Commit the isolated contract change.**

  ```text
  git add src/constants/seo.ts src/constants/tourSeoRoutes.ts scripts/lib/seoRoutes.mjs src/constants/seo.test.ts scripts/lib/seoRoutes.test.mjs
  git commit -m "feat(seo): enforce publication-aware route contract"
  ```

### Task 2: Make initial HTML safe and content-bearing

**Files:**
- Modify: `index.html`
- Modify: `src/main.tsx`
- Modify: `scripts/lib/renderDataSsgBody.ts`
- Modify: `scripts/generate-data-ssg.ts`
- Test: `scripts/lib/renderDataSsgBody.test.ts`
- Test: `src/utils/stripBuildTimeSeoHead.test.ts`

**Interfaces:**
- Consumes: Task 1 route and metadata helpers plus the catalog snapshot.
- Produces: generated route HTML with one meaningful H1/body and no duplicate or misleading head metadata.

- [ ] **Step 1: Add failing HTML contract tests.**

  Assert that generated home and tour bodies contain a meaningful H1, description text, internal links, and no `Что-то пошло не так`; assert that generated head metadata does not produce duplicate canonical or description tags after the runtime head cleanup.

- [ ] **Step 2: Run the focused tests.**

  ```text
  npm test -- scripts/lib/renderDataSsgBody.test.ts src/utils/stripBuildTimeSeoHead.test.ts
  ```

  Expected: the new assertions expose any current duplicate or placeholder content.

- [ ] **Step 3: Implement static-body and head ownership rules.**

  Preserve the visible boot splash for users, but ensure the generated semantic `<main>` content is present in the route file and remains the authoritative no-JS content. Keep `PageMeta` as the hydrated head owner and remove only build-time duplicate metadata before React mounts. Do not remove or redesign the splash unless a test proves it is the sole body content.

- [ ] **Step 4: Run focused tests and inspect generated snippets.**

  ```text
  npm test -- scripts/lib/renderDataSsgBody.test.ts src/utils/stripBuildTimeSeoHead.test.ts
  ```

  Expected: all tests pass; generated body fixtures contain the route H1 and useful text.

- [ ] **Step 5: Commit the initial-HTML change.**

  ```text
  git add index.html src/main.tsx scripts/lib/renderDataSsgBody.ts scripts/generate-data-ssg.ts scripts/lib/renderDataSsgBody.test.ts src/utils/stripBuildTimeSeoHead.test.ts
  git commit -m "feat(seo): guarantee content-bearing initial HTML"
  ```

### Task 3: Harden OG shell generation and verification

**Files:**
- Modify: `scripts/lib/renderOgShellHead.ts`
- Modify: `scripts/lib/runGenerateOgShells.ts`
- Modify: `scripts/verify-og-shells.ts`
- Modify: `scripts/lib/ogShellEnv.ts`
- Test: `scripts/lib/renderOgShellHead.test.ts`
- Test: `scripts/lib/resolveOgShellMeta.test.ts`

**Interfaces:**
- Consumes: absolute canonical URLs, metadata entries, local/public OG assets, and route sets from Task 1.
- Produces: OG shells with title, description, canonical, robots, `og:url`, `og:image`, image MIME/dimensions, and deterministic verification errors.

- [ ] **Step 1: Add failing tests for required OG fields and image fallback.**

  Test that `renderOgShellHead` emits `og:image:type`, `og:image:width`, `og:image:height`, and `og:image:secure_url` when dimensions are known. Test that an unavailable tour image resolves to a known JPEG fallback and that verification reports the original asset failure instead of silently accepting a WebP as JPEG.

- [ ] **Step 2: Run focused OG tests.**

  ```text
  npm test -- scripts/lib/renderOgShellHead.test.ts scripts/lib/resolveOgShellMeta.test.ts
  ```

  Expected: new required-field tests fail against the current generator where applicable.

- [ ] **Step 3: Implement deterministic asset metadata.**

  Use an existing local JPEG fallback or add one under `public/` only if the repository already has an approved image source. Derive dimensions from the actual file or the explicit fallback contract. Make `verify-og-shells` fail with the route and asset URL when a required image cannot be validated. Do not make route generation depend on a developer-only Windows binary.

- [ ] **Step 4: Run OG generation and verification.**

  ```text
  npm run og:shells
  npm run verify:og-shells
  ```

  Expected: generation completes for all public routes and verification exits 0; warnings identify no unvalidated required asset.

- [ ] **Step 5: Commit the OG pipeline change.**

  ```text
  git add scripts/lib/renderOgShellHead.ts scripts/lib/runGenerateOgShells.ts scripts/verify-og-shells.ts scripts/lib/ogShellEnv.ts scripts/lib/renderOgShellHead.test.ts scripts/lib/resolveOgShellMeta.test.ts
  git commit -m "fix(seo): make OG shells deterministic and verifiable"
  ```

### Task 4: Add a complete local SEO build gate

**Files:**
- Modify: `package.json`
- Modify: `scripts/seo-baseline-audit.mjs`
- Modify: `scripts/check-seo-indexing.mjs`
- Create: `scripts/verify-seo-dist.mjs`
- Test: `scripts/lib/seoRoutes.test.mjs`

**Interfaces:**
- Consumes: `dist/`, generated route files, `robots.txt`, `sitemap.xml`, and `getSitemapRoutePaths`.
- Produces: one command that fails when a sitemap URL lacks indexable HTML metadata or when a non-indexable route leaks into the sitemap.

- [ ] **Step 1: Write failing verification cases.**

  Add temporary fixture assertions for:

  ```text
  sitemap URLs have a corresponding dist/<route>/index.html
  active route HTML has exactly one canonical and one robots tag
  active route HTML has title, description, H1, og:url, og:image, and JSON-LD where required
  in-development, hidden, legal, Telegram, and 404 routes are not indexable
  ```

- [ ] **Step 2: Run the verifier against the current `dist`.**

  ```text
  node scripts/verify-seo-dist.mjs
  ```

  Expected: it reports the current missing/incomplete artifact conditions with route names, not a generic failure.

- [ ] **Step 3: Implement the verifier and wire the package command.**

  Implement explicit HTML extraction helpers for title, description, robots, canonical, H1, OG, and JSON-LD. Use normalized URL paths and never infer success from `index.html` alone. Add:

  ```json
  "verify:seo-dist": "node scripts/verify-seo-dist.mjs"
  ```

  Keep `check-seo-indexing.mjs` as the post-deploy HTTP checker and make the local verifier independent of network access.

- [ ] **Step 4: Run the full local artifact gate.**

  ```text
  npm run build
  npm run data:ssg
  npm run og:shells
  npm run verify:og-shells
  npm run verify:seo-dist
  ```

  Expected: all commands exit 0 and the verifier reports the exact number of checked routes.

- [ ] **Step 5: Commit the verification gate.**

  ```text
  git add package.json scripts/seo-baseline-audit.mjs scripts/check-seo-indexing.mjs scripts/verify-seo-dist.mjs scripts/lib/seoRoutes.test.mjs
  git commit -m "test(seo): add generated artifact verification gate"
  ```

### Task 5: Validate the runtime route matrix without deployment

**Files:**
- Modify: `scripts/check-seo-indexing.mjs`
- Create: `tests/seo-runtime.spec.ts`
- Modify: `playwright.config.ts` only if an existing local base URL cannot be reused.

**Interfaces:**
- Consumes: local preview server and generated route list.
- Produces: browser/HTTP evidence for homepage, seasons, representative tours, safety, privacy, Telegram, legacy, query, and 404 behavior.

- [ ] **Step 1: Add failing Playwright checks.**

  For each representative route, inspect both `page.content()` and the response status. Assert indexable pages have one canonical, correct title/description/H1, and meaningful body text; assert closed pages have `noindex`; assert no route's main content equals the loading or error fallback.

- [ ] **Step 2: Run the runtime suite against the current preview.**

  ```text
  npm run build
  npm run data:ssg
  npm run og:shells
  npm run preview -- --host 127.0.0.1
  npx playwright test tests/seo-runtime.spec.ts
  ```

  Expected: the suite identifies any route-serving or browser hydration mismatch.

- [ ] **Step 3: Fix only proven route/runtime defects.**

  Correct base-path handling, deep-link file mapping, or fallback classification only where the failing assertion identifies the layer. Keep user-facing layout intact.

- [ ] **Step 4: Re-run the runtime suite.**

  Expected: all selected routes pass with HTTP and rendered-DOM evidence.

- [ ] **Step 5: Commit runtime verification changes.**

  ```text
  git add scripts/check-seo-indexing.mjs tests/seo-runtime.spec.ts playwright.config.ts
  git commit -m "test(seo): cover runtime route indexing matrix"
  ```

### Task 6: Produce the audit playbook and semantic roadmap

**Files:**
- Create: `docs/seo/SEO-AUDIT-AND-PLAYBOOK.md`
- Create: `docs/seo/SEO-SEMANTIC-MAP.md`
- Create: `docs/seo/SEO-BASELINE-BEFORE.md`
- Create: `docs/seo/SEO-BASELINE-AFTER.md`

**Interfaces:**
- Consumes: evidence from Tasks 1–5, current SERP observations, official Google/Yandex guidance, and repository route data.
- Produces: an operator-ready SEO manual, semantic map, before/after evidence, KPI definitions, and 90-day roadmap.

- [ ] **Step 1: Record the BEFORE baseline.**

  Capture route inventory, current production symptom, local artifact state, known branch/deployment path, and unavailable Search Console/Yandex Webmaster evidence. Label every item as confirmed live evidence, code evidence, or unverified assumption.

- [ ] **Step 2: Write the playbook sections.**

  Include executive summary, problem/evidence/severity/root-cause/impact/solution/status table, changed files, SEO architecture, publication matrix, Google runbook, Yandex runbook, publishing checklist, KPI definitions, risks, and reindexing instructions.

- [ ] **Step 3: Write the semantic map and roadmap.**

  Map brand, commercial, informational, seasonal, and tour-specific clusters to one target page each. Mark existing/new and NOW/NEXT/LATER with impact and effort. Do not invent search volume or ranking data.

- [ ] **Step 4: Record the AFTER baseline.**

  Run the final generated-artifact and runtime checks, copy exact route counts and pass/fail evidence into the after document, and distinguish local proof from post-deploy verification still required.

- [ ] **Step 5: Commit documentation.**

  ```text
  git add -f docs/seo/SEO-AUDIT-AND-PLAYBOOK.md docs/seo/SEO-SEMANTIC-MAP.md docs/seo/SEO-BASELINE-BEFORE.md docs/seo/SEO-BASELINE-AFTER.md
  git commit -m "docs(seo): add audit playbook and growth roadmap"
  ```

### Task 7: Final regression and branch-safety review

**Files:**
- Modify: only files already listed in Tasks 1–6 when a verified regression requires it.

- [ ] **Step 1: Run the complete verification set.**

  ```text
  npm run lint
  npm test
  npm run build
  npm run data:ssg
  npm run og:shells
  npm run verify:og-shells
  npm run verify:seo-dist
  npm run seo:check
  npx playwright test tests/seo-runtime.spec.ts
  ```

  Expected: every command exits 0; record warnings separately from failures.

- [ ] **Step 2: Review the final diff by path.**

  ```text
  git status --short
  git diff --stat 08286f8..HEAD
  git diff --check 08286f8..HEAD
  ```

  Confirm that unrelated user changes remain untouched and no push/deploy command was run.

- [ ] **Step 3: Update AFTER documentation with final evidence.**

  Record exact commands, route counts, remaining live-production checks, and the fact that no Search Console/Yandex Webmaster account data was available.

- [ ] **Step 4: Commit only the final documentation adjustment.**

  ```text
  git add -f docs/seo/SEO-BASELINE-AFTER.md docs/seo/SEO-AUDIT-AND-PLAYBOOK.md
  git commit -m "docs(seo): record final verification evidence"
  ```

## Execution Notes

Execute tasks in order. Each task has its own test cycle and commit. Do not start a later task by assuming an earlier task passed; rerun the listed command and inspect its exit code and output.
