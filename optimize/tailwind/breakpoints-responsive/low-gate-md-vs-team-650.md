---
id: TW-2026-007
title: Desktop gate с md (768), team desktop с 650 — зона 650–767
category: breakpoints-responsive
severity: low
status: wont-fix
confidence: medium
created: 2026-05-27
updated: 2026-05-27
modules: [M5, M10]
viewport: [650, 700, 767]
files:
  - src/constants/homeGateScroll.ts
effort: S
tags: [C3]
related: [TW-2026-006]
---

# Gate 768 vs team 650

## Симптом

Между **650–767px** team уже desktop grid, ворота desktop (`md:block`) ещё скрыты в разметке (mobile gate path).

## Доказательства

```48:48:src/constants/homeGateScroll.ts
export const HOME_GATE_DESKTOP_ROOT_CLASS = 'hidden md:block shrink-0' as const;
```

Комментарий в файле: намеренно DOM с `md+` без ожидания JS.

## Fix direction

- **Минимальный:** оставить, задокументировать в TW-Q01.
- **Канонический:** `hidden team-hero-desktop:block` для gate root — согласовать с team layout.

## История

| дата | действие |
|------|----------|
| 2026-05-27 | confirmed (constants + comment) |
| 2026-05-27 | wont-fix: tablet UX (TW-Q01); зона в `breakpoints.ts` |
