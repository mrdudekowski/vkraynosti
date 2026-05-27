---
id: OPT-2026-005
title: Deprecated-алиасы без потребителей
category: dead-code
severity: low
status: fixed
confidence: high
created: 2026-05-27
updated: 2026-05-27
files:
  - src/constants/images.ts
  - src/constants/seasonPrimaryButton.ts
effort: S
tags: [deprecation]
related: []
---

# Deprecated-алиасы без потребителей

## Утверждение

`TOUR_MOBILE_IMAGE_VARIANTS` и `SEASON_PRIMARY_BTN_BG_HEX` помечены `@deprecated`, но нигде не импортируются (только re-export в файлах-источниках).

## Доказательства

### 1. Статический след

Поиск символов: вхождения только в `images.ts` и `seasonPrimaryButton.ts`.

### 2. Пример в коде

```1280:1281:src/constants/images.ts
/** @deprecated Use resolveTourCoverMobileUrl + TOUR_COVER_MOBILE_OVERRIDES */
export const TOUR_MOBILE_IMAGE_VARIANTS = TOUR_COVER_MOBILE_OVERRIDES;
```

```89:90:src/constants/seasonPrimaryButton.ts
/** @deprecated Используйте `SEASON_PRIMARY_BTN_FILL_HEX`. */
export const SEASON_PRIMARY_BTN_BG_HEX = SEASON_PRIMARY_BTN_FILL_HEX;
```

## Влияние

- **Разработка:** путаница при миграции API констант.

## Рекомендации

- [ ] Удалить алиасы в отдельном PR после grep по внешним веткам.

## История

| дата | действие |
|------|----------|
| 2026-05-27 | создано, status: confirmed |
| 2026-05-27 | удалены `TOUR_MOBILE_IMAGE_VARIANTS`, `SEASON_PRIMARY_BTN_BG_HEX` |
