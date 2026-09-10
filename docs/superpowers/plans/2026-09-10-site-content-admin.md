# Site Content Admin Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a permission-protected admin page with independent Team, Contacts, and Footer CMS documents, then render each published document in the public site with responsive behavior and last-valid snapshots.

**Architecture:** Use three separate JSON CMS documents with separate draft/meta and published keys, routes, autosave, and publish operations. Put shared document schemas, key builders, migration, and public loaders in `src/cms`; put Hono persistence and authorization in the staging backend worktree; build the admin page in `codex/admin-app`; connect the public app in `web-vkr-test`. Keep the existing decorative team-to-footer bridge mounted when Contacts is hidden.

**Tech Stack:** React 19, React Router, TypeScript, Vite, Hono, Zod, Vitest, Testing Library, Playwright, S3 JSON/object storage.

## Global Constraints

- Use three independent CMS documents: `team`, `contacts`, and `footer`.
- Each document has independent draft, autosave, and publish behavior.
- Editors require the new `site_content` privilege to edit and publish site content; admins retain full access.
- Existing admin styles and components are reused; layouts must work on desktop, tablet, and mobile without horizontal overflow.
- Name and photo are required for a team member; role, experience, and bio have independent visibility flags.
- Contacts can be hidden as a whole; the decorative bridge remains and the footer follows immediately.
- Current static content seeds the first drafts.
- Published frontend data uses the last valid published snapshot when a temporary CMS read fails.
- Old assets remain reversible until publish and are removed after publish only when unreferenced.
- Preserve all pre-existing dirty changes in all worktrees; stage only files belonging to the current task.

---

### Task 1: Define shared site-content documents and storage keys

**Files:**
- Create: `src/cms/siteContentDocument.ts`
- Create: `src/cms/siteContentPackageKeys.ts`
- Create: `src/cms/siteContentDocument.test.ts`
- Create: `src/cms/siteContentPackageKeys.test.ts`
- Modify: `src/cms/cmsPackageKeys.ts`

**Interfaces:**
- Produces `SiteContentDocumentKind = 'team' | 'contacts' | 'footer'`.
- Produces `TeamContentDocument`, `ContactsContentDocument`, `FooterContentDocument`, and `SiteContentDocument`.
- Produces `parseSiteContentDocument(kind, input)`.
- Produces `siteContentDraftKey(kind)`, `siteContentDraftMetaKey(kind)`, and `siteContentPublishedKey(kind)`.

- [ ] **Step 1: Write failing schema tests** for required team name/photo, independent field visibility, contact section visibility, link icon metadata, footer row types, stable legal document ids, and default visibility/order values.
- [ ] **Step 2: Run the focused tests and confirm failure.**

Run: `npm test -- src/cms/siteContentDocument.test.ts src/cms/siteContentPackageKeys.test.ts`

Expected: FAIL because the new schema and key functions do not exist.

- [ ] **Step 3: Implement the Zod schemas and key builders.** Use a discriminated `kind` field, `schemaVersion: 1`, stable ids, finite order numbers, `visible: boolean`, and asset references containing `assetId`, `url`, `mimeType`, and optional `alt`. Keep document-specific unions explicit so a footer PDF row cannot be parsed as a text row.
- [ ] **Step 4: Add package-key exports and compatibility defaults.** Keys must be `draft/site-content/{kind}/document.json`, `draft/site-content/{kind}/meta.json`, and `published/site-content/{kind}/document.json`.
- [ ] **Step 5: Run the focused tests and typecheck.**

