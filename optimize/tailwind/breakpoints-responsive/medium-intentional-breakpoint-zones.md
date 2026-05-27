---
id: TW-2026-006
title: Промежуточные viewport-зоны (500–949, 650–767) — drift или UX?
category: breakpoints-responsive
severity: medium
status: wont-fix
confidence: medium
created: 2026-05-27
updated: 2026-05-27
modules: [M3, M4, M10]
viewport: [500, 640, 650, 768, 950]
files:
  - src/components/layout/Navbar.tsx
  - src/constants/homeGateScroll.ts
  - src/constants/breakpoints.ts
effort: M
tags: [C3]
related: []
blocked-by: [TW-Q01]
---

# Intentional breakpoint zones

## Симптом

На части ширин одновременно активны **разные** tier’ы (navbar burger + season switcher + mobile team + desktop gate).

## Механизм

| Константа | px | Tailwind |
|-----------|-----|----------|
| season-md | 500 | `season-md:` |
| sm | 576 | `sm:` |
| drawer compact | 640 | `mobile-nav-drawer-compact:` |
| team-hero desktop | 650 | `team-hero-desktop:` |
| md | 768 | `md:` |
| nav-desktop | 950 | `nav-desktop:` |

Примеры:

- Navbar: `season-md:block` SeasonSwitcher + `nav-desktop:hidden` burger (`Navbar.tsx` ~303–324).
- Gate: `HOME_GATE_DESKTOP_ROOT_CLASS = 'hidden md:block'` (`homeGateScroll.ts` ~48) vs team `650px`.

## Доказательства

1. `breakpoints.ts` комментарии явно разделяют drawer 640 и team 650.
2. `Navbar.tsx` — season switcher с 500px, desktop nav с 950px.
3. **Нет** кода `matchMedia(950)` в Navbar — только Tailwind → рассинхрон с JS маловероятен для nav.

## Fix direction

- **Минимальный:** документировать матрицу зон в `breakpoints.ts` (см. TW-Q01).
- **Канонический:** выровнять gate к `team-hero-desktop` или nav-desktop — **только после** ответа продукта.

## История

| дата | действие |
|------|----------|
| 2026-05-27 | confirmed (code trace); visual C3 not reproduced — confidence medium |
| 2026-05-27 | wont-fix: продукт подтвердил tablet UX (TW-Q01) |
