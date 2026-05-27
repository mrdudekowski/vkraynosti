---
id: TW-2026-004
title: Tour calendar — arbitrary max-w/min-h без токенов
category: tokens-ssot
severity: low
status: fixed
confidence: high
created: 2026-05-27
updated: 2026-05-27
modules: [M8]
viewport: [320, 390]
files:
  - src/constants/tourCalendarLayout.ts
  - src/constants/tourCalendarLayout.test.ts
  - tailwind.config.ts
  - src/components/tourCalendar/tourCalendarClassNames.ts
  - src/components/tourCalendar/TourCalendarDayPanel.tsx
effort: S
tags: [C4]
related: []
---

# Calendar arbitrary sizing

## Симптом

`max-w-[2.75rem]` и `min-h-[12rem]` в календаре вместо токенов темы.

## Решение (2026-05-27)

- SSOT: `src/constants/tourCalendarLayout.ts` (`TOUR_CALENDAR_*`, классы с `max-w-tour-calendar-day-cell`, `min-h-tour-calendar-day-panel`).
- `tailwind.config.ts` → `maxWidth` / `minHeight`.
- `tourCalendarClassNames.ts`, `TourCalendarDayPanel.tsx` — импорт констант.
- `tourCalendarLayout.test.ts` — синхронизация с theme.

## История

| дата | действие |
|------|----------|
| 2026-05-27 | confirmed |
| 2026-05-27 | fix; build/test ✅ |
