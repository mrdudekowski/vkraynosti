---
id: OPT-2026-001
title: Заявка на тур — успех в UI без проверки ответа (no-cors)
category: security-privacy
severity: critical
status: fixed
confidence: high
created: 2026-05-27
updated: 2026-05-27
files:
  - src/services/sendTourRequestLead.ts
  - src/components/modals/TourRequestModal.tsx
effort: M
tags: [leads, forms, pii]
related: []
---

# Заявка на тур — успех в UI без проверки ответа (no-cors)

## Утверждение

Отправка лида через `sendTourRequestLead` не может надёжно определить успех на стороне Google Apps Script: `sendBeacon` и `fetch` с `mode: 'no-cors'` завершаются без ошибки при многих сбоях бэкенда, а модалка показывает успех после `await`.

## Доказательства

### 1. Статический след

```text
grep sendTourRequestLead / TourRequestModal — единственный prod-путь отправки
```

**Результат:** `TourRequestModal` вызывает `sendTourRequestLead`; обработка ошибок только в `catch`, сетевой «успех» opaque-ответа в `catch` не попадает.

### 2. Пример в коде

```52:66:src/services/sendTourRequestLead.ts
  if (navigator.sendBeacon) {
    const queued = navigator.sendBeacon(tourRequestEndpointUrl, new Blob([body], { type: 'text/plain;charset=utf-8' }));
    if (queued) return;
  }

  await fetch(tourRequestEndpointUrl, {
    method: 'POST',
    mode: 'no-cors',
    redirect: 'manual',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body,
    keepalive: true,
  });
```

```91:107:src/components/modals/TourRequestModal.tsx
    try {
      await Promise.all([
        sendTourRequestLead(payload, parsed.data),
        new Promise<void>(resolve => {
          window.setTimeout(resolve, SUBMIT_DELAY_MS);
        }),
      ]);
    } catch (err) {
      // ...
      setSubmitError(UI.tourRequestModal.submitError);
```

### 3. Runtime / build

- `npm run build`: **pass** (2026-05-27, `optimize/_runs/2026-05-27-build.log`)
- Сценарий: заполнить форму заявки при неверном/недоступном endpoint → UI может показать success.

## Влияние

- **Пользователь:** думает, что заявка принята, хотя лид не дошёл.
- **Разработка:** ложные негативы в поддержке; сложная отладка prod.
- **Риск регрессии при fix:** нужен контракт с бэкендом (CORS/proxy), изменение UX ожидания задержки.

## Корневая причина (гипотеза)

Обход CORS для Google Apps Script через `no-cors` + оптимистичный UX с искусственной задержкой `SUBMIT_DELAY_MS`.

## Рекомендации

### Минимальный fix (безопасный)

- [ ] Прокси на том же origin (serverless / static host rewrite) с обычным `fetch` и проверкой `response.ok`.
- [ ] До появления прокси — не показывать success без подтверждённого канала (или явный дисклеймер + дубль на `mailto`/мессенджер).

### Идеальный fix (если отличается)

- [ ] Серверная валидация + idempotency + мониторинг доставки; убрать PII из `console.error` в DEV при логировании ошибок формы.

## Альтернативы (brainstorm)

- Форма только `mailto:` / WhatsApp deep link без HTTP.
- Очередь в `localStorage` + retry при следующем визите (сложнее).

## Чеклист проверки (если status: hypothesis)

- [x] Прочитан код сервиса и модалки
- [ ] Ручной тест с намеренно битым URL endpoint в preview

## Вопросы к команде

Можно ли включить CORS на стороне GAS или обязателен serverless-прокси на GitHub Pages?

## История

| дата | действие |
|------|----------|
| 2026-05-27 | создано, status: confirmed |
| 2026-05-27 | fix: убраны `sendBeacon` и `no-cors`, проверка `response.ok`, `TourRequestLeadError` |
