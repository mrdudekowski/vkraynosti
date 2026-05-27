---
id: TW-2026-001
title: Safelist ~200+ строк — вес CSS и риск мёртвых записей
category: purge-safelist
severity: high
status: fixed
confidence: high
created: 2026-05-27
updated: 2026-05-27
modules: [M1]
viewport: [320, 1200, 1400]
files:
  - tailwind.config.ts
  - scripts/audit-tailwind-safelist.mjs
  - scripts/prune-tailwind-safelist.mjs
effort: L
tags: [safelist, bundle]
related: [TW-2026-009]
---

# Safelist bloat

## Симптом

Production CSS **~128 kB**; `safelist` содержал **~231** строковых литерала + patterns. Дубли и классы, уже присутствующие в `src/**/*.tsx`, раздували конфиг.

## Решение (2026-05-27)

1. **`content`** — добавлен `./src/index.css` (классы из `@apply` и component layer без ручного safelist).
2. **`scripts/audit-tailwind-safelist.mjs`** — аудит: TS vs index.css vs dead.
3. **`scripts/prune-tailwind-safelist.mjs`** — снято **~213** литералов; оставлено **14** pattern-блоков + **14** литералов (keyframes, safety stack, motion-safe).
4. Удалены мёртвые gate-классы (`z-home-gate-letterbox`, `bg-home-gate-return-veil`, …) — в разметке не использовались.
5. Pattern `^max-h-safety-status-stack-\d+$` вместо перечисления 1–6.
6. `npm test` 276 ✅, `npm run build` ✅; spot-check `pt-navbar-chrome`, `font-heading`, messenger, tour hero z — в CSS.

**Safelist после:** ~14 patterns + ~14 literals (было ~231 literals).

**CSS:** ~130 kB (gzip ~21 kB) — чуть выше за счёт полного скана `index.css`; конфиг существенно проще.

## История

| дата | действие |
|------|----------|
| 2026-05-27 | confirmed |
| 2026-05-27 | fix: content + prune scripts; status: fixed |