Run: `npm test -- src/cms/siteContentDocument.test.ts src/cms/siteContentPackageKeys.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit only the shared document files.**

Run: `git add src/cms/siteContentDocument.ts src/cms/siteContentDocument.test.ts src/cms/siteContentPackageKeys.ts src/cms/siteContentPackageKeys.test.ts src/cms/cmsPackageKeys.ts; git commit -m "feat(cms): define site content documents"`

### Task 2: Add migration and public snapshot loading

**Files:**
- Create: `src/cms/siteContentSeed.ts`
- Create: `src/cms/siteContentMigration.test.ts`
- Create: `src/cms/loadSiteContent.ts`
- Create: `src/cms/loadSiteContent.test.ts`
- Create: `src/cms/siteContentUrls.ts`
- Create: `src/cms/siteContentUrls.test.ts`
- Modify: `src/constants/contacts.ts`
- Modify: `src/data/teamData.ts`
- Modify: `src/constants/footerContact.ts` only if a shared rendering constant is needed

**Interfaces:**
- Produces `seedSiteContentDocuments(): Record<SiteContentDocumentKind, SiteContentDocument>`.
- Produces `loadPublishedSiteContent(kind): Promise<SiteContentDocument | null>`.
- Consumes the public asset base helpers and current static constants.

- [ ] **Step 1: Write migration tests** asserting that all four current team members, current phone/email/Telegram/Max values, current footer legal documents, navigation, rights, cookie settings, and studio credit are represented with stable ids.
- [ ] **Step 2: Write loader tests** with a successful published response, an invalid response, and a temporary failure where the last valid in-memory snapshot is returned.
- [ ] **Step 3: Implement seed conversion.** Convert `TEAM`, `CONTACTS`, `UI.footer`, `LEGAL_ENTITY`, `LEGAL_DOCUMENTS`, and navigation links into the three versioned documents. Set current role visibility to true and current experience visibility to false to preserve the current site until an admin enables it.
- [ ] **Step 4: Implement URL resolution and the loader.** Fetch only published keys, parse through `parseSiteContentDocument`, retain the last parsed value per kind, and return null only when no valid value has ever loaded.
- [ ] **Step 5: Run tests.**

Run: `npm test -- src/cms/siteContentMigration.test.ts src/cms/loadSiteContent.test.ts src/cms/siteContentUrls.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit the migration and loader.**

Run: `git add src/cms/siteContentSeed.ts src/cms/siteContentMigration.test.ts src/cms/loadSiteContent.ts src/cms/loadSiteContent.test.ts src/cms/siteContentUrls.ts src/cms/siteContentUrls.test.ts src/constants/contacts.ts src/data/teamData.ts; git commit -m "feat(cms): seed and load site content"`

### Task 3: Add CMS authorization and independent site-content API

**Files in backend worktree `E:/Cursor Projects/Vkrainosti-cms-crm-phase1/.worktrees/staging-fix`:**
- Modify: `src/cms/cmsUsers.ts`
- Modify: `scripts/cms/api/session.ts`
- Modify: `scripts/cms/api/usersStore.ts`
- Modify: `scripts/cms/api/app.ts`
- Create: `scripts/cms/api/siteContentRoutes.ts`
- Create: `scripts/cms/api/siteContentRoutes.test.ts`
- Modify: `src/cms/siteContentDocument.ts`
- Modify: `src/cms/siteContentPackageKeys.ts`

**Interfaces:**
- Public session fields: `canEditSiteContent: boolean`.
- User record field: `canEditSiteContent: boolean`, default false for editors and true by role for admins.
- Routes: `GET/PUT/POST /api/cms/site-content/:kind`, with `PUT` accepting `{ rev, document }` and `POST` publishing `{ rev }`.
- Upload routes: `POST/DELETE /api/cms/site-content/:kind/assets/:assetId`, using a kind-scoped asset prefix.

- [ ] **Step 1: Add failing API tests** for admin access, editor with privilege, editor without privilege, independent revision conflicts, independent publishing, and GET of published content without authentication.
- [ ] **Step 2: Add failing user tests** for persisted privilege, admin automatic access, and editor checkbox round-trip.
- [ ] **Step 3: Implement privilege parsing and session projection.** Backward-compatible user files default missing privilege to false for editors; admins receive true regardless of stored value. Do not change existing tour/schedule publication semantics.
- [ ] **Step 4: Implement the three document routes.** Validate `kind`, load or seed the requested document, enforce revision equality, parse the complete next document, write draft/meta, and return the document plus meta. Publish only the requested kind to its published key.
- [ ] **Step 5: Implement asset upload/delete.** Accept SVG/PNG icons, photo formats already allowed by CMS, and PDF legal files with explicit byte limits; generate safe kind-scoped object keys; retain old assets until the document is published; reject deleting an asset still referenced by a draft or published document.
- [ ] **Step 6: Run backend tests and typecheck.**

