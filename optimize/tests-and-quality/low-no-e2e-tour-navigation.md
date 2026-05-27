---
id: OPT-2026-012
title: Нет e2e на переход home → tour detail
category: tests-and-quality
severity: low
status: fixed
confidence: high
created: 2026-05-27
updated: 2026-05-27
files:
  - e2e/
  - src/components/shared/TourCard.tsx
effort: S
tags: [playwright, regression]
related: [OPT-2026-002]
---

# Нет e2e на переход home → tour detail

## Утверждение

Playwright покрывает navbar, calendar nav, performance — но не сценарий клика по `TourCard` с главной на `TourDetailPage`.

## Доказательства

Файлы `e2e/`:

- `navbar.spec.ts`
- `tour-calendar-nav.spec.ts`
- `home-performance.spec.ts`
- `tour-detail-performance.spec.ts` (прямой URL через `buildTourDetailPath`, не клик с home)

## Рекомендации

- [ ] Добавить `e2e/tour-card-navigation.spec.ts` с `baseURL` учётом `/vkraynosti/`.

## История

| дата | действие |
|------|----------|
| 2026-05-27 | создано, status: confirmed |
| 2026-05-27 | `e2e/tour-card-navigation.spec.ts`, status: fixed |
