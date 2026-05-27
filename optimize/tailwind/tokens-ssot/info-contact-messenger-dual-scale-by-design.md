---
id: TW-2026-010
title: Rail vs #contact messenger — разные size tokens (×1.3), общий CSS
category: tokens-ssot
severity: info
status: confirmed
confidence: high
created: 2026-05-27
updated: 2026-05-27
modules: [M6, M13, M20]
files:
  - src/constants/homeContactMessenger.ts
  - src/constants/homeContactSection.ts
  - src/index.css
effort: —
tags: [hypothesis-3]
related: []
---

# Messenger dual scale — intentional

Гипотеза **drift** опровергена: секция использует `HOME_CONTACT_SECTION_MESSENGER_SIZE_SCALE = 1.3` и отдельные `h-home-contact-section-*` токены; общие `.home-contact-messenger-btn` в `index.css`.

## История

| дата | действие |
|------|----------|
| 2026-05-27 | confirmed by design (constants comments) |
