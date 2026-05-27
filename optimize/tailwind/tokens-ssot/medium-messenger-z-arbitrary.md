---
id: TW-2026-002
title: z-[1] в icon-well messenger вместо z-stack-base
category: tokens-ssot
severity: medium
status: fixed
confidence: high
created: 2026-05-27
updated: 2026-05-27
modules: [M6, M13, M20]
viewport: [390, 768, 1200]
files:
  - src/constants/homeContactMessenger.ts
  - src/constants/homeContactSection.ts
effort: S
tags: [z-index, C4]
related: []
---

# z-[1] в messenger icon-well

## Симптом

Дублирование stacking: в theme есть `z-stack-base: 1`, в константах — arbitrary `z-[1]`.

## Доказательства

```13:14:src/constants/homeContactMessenger.ts
export const HOME_CONTACT_MESSENGER_ICON_WELL_CLASS =
  'home-contact-messenger-icon-well relative z-[1] flex h-home-hero-contact-rail-icon ...
```

```29:30:src/constants/homeContactSection.ts
export const HOME_CONTACT_SECTION_ICON_WELL_CLASS =
  'home-contact-messenger-icon-well relative z-[1] flex h-home-contact-section-icon ...
```

`tailwind.config.ts` → `zIndex['stack-base'] = '1'`.

## Fix direction

- **Минимальный:** заменить `z-[1]` → `z-stack-base` в обоих файлах.
- **Канонический:** задокументировать в `homeContactMessenger.ts` комментарием «well under icon z-10».

## История

| дата | действие |
|------|----------|
| 2026-05-27 | confirmed (rg + theme zIndex) |
| 2026-05-27 | fix: `z-[1]` → `z-stack-base` в `homeContactMessenger.ts`, `homeContactSection.ts`; build/test ✅ |
