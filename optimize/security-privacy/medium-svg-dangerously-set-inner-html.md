---
id: OPT-2026-010
title: SafetyStatusSeasonIcon — dangerouslySetInnerHTML
category: security-privacy
severity: medium
status: fixed
confidence: medium
created: 2026-05-27
updated: 2026-05-27
files:
  - src/components/home/SafetyStatusSeasonIcon.tsx
  - src/utils/transformSafetyStatusIconSvg.ts
  - src/utils/fetchSafetyStatusIconSvg.ts
  - src/utils/sanitizeSafetyStatusIconSvg.ts
  - src/utils/sanitizeSafetyStatusIconSvg.test.ts
effort: M
tags: [xss, svg]
related: []
---

# SafetyStatusSeasonIcon — dangerouslySetInnerHTML

## Утверждение

SVG статуса безопасности вставлялся через `dangerouslySetInnerHTML` после `fetch` + строковых `replace` без HTML-санитайзера.

## Доказательства (до fix)

### 1. Код

`transformSafetyStatusIconSvg` — regex-замены fill, вставка `<defs>` с `gradientId` из `useId()`.

### 2. Trust boundary

`src` приходит из данных безопасности (`safetyData` / `images.ts`) — при подмене URL риск XSS.

## Решение (2026-05-27)

- **`fetchSafetyStatusIconSvg`** — allowlist только `HOME_SAFETY_STATUS_ICONS`; иные URL → reject.
- **`transformSafetyStatusIconSvg`** — `gradientId` валидируется regex (`^[a-zA-Z][\w-]*$`).
- **`parseSanitizedSafetyStatusIconSvg`** — DOMParser + whitelist тегов/атрибутов; отбрасываются `script`, event-handlers и пр.
- **`SafetyStatusSeasonIcon`** — `useRef` + `appendChild(sanitized <svg>)`, без `dangerouslySetInnerHTML`.
- Тесты: `sanitizeSafetyStatusIconSvg.test.ts`, `transformSafetyStatusIconSvg.test.ts`.

## Влияние

- **Безопасность:** снижен XSS-surface при fetch SVG.
- **a11y:** без изменений (`aria-hidden`).

## Рекомендации

- [x] Рендер через DOMParser с whitelist + appendChild.
- [ ] (опционально) импорт SVG как React-компонентов build-time — не требуется при текущем allowlist.

## История

| дата | действие |
|------|----------|
| 2026-05-27 | создано, status: confirmed |
| 2026-05-27 | fix: sanitize + allowlist fetch; status: fixed; `npm test` / `build` ✅ |