Run from the backend worktree: `npm test -- scripts/cms/api/siteContentRoutes.test.ts src/cms/cmsUsers.test.ts` and `npm run build`

Expected: all focused tests pass and TypeScript compilation succeeds.

- [ ] **Step 7: Commit only backend site-content changes.**

Run from the backend worktree: `git add src/cms/cmsUsers.ts scripts/cms/api/session.ts scripts/cms/api/usersStore.ts scripts/cms/api/app.ts scripts/cms/api/siteContentRoutes.ts scripts/cms/api/siteContentRoutes.test.ts src/cms/siteContentDocument.ts src/cms/siteContentPackageKeys.ts; git commit -m "feat(cms): add independent site content API"`

### Task 4: Expose the new privilege in admin API and user management

**Files in `E:/Cursor Projects/Vkrainosti-cms-crm-phase1-admin-app`:**
- Modify: `src/admin/api.ts`
- Modify: `src/admin/UsersPage.tsx`
- Modify: `src/admin/UsersPage.test.tsx`
- Modify: `src/admin/components/AdminChrome.tsx`
- Modify: `src/admin/constants/routes.ts`
- Modify: `src/admin/constants/ui.ts`
- Modify: `src/admin/AdminApp.tsx`

- [ ] **Step 1: Add failing tests** for the session/user privilege field, the user checkbox, sidebar visibility, and route guard.
- [ ] **Step 2: Extend `AdminSession` and `AdminUser` with `canEditSiteContent`, and send that field in `adminUpdateUser`.**
- [ ] **Step 3: Add the checkbox labeled «Изменение сайта».** Disable or hide it for admins because their access is automatic; preserve existing last-admin and self-edit rules.
- [ ] **Step 4: Add `/site` route and sidebar item.** Render it for admins and editors with the privilege; redirect unauthorized users to `/`; keep the existing tours and CRM routes unchanged.
- [ ] **Step 5: Run focused admin tests and typecheck.**

Run: `npm test -- src/admin/UsersPage.test.tsx src/admin/components/AdminChrome.test.tsx` and `npm run build`

Expected: PASS.

- [ ] **Step 6: Commit the privilege and route shell.**

Run: `git add src/admin/api.ts src/admin/UsersPage.tsx src/admin/UsersPage.test.tsx src/admin/components/AdminChrome.tsx src/admin/constants/routes.ts src/admin/constants/ui.ts src/admin/AdminApp.tsx; git commit -m "feat(admin): add site content permission"`

### Task 5: Build the tabbed Site page and reusable editors

**Files in `E:/Cursor Projects/Vkrainosti-cms-crm-phase1-admin-app`:**
- Create: `src/admin/SitePage.tsx`
- Create: `src/admin/site/siteTypes.ts`
- Create: `src/admin/site/useSiteContentDocument.ts`
- Create: `src/admin/site/SiteTeamTab.tsx`
- Create: `src/admin/site/SiteContactsTab.tsx`
- Create: `src/admin/site/SiteFooterTab.tsx`
- Create: `src/admin/site/SiteAssetPicker.tsx`
- Create: `src/admin/site/siteDraft.test.ts`
- Create: `src/admin/SitePage.test.tsx`
- Modify: `src/admin/api.ts`
- Modify: `src/admin/constants/ui.ts`

