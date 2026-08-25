# Admin Frontend App design

## Goal

Deploy the CMS/CRM admin UI as a separate React Frontend App at
`https://admin.vkraynosti.ru/`, while keeping the public site and CMS API in
their existing applications.

## Architecture

```text
vkraynosti.ru       -> public Frontend App
admin.vkraynosti.ru -> admin Frontend App
api.vkraynosti.ru   -> CMS Backend App (existing technical domain may remain)
vkraynosti-cms-dev  -> S3 media and CMS JSON data
```

The admin app will be built from a dedicated branch, `codex/admin-app`, with
the admin source and the minimum shared modules required by the existing
application. The branch will expose one root entry point, `index.html`, so
Timeweb does not need a second HTML path or a redirect.

## Build and runtime contract

- Build command: `npm run build:admin`.
- Output directory: `dist-admin`.
- App framework: React.
- `VITE_CMS_API_BASE_URL` points to the CMS Backend App.
- `VITE_CMS_S3_BASE_URL` points to the `vkraynosti-cms-dev` bucket/CDN.
- No backend secrets or S3 secret keys are included in the frontend build.
- Hash routes remain supported: `/#/login`, `/#/schedule`, and other admin routes.

## Backend and domain changes

The backend CORS allowlist will include exactly the admin origin
`https://admin.vkraynosti.ru` in addition to already approved origins. Cookie
attributes and authentication behavior will be verified for cross-origin API
requests. DNS and the custom domain will be configured in Timeweb App Platform;
TLS is provided by Timeweb.

## Staging cleanup

The current staging branch will not be cleaned until the new admin app passes
build, local smoke, API login, and deployed smoke checks. After that, only the
admin entry point and admin-only frontend dependencies will be removed from the
public frontend deployment; the backend, CMS contracts, shared data utilities,
and public site behavior will remain unchanged.

## Verification gates

1. Typecheck and admin-only production build pass.
2. `dist-admin/index.html` and all referenced assets exist.
3. Local admin routes load and call the configured API origin.
4. Backend CORS responds for `https://admin.vkraynosti.ru`.
5. Timeweb deployment serves `/` without SPA fallback conflicts.
6. Login and a representative schedule read/write smoke test pass.
