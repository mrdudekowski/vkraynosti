---
id: TW-2026-003
title: TourDetailHero — z-20 / z-30 вне шкалы theme.zIndex
category: tokens-ssot
severity: medium
status: fixed
confidence: high
created: 2026-05-27
updated: 2026-05-27
modules: [M14]
viewport: [320, 992, 1200]
files:
  - src/components/tours/TourDetailHero.tsx
effort: S
tags: [z-index, C4]
related: []
---

# Tour detail hero z-20/z-30

## Симптом

Локальный стек hero overlay не использует именованные токены (`z-stack-base`, `z-30` в safelist для gate, но не для tour hero).

## Доказательства

```48:49:src/components/tours/TourDetailHero.tsx
    <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/70 ...
    <div className="absolute bottom-0 left-0 right-0 z-30 tour-detail-page-gutter ...
```

Шкала theme: `stack-base: 1`, `home-hero: 12`, `navbar: 100` — **нет** `z-20`/`z-30` tour tokens.

## Fix direction

- **Минимальный:** добавить `z-tour-detail-hero-gradient` / `z-tour-detail-hero-caption` в `theme.extend.zIndex` + safelist при необходимости.
- **Канонический:** один константный `TOUR_DETAIL_HERO_OVERLAY_CLASS` в `src/constants/`.

## История

| дата | действие |
|------|----------|
| 2026-05-27 | confirmed (read component + zIndex theme) |
| 2026-05-27 | fix: `tourDetailHeroStack.ts`, `z-tour-detail-hero-*` в theme; build/test ✅ |
