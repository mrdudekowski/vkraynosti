---
id: TW-2026-013
title: data-season на html — scrollbar и btn-primary vars
category: season-theme
severity: info
status: confirmed
confidence: high
created: 2026-05-27
updated: 2026-05-27
modules: [M2, M18]
files:
  - src/index.css
effort: —
tags: [X8, hypothesis-9]
related: []
---

# Season theme wiring OK (static)

`index.css`: `html[data-season='winter'|'spring'|...]` задаёт CSS variables для scrollbar thumb и `--btn-primary-bg`.

Потребитель: `useSeason` / layout (не аудировался runtime в браузере). **C9 critical** не выявлен по коду.

## История

| дата | действие |
|------|----------|
| 2026-05-27 | confirmed (index.css + grep consumers) |
