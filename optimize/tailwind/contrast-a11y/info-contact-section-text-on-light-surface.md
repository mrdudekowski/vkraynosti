---
id: TW-2026-014
title: #contact — text-primary на bg-home-contact-section (#f3eee8)
category: contrast-a11y
severity: info
status: fixed
confidence: high
created: 2026-05-27
updated: 2026-05-27
modules: [M13]
viewport: [390, 768]
files:
  - src/constants/homeContactSection.ts
  - src/constants/homeContactSection.contrast.test.ts
effort: S
tags: [X5, C5]
related: []
---

# Contact contrast — verified (WCAG AA)

## Код

`HOME_CONTACT_SECTION_CLASS`: `bg-home-contact-section text-text-primary`  
`HOME_CONTACT_SECTION_BG_HEX = '#f3eee8'`  
`HOME_CONTACT_SECTION_SUBTITLE_CLASS`: `text-text-primary/85`  
`THEME_TEXT_PRIMARY_HEX = '#1A1A1A'`

Messenger hover — тёмная «чаша» на светлом фоне (`index.css`); контраст текста секции не меняется.

## Верификация

`src/constants/homeContactSection.contrast.test.ts` — `contrastRatio()` из `colorContrast.ts`:

| Пара | Порог | Результат |
|------|-------|-----------|
| `#1A1A1A` на `#f3eee8` (title) | AA normal ≥ 4.5, large ≥ 3 | ✅ |
| subtitle `/85` (blend на фоне) | AA normal ≥ 4.5 | ✅ |

Цвета менять не требуется.

## Статус

**fixed** — программная проверка WCAG 2.1 AA; визуальный X5 опционален.

## История

| дата | действие |
|------|----------|
| 2026-05-27 | hypothesis (code only) |
| 2026-05-27 | fixed — contrast test, цвета без изменений |
