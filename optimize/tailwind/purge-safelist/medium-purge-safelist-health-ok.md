---
id: TW-2026-009
title: Purge health — ключевые @apply / component классы в production CSS
category: purge-safelist
severity: info
status: confirmed
confidence: high
created: 2026-05-27
updated: 2026-05-27
modules: [M1, M2]
files:
  - dist/assets/index-*.css
  - src/index.css
effort: S
tags: [purge, C2]
related: [TW-2026-001]
---

# Purge health OK (выборочная проверка C2)

## Симптом

Нет признаков **C2 critical** (класс только в `@apply`, отсутствует в build).

## Доказательства

`npm run build` → поиск в `dist/assets/*.css`:

- `.home-contact-messenger-btn` — есть
- `.pt-navbar-chrome` — есть  
- `.z-home-hero-contact-rail` — есть (как utility)

## История

| дата | действие |
|------|----------|
| 2026-05-27 | confirmed (2 метода: build + dist grep) |
