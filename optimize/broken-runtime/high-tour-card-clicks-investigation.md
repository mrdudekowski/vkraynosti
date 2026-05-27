---
id: OPT-2026-002
title: Клики по карточкам туров — открытый debug, нет e2e
category: broken-runtime
severity: high
status: wont-fix
confidence: high
created: 2026-05-27
updated: 2026-05-27
files:
  - src/components/shared/TourCard.tsx
  - src/pages/Home.tsx
  - docs/TOUR_BUTTONS_NOT_CLICKABLE_DEBUG_AGENT_PROMPT.md
effort: M
tags: [routing, overlay, home]
related: [OPT-2026-003]
---

# Клики по карточкам туров — открытый debug, нет e2e

## Утверждение

В репозитории есть отдельный debug-промпт о неработающих кликах по турам; статический аудит не подтвердил и не опровергнул баг в prod, но риск overlay / navbar chrome остаётся.

## Доказательства

### 1. Статический след

- `docs/TOUR_BUTTONS_NOT_CLICKABLE_DEBUG_AGENT_PROMPT.md` — зафиксирован симптом.
- `TourCard` без `onClick` рендерит `Link` с `buildTourDetailPath` — маршрутизация канонична.
- E2E: `e2e/*.spec.ts` — **нет** теста «клик TourCard → TourDetailPage».

### 2. Пример в коде

```117:127:src/components/shared/TourCard.tsx
const TourCardComponent = ({ tour, onClick, compact = false, priorityImage = false }: TourCardProps) => {
  if (!onClick) {
    return (
      <Link
        to={buildTourDetailPath(tour.season, tour.id)}
        className="card-base block h-full w-full max-h-tour-card max-w-tour-card justify-self-center cursor-pointer no-underline text-inherit"
        prefetch="intent"
      >
```

```134:135:src/components/layout/Navbar.tsx
  const navShellPointerEvents =
    isHomePath && navShellOpacity < 0.001 ? 'pointer-events-none' : '';
```

### 3. Runtime / build

- `npm run build`: pass
- `npm test`: 264 passed — unit-тесты карточки не заменяют клик в браузере
- **Не выполнялось:** Playwright-клик по карточке в этой сессии

## Влияние

- **Пользователь:** блокировка основного потока «главная → тур».
- **Разработка:** регрессии overlay/navbar chrome сложно ловить без e2e.

## Корневая причина (гипотеза)

Перекрытие fixed-слоёв (navbar shell, gate, team backdrop, mobile menu backdrop) или исключение при `basename` / неверный `tourId`.

## Рекомендации

### Минимальный fix (безопасный)

- [ ] Playwright: клик по первой `TourCard` на главной → URL `/tours/:season/:tourId`, нет error boundary.
- [ ] DevTools: element under pointer на сетке туров (desktop + mobile).

### Идеальный fix (если отличается)

- [ ] Единая матрица `z-index` / `pointer-events` для home gate + tours section в design tokens.

## Чеклист проверки

- [ ] `npm run dev` + 3–5 карточек (из промпта)
- [ ] Проверить mobile menu overlay не залипает `pointer-events`
- [ ] Preview на GitHub Pages с `base: /vkraynosti/`

## Вопросы к команде

Симптом воспроизводится сейчас на `main` / локально? Только home или и season pages?

## История

| дата | действие |
|------|----------|
| 2026-05-27 | создано, status: hypothesis |
| 2026-05-27 | владелец: не воспроизводится → status: wont-fix |
