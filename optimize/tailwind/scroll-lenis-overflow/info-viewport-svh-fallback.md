---
id: TW-2026-012
title: 100svh + @supports fallback 100vh — гипотеза 10 закрыта
category: scroll-lenis-overflow
severity: info
status: confirmed
confidence: high
created: 2026-05-27
updated: 2026-05-27
modules: [M2, M5]
files:
  - tailwind.config.ts
  - src/index.css
effort: —
tags: [hypothesis-10]
related: []
---

# min-h-app-viewport / svh

`theme.extend` → `app-viewport: 100svh`, `hero-viewport: 100svh`.  
`index.css` `@supports not (height: 100svh)` → fallback `100vh` для `.min-h-app-viewport`, `.h-hero-viewport`.

Критического C6 (double scroll) по коду не выявлено; Lenis + `pointer-events-none` на navbar при opacity≈0 документированы.

## История

| дата | действие |
|------|----------|
| 2026-05-27 | confirmed (config + index.css) |
