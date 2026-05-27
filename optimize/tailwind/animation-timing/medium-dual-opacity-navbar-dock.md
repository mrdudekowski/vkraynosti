---
id: TW-2026-011
title: Navbar/Dock — inline opacity + Tailwind transition-opacity
category: animation-timing
severity: medium
status: fixed
confidence: high
created: 2026-05-27
updated: 2026-05-27
modules: [M4]
viewport: [320, 1200]
files:
  - src/constants/homeNavbarChrome.ts
  - src/constants/homeNavbarChrome.opacityShell.test.ts
  - src/components/layout/Navbar.tsx
  - src/components/layout/SeasonNavDock.tsx
effort: S
tags: [X1, C7]
related: []
---

# Dual opacity control

## Симптом

Scroll-linked `style.opacity` + `transition-opacity duration-home-navbar-chrome` давали отставание при Lenis-scroll.

## Решение (2026-05-27)

- `homeNavbarChromeOpacityShellClass()` в `homeNavbarChrome.ts`: без `transition-opacity` для scroll-linked opacity; `duration-0` при `disableTopChromeTransition` (reduced motion).
- `Navbar.tsx`, `SeasonNavDock.tsx` — используют helper вместо `transition-opacity duration-home-navbar-chrome`.
- Токен `duration-home-navbar-chrome` в теме сохранён (документация / возможный reuse); `HomeHeroContactRail` по-прежнему с собственным `duration-home-hero-contact-rail`.

## История

| дата | действие |
|------|----------|
| 2026-05-27 | confirmed |
| 2026-05-27 | fix; tests ✅ |
