# Admin App deployment in Timeweb

## Frontend App

- Framework: `React`
- Repository: `mrdudekowski/vkraynosti`
- Branch: `codex/admin-app`
- Project path: repository root
- Build command: `npm run build:admin`
- Output directory: `dist-admin`
- Node.js: match the existing frontend app version

Public frontend variables only:

```text
VITE_BASE_PATH=/
VITE_CMS_API_BASE_URL=https://mrdudekowski-vkraynosti-0803.twc1.net
VITE_CMS_S3_BASE_URL=https://s3.twcstorage.ru/vkraynosti-cms-dev/
VITE_PUBLIC_ASSET_BASE_URL=https://s3.twcstorage.ru/vkraynosti-cms-dev/
VITE_PUBLIC_S3_BASE_URL=https://s3.twcstorage.ru/vkraynosti-cms-dev/
```

Do not add backend secrets or S3 secret keys to this app. The generated
frontend is public and relies on the backend for authentication and
authorization.

## Domain

Attach `admin.vkraynosti.ru` in App Platform → the Admin App → Settings →
Domains. Timeweb provisions TLS for the attached domain. The public site keeps
`vkraynosti.ru`; it is not moved by this configuration.

## Backend

The backend CORS allowlist must contain:

```text
https://admin.vkraynosti.ru
```

Keep the existing public-site origins. Configure the actual allowlist through
the backend `CMS_CORS_ORIGINS` variable without printing any secret values.

## Smoke checks

1. `https://admin.vkraynosti.ru/` returns the admin HTML shell.
2. `https://admin.vkraynosti.ru/#/login` renders the login screen.
3. Login requests go to the Backend App origin, not the frontend origin.
4. Backend responses include CORS for `https://admin.vkraynosti.ru`.
5. Schedule read and an authorized write are tested after login.
