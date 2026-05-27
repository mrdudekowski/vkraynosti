---
id: OPT-2026-006
title: SeasonRouteSync — хардкод /tours/:season
category: ssot-duplication
severity: medium
status: fixed
confidence: high
created: 2026-05-27
updated: 2026-05-27
files:
  - src/components/layout/SeasonRouteSync.tsx
  - src/constants/routes.ts
effort: S
tags: [routes, season]
related: []
---

# SeasonRouteSync — хардкод /tours/:season

## Утверждение

`SeasonRouteSync` использует `matchPath` с литералом `'/tours/:season'`, тогда как список сезонов и детали тура канонизированы в `ROUTES` / `SEASON_TO_LIST_ROUTE`.

## Доказательства

### 1. Статический след

`ROUTES.TOUR_DETAIL` используется для detail; list — отдельный паттерн не из `routes.ts`.

### 2. Пример в коде

```14:19:src/components/layout/SeasonRouteSync.tsx
  useLayoutEffect(() => {
    const detailMatch = matchPath(ROUTES.TOUR_DETAIL, pathname);
    const listMatch = matchPath(
      { path: '/tours/:season', end: true },
      pathname
    );
```

```9:18:src/constants/routes.ts
export const ROUTES = {
  HOME:        '/',
  WINTER:      '/tours/winter',
  // ...
  TOUR_DETAIL: '/tours/:season/:tourId',
```

### 3. Runtime

Сейчас паттерн совпадает с `ROUTES.WINTER` и др.; при переименовании маршрутов в `routes.ts` sync сломается без правки компонента.

## Влияние

- **Пользователь:** рассинхрон сезона в UI при смене path-префикса.
- **Разработка:** нарушение SSOT §3 `routes.ts`.

## Рекомендации

### Минимальный fix

- [ ] Экспорт `ROUTES.SEASON_LIST = '/tours/:season'` (или helper) из `routes.ts` и использовать в `matchPath`.

## История

| дата | действие |
|------|----------|
| 2026-05-27 | создано, status: confirmed |
| 2026-05-27 | `ROUTES.SEASON_LIST` + `SeasonRouteSync`, status: fixed |
