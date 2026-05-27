---
id: TW-Q01
created: 2026-05-27
status: resolved
---

# Намеренные «зоны» между breakpoint tiers?

Аудит выявил **осознанные** расхождения (не баги без visual repro):

| Viewport (px) | Поведение A | Поведение B |
|---------------|-------------|-------------|
| **500–949** | `season-md:` — `SeasonSwitcher` в navbar | `nav-desktop:` — ссылки/CTA скрыты, бургер виден |
| **640–649** | `mobile-nav-drawer-compact:` — узкий drawer | `team-hero-below-desktop:` — mobile team layout |
| **650–767** | `team-hero-desktop:` — desktop team grid | `md:` (768) — desktop gate `HOME_GATE_DESKTOP_ROOT_CLASS` |
| **768–949** | `md:` — tablet/desktop gate, rail logic | `nav-desktop:` (950) — полный desktop navbar |

**Вопрос:** подтвердите, что промежутки **задуманы** (tablet UX), а не требуют выравнивания к одному tier.

**Ответ (2026-05-27):** да, задуманный tablet UX. TW-2026-006, TW-2026-007 → `wont-fix`.