- [ ] **Step 1: Write failing draft tests** for independent revision state, debounce save, tab switching, hidden rows, order changes, and publish calls scoped to one kind.
- [ ] **Step 2: Implement typed API clients** `adminGetSiteContent`, `adminSaveSiteContent`, `adminPublishSiteContent`, `adminUploadSiteAsset`, and `adminDeleteSiteAsset` with `rev_conflict`, `forbidden`, and upload errors mapped to existing admin alerts.
- [ ] **Step 3: Implement `useSiteContentDocument(kind)`.** Track draft/meta/loading/error/saving/publishing state, debounce changes, cancel stale requests, and replace local state only with the server response that matches the current revision.
- [ ] **Step 4: Implement the page tabs.** Use an accessible `role=tablist`, preserve the selected tab in the hash, render one document editor at a time, and keep independent save/publish status visible.
- [ ] **Step 5: Implement Team tab.** Reuse admin cards, inputs, buttons, badges, confirmation dialogs, and existing responsive utility classes. Support add/edit/hide/delete/reorder, independent role/experience/bio visibility, required name/photo, photo preview, alt text, and mobile/tablet stacked controls.
- [ ] **Step 6: Implement Contacts tab.** Support section visibility, standard channels, arbitrary links, per-row visibility/order, preset Font Awesome icons, custom SVG/PNG upload, icon alt text, and link validation.
- [ ] **Step 7: Implement Footer tab.** Support fixed and arbitrary rows, row types `text/link/pdf`, visibility/order, editable headings/values, stable legal ids, PDF replacement, and reversible deletion confirmation.
- [ ] **Step 8: Run focused component tests, lint, and build in the admin worktree.**

Run: `npm test -- src/admin/SitePage.test.tsx src/admin/site/siteDraft.test.ts`, `npm run lint`, and `npm run build`

Expected: PASS with no horizontal-overflow assertions failing.

- [ ] **Step 9: Commit the Site page.**

Run: `git add src/admin/SitePage.tsx src/admin/site src/admin/api.ts src/admin/constants/ui.ts; git commit -m "feat(admin): add site content editor"`

### Task 6: Connect published site documents to the public frontend

**Files in `E:/Cursor Projects/Vkrainosti`:**
- Create: `src/cms/SiteContentProvider.tsx`
- Create: `src/cms/SiteContentProvider.test.tsx`
- Create: `src/cms/siteContentSelectors.ts`
- Create: `src/cms/siteContentSelectors.test.ts`
- Modify: `src/main.tsx`
- Modify: `src/pages/Home.tsx`
- Modify: `src/components/home/TeamHeroSection.tsx`
- Modify: `src/components/home/TeamMemberHeroSlide.tsx`
- Modify: `src/components/home/ContactSection.tsx`
- Modify: `src/components/home/HomeTeamContactBrandBridge.tsx` only if a provider state is needed
- Modify: `src/components/layout/Footer.tsx`
- Modify: `src/components/layout/FooterStudioCreditLink.tsx`
- Modify: `src/components/legal/LegalPdfLink.tsx`

- [ ] **Step 1: Write failing selector/provider tests** for published data, last-valid retention, team field visibility, contacts hidden state, and footer row visibility.
- [ ] **Step 2: Implement `SiteContentProvider`.** Load the three kinds independently, retain the last valid parsed value for each, and expose loading/error state without blocking the rest of the public app.
- [ ] **Step 3: Update Team rendering.** Read ordered visible members from the provider, preserve grouping by two, show role/experience/bio only when their flags are enabled, remove the current mobile-only experience restriction, and retain static seed behavior when no CMS document exists.
- [ ] **Step 4: Update Contact rendering.** Render the section only when its document says visible, render visible channels and custom links with safe href helpers and configured icons, and leave `HomeTeamContactBrandBridge` mounted so the bridge is followed directly by the footer.
- [ ] **Step 5: Update Footer rendering.** Render configured visible rows and legal documents, resolve stable legal ids to routes/PDF URLs, and keep cookie settings behavior intact.
- [ ] **Step 6: Add the provider to `main.tsx` without changing existing tour or schedule providers.**
- [ ] **Step 7: Run focused frontend tests and build.**

