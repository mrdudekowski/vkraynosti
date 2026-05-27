---
id: OPT-2026-009
title: Tailwind warn — min/max variants + object screens
category: design-system
severity: low
status: fixed
confidence: high
created: 2026-05-27
updated: 2026-05-27
files:
  - tailwind.config.ts
effort: M
tags: [tailwind]
related: []
---

# Tailwind warn — min/max variants + object screens

## Утверждение

При сборке Vite/Tailwind выводится предупреждение: `min-*` и `max-*` variants не поддерживаются с `screens` в виде objects.

## Доказательства

### 1. Build log

```text
warn - The `min-*` and `max-*` variants are not supported with a `screens` configuration containing objects.
```

`optimize/_runs/2026-05-27-build.log`

### 2. Контекст

В проекте используются кастомные breakpoints (`nav-desktop`, `season-md`, …) в `tailwind.config.ts`.

## Влияние

- Часть responsive-стилей с `min-[...]` / `max-[...]` может **не попасть** в CSS.
- **Пользователь:** визуальные регрессии на краевых breakpoints.

## Рекомендации

- [ ] Сверить `tailwind.config.ts` screens с документацией Tailwind v3.
- [ ] Заменить object-screens на flat map или убрать conflicting variants.

## История

| дата | действие |
|------|----------|
| 2026-05-27 | создано, status: confirmed |
| 2026-05-27 | `tour-cover-wide` screen; убраны `min-[620px]:` arbitrary variants |
