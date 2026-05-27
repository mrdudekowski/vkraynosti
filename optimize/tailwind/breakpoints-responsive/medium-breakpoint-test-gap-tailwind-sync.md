---
id: TW-2026-005
title: breakpoints.test.ts не сверяет screens в tailwind.config
category: breakpoints-responsive
severity: medium
status: fixed
confidence: high
created: 2026-05-27
updated: 2026-05-27
modules: [M3]
viewport: []
files:
  - src/constants/breakpoints.test.ts
  - tailwind.config.ts
effort: S
tags: [SSOT, C3]
related: [TW-2026-006]
---

# Breakpoint test gap

## Симптом

Drift между `breakpoints.ts` и `screens` возможен при правке только одного файла — тесты не поймают.

## Доказательства

`breakpoints.test.ts` проверяет только три константы (650, 640, 950), **не** импортирует `tailwind.config` и не сравнивает `sm`/`md`/`tour-cover-wide`.

`tailwind.config.ts` импортирует `BREAKPOINT_*_PX` из `breakpoints.ts` для стандартных tiers — **ручная** синхронизация кастомных screens (`season-md: 500px`, `xs: 360px`) остаётся без теста.

## Fix direction

- **Минимальный:** тест, читающий `screens` из compiled config или snapshot строк `nav-desktop`/`team-hero-desktop` px.
- **Канонический:** экспорт `TAILWIND_SCREENS_PX` из одного модуля, потребляемого config и тестами.

## История

| дата | действие |
|------|----------|
| 2026-05-27 | confirmed (read test + config imports) |
| 2026-05-27 | fix: `TAILWIND_SCREEN_*_WIDTH_PX` + sync test vs `tailwind.config`; build/test ✅ |