Run: `npm test -- src/cms/SiteContentProvider.test.tsx src/cms/siteContentSelectors.test.ts src/components/home/TeamMemberHeroSlide.test.tsx src/components/layout/FooterStudioCreditLink.test.tsx` and `npm run build`

Expected: PASS.

- [ ] **Step 8: Commit public integration.**

Run: `git add src/cms/SiteContentProvider.tsx src/cms/SiteContentProvider.test.tsx src/cms/siteContentSelectors.ts src/cms/siteContentSelectors.test.ts src/main.tsx src/pages/Home.tsx src/components/home/TeamHeroSection.tsx src/components/home/TeamMemberHeroSlide.tsx src/components/home/ContactSection.tsx src/components/home/HomeTeamContactBrandBridge.tsx src/components/layout/Footer.tsx src/components/layout/FooterStudioCreditLink.tsx src/components/legal/LegalPdfLink.tsx; git commit -m "feat(site): render CMS site content"`

### Task 7: Add end-to-end and responsive verification

**Files:**
- Create: `e2e/site-content-admin.spec.ts`
- Create: `e2e/site-content-public.spec.ts`
- Modify: `playwright.config.ts` only if the CMS API and Vite app need an explicit local fixture server
- Modify: `scripts/cms/api/app.test.ts` only for shared auth setup

- [ ] **Step 1: Add API/browser fixture data** with four team members, one hidden role, one hidden contact channel, one custom icon, and one footer PDF row.
- [ ] **Step 2: Add admin browser coverage** for login, sidebar permission visibility, switching all three tabs, editing and autosaving, publishing one section independently, hiding/reordering/deleting a team member, and replacing a PDF.
- [ ] **Step 3: Add public browser coverage** for published team/contact/footer content, hidden contacts leaving the decorative bridge before the footer, hidden footer rows, and restoration after republish.
- [ ] **Step 4: Run desktop, tablet, and mobile projects.**

Run: `npm run test:e2e -- e2e/site-content-admin.spec.ts e2e/site-content-public.spec.ts`

Expected: all projects pass; the public page has no horizontal overflow at the configured tablet and mobile widths.

- [ ] **Step 5: Run the full relevant validation set.**

Run: `npm test`, `npm run lint`, `npm run build`, and `npm run test:e2e -- e2e/site-content-admin.spec.ts e2e/site-content-public.spec.ts`

Expected: PASS, with any unrelated pre-existing failures recorded separately.

### Task 8: Deployment handoff and runtime proof

**Files:**
- Modify only deployment/config files required by verified runtime failures.
- Create: `docs/superpowers/verification/2026-09-10-site-content-admin-runtime.md`

- [ ] **Step 1: Verify the backend staging branch contains the site-content API commit and that its deployed CMS endpoint exposes `/api/cms/health`.**
- [ ] **Step 2: Start the local CMS API and public Vite host using the repository’s existing `dev:cms` flow with test credentials and a test S3/memory store.
- [ ] **Step 3: Smoke-test the full path in a real browser:** grant `site_content` to an editor, edit and publish Contacts, hide Contacts, reload the public home page, inspect that the bridge remains and footer follows, then restore Contacts and verify all three sections.
- [ ] **Step 4: Record URLs, branch/commit ids, test commands, and observed results in the verification file.**
- [ ] **Step 5: Run `git diff --check` and review all staged files before any publication or push.**

## Self-review checklist

- The spec requirement for three independent documents is covered by Tasks 1–3.
- The new editor privilege and admin override are covered by Tasks 3–4.
- Tabbed admin UI, existing styles, responsive behavior, uploads, ordering, visibility, and reversible deletion are covered by Task 5.
- Public team, contacts, bridge, footer, legal documents, and last-valid snapshots are covered by Task 6.
- Unit, component, API, browser, and local-host proof are covered by Tasks 1–3 and 7–8.
- No task resets or cleans a dirty worktree; each commit stages an explicit file list.
- All later interfaces use the exact `canEditSiteContent`, `siteContentDraftKey`, `parseSiteContentDocument`, and route names defined earlier.
