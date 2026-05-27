---
id: OPT-2026-004
title: remapTourMediaUrls / remapPosterMap не импортируются
category: dead-code
severity: medium
status: fixed
confidence: high
created: 2026-05-27
updated: 2026-05-27
files:
  - src/utils/remapTourMediaUrls.ts
effort: S
tags: [utils, fall-tours]
related: []
---

# remapTourMediaUrls / remapPosterMap не импортируются

## Утверждение

Модуль `src/utils/remapTourMediaUrls.ts` экспортирует две функции, но ни одна не используется в `src/`, тестах или `scripts/` (кроме самого файла).

## Доказательства

### 1. Статический след

Поиск по репозиторию (`remapTourMediaUrls`, `remapPosterMap`): совпадения **только** в `src/utils/remapTourMediaUrls.ts`.

Контрпример: динамический import — не найден.

### 2. Пример в коде

```1:24:src/utils/remapTourMediaUrls.ts
/** Подмена базового пути тура в URL медиа (`/tours/spring-10/…` → `/tours/fall-10/…`). */
export function remapTourMediaUrls(
  urls: readonly string[],
  fromTourId: string,
  toTourId: string
): string[] {
  // ...
}

export function remapPosterMap(
  posters: Record<string, string>,
  fromTourId: string,
  toTourId: string
): Record<string, string> {
  // ...
}
```

### 3. Runtime / build

- Функции не попадают в отдельный chunk как entry — tree-shaking может исключить, но файл остаётся в репо.

## Влияние

- **Пользователь:** нет.
- **Разработка:** шум при поиске; риск рассинхрона с `createFallTourFromSpring` pipeline.
- **Риск регрессии при fix:** низкий при удалении; проверить будущие скрипты генерации fall.

## Рекомендации

### Минимальный fix

- [ ] Удалить файл или перенести в `scripts/` если нужен только для генерации.

### Идеальный fix

- [ ] Использовать в одном месте SSOT при клонировании spring→fall медиа (если задумывалось).

## История

| дата | действие |
|------|----------|
| 2026-05-27 | создано, status: confirmed |
| 2026-05-27 | удалён `src/utils/remapTourMediaUrls.ts`, status: fixed |
