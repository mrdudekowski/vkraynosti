---
id: OPT-2026-007
title: Grid webm превышают media:budget (до ~10 MiB)
category: performance-bundle
severity: medium
status: confirmed
confidence: high
created: 2026-05-27
updated: 2026-05-27
files:
  - public/tours/
  - scripts/check-public-media-budget.mjs
effort: L
tags: [media, lcp, bandwidth]
related: []
---

# Grid webm превышают media:budget (до ~10 MiB)

## Утверждение

Десятки файлов `*.grid.webm` в `public/tours/` превышают пороги скрипта `media:budget` (предупреждения до ~9.92 MiB на файл).

## Доказательства

### 1. Статический след

```bash
npm run media:budget
# Checked 671 public tour media files
# Budget warnings: fall-3/pd.clip4.grid.webm 9.92 MiB, ...
```

### 2. Пример

Топ из вывода команды (2026-05-27):

- `public/tours/fall-3/pd.clip4.grid.webm` — 9.92 MiB  
- `public/tours/spring-3/pd.clip4.grid.webm` — 9.92 MiB  

### 3. Runtime

Пользователи на медленных сетях загружают тяжёлые клипы при открытии галереи/сетки тура.

## Влияние

- **Пользователь:** долгая загрузка, расход трафика.
- **Разработка:** предупреждения при каждом `media:budget`.

## Рекомендации

- [ ] Перекодировать топ-20 через существующие `scripts/` (ffmpeg-static).
- [ ] Проверить lazy + poster-only до interaction.

## История

| дата | действие |
|------|----------|
| 2026-05-27 | создано, status: confirmed |
