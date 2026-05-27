---
id: OPT-2026-015
title: Новые contact SVG в public/ не в git
category: media-assets
severity: low
status: fixed
confidence: high
created: 2026-05-27
updated: 2026-05-27
files:
  - public/telegram-logo.svg
  - public/phone-alt-logo.svg
  - public/whatsapp-brands-solid-full.svg
  - public/max-messenger-sign-logo.svg
  - src/constants/images.ts
  - scripts/contactMessengerLogos.test.ts
effort: S
tags: [public, contacts]
related: []
---

# Новые contact SVG в public/ не в git

## Утверждение

В git status есть неотслеживаемые `public/telegram-logo.svg`, `public/phone-alt-logo.svg` (и правки `max-messenger-sign-logo.svg`) — возможный рассинхрон с `images.ts` / `ContactMessengerLogo`.

## Доказательства

Git status (сессия 2026-05-27): `?? public/telegram-logo.svg`, `?? public/phone-alt-logo.svg`.

## Чеклист проверки

- [x] Пути в `src/constants/images.ts` (`PHONE_ALT_LOGO`, `TELEGRAM_LOGO`, `WHATSAPP_LOGO`, `MAX_MESSENGER_SIGN_LOGO`, `CONTACT_MESSENGER_LOGO_URLS`)
- [x] Файлы на диске в `public/` — `scripts/contactMessengerLogos.test.ts`
- [x] `ContactMessengerLogo` → единый SSOT; дублей путей в секциях нет
- [ ] `git add public/*.svg` перед deploy (файлы были untracked в сессии аудита)

## История

| дата | действие |
|------|----------|
| 2026-05-27 | создано, status: hypothesis |
| 2026-05-27 | fixed — SSOT + existence test; коммит SVG — на владельца репо |
