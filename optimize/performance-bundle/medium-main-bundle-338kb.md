---
id: OPT-2026-008
title: Крупный entry chunk index (~338 kB JS)
category: performance-bundle
severity: medium
status: fixed
confidence: high
created: 2026-05-27
updated: 2026-05-27
files:
  - vite.config.ts
  - src/pages/Home.tsx
effort: L
tags: [bundle, code-splitting]
related: []
---

# Крупный entry chunk index (~338 kB JS)

## Утверждение

После `vite build` основной чанк `dist/assets/index-*.js` ≈ **337.71 kB** (gzip **87.56 kB**), что тянет home + тяжёлые зависимости в один бандл.

## Доказательства

### 1. Build output

Из `optimize/_runs/2026-05-27-build.log`:

```text
dist/assets/index-C0nFunHe.js   337.71 kB │ gzip: 87.56 kB
dist/assets/TourDetailPage-*.js  50.13 kB │ gzip: 12.65 kB
```

`Home` импортируется eagerly в `router.tsx` (не lazy).

### 2. Пример

```6:6:src/router.tsx
import Home from './pages/Home';
```

`Home.tsx` — крупная композиция (hero, gate, tours grid, suspense blocks).

## Влияние

- **Пользователь:** больше JS до интерактивности на главной.
- **Разработка:** сезонные страницы уже lazy; главная — узкое место.

## Рекомендации

- [ ] Lazy ниже fold секций (team, contact) уже частично через Suspense — оценить lazy `Home` sub-routes.
- [ ] Аудит импортов `Home.tsx` (FontAwesome, banner).

## История

| дата | действие |
|------|----------|
| 2026-05-27 | создано, status: confirmed |
| 2026-05-27 | lazy `HomePage`; index ~284 kB gzip 72; чанк `Home` ~43 kB gzip 14 |
