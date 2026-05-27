---
id: OPT-2026-011
title: npm audit — uuid в exceljs (dev)
category: dependencies
severity: medium
status: fixed
confidence: high
created: 2026-05-27
updated: 2026-05-27
files:
  - package.json
  - package-lock.json
  - scripts/generate-tour-schedule-template.mjs
effort: S
tags: [audit, devDependencies]
related: []
---

# npm audit — uuid в exceljs (dev)

## Утверждение

`npm audit` сообщал **4 vulnerabilities** (1 high, 3 moderate): `exceljs` → `uuid` (GHSA-w5hq-g745-h8pq), плюс `tmp` и `brace-expansion` в dev-дереве. `exceljs` — только `scripts/`, не в runtime bundle.

## Доказательства (до fix)

```bash
npm audit
# 4 vulnerabilities (3 moderate, 1 high)
# exceljs >=3.5.0 → uuid@8.3.2
```

Импорты: `scripts/generate-tour-schedule-template.mjs`, `scripts/audit-tour-schedule-xlsx.mjs`.

## Решение (2026-05-27)

1. **`npm audit fix`** — `tmp`, `brace-expansion` (без `--force`).
2. **`package.json` → `overrides.uuid`: `^11.1.1`** — patched CJS-ветка uuid для transitive deps (exceljs остаётся `4.4.0`).
3. Проверка: `npm audit` → **0 vulnerabilities**; `npm ls uuid` → `exceljs@4.4.0` / `uuid@11.1.1`; `npm run generate:tour-schedule-template` ✅.

## Влияние

- **Prod:** без изменений (dev-only).
- **DX:** чистый `npm audit`, скрипты xlsx работают.

## Рекомендации

- [x] `npm audit fix` без `--force`.
- [x] Override `uuid` ≥ 11.1.1 (не downgrade exceljs через `--force`).

## История

| дата | действие |
|------|----------|
| 2026-05-27 | создано, status: confirmed |
| 2026-05-27 | audit fix + overrides; status: fixed; audit 0 |
