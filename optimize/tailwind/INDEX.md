# Tailwind audit index (TW-2026-*)

> Сессия: **2026-05-27** · Промпт: `docs/TAILWIND_EXPERT_DEEP_AUDIT_AGENT_PROMPT.md`  
> Следующий id: **TW-2026-015**

| id | title | category | severity | status | effort | file |
|----|-------|----------|----------|--------|--------|------|
| TW-2026-001 | Safelist bloat ~200+ | purge-safelist | high | fixed | L | [high-safelist-bloat-maintenance.md](purge-safelist/high-safelist-bloat-maintenance.md) |
| TW-2026-002 | Messenger z-[1] vs z-stack-base | tokens-ssot | medium | fixed | S | [medium-messenger-z-arbitrary.md](tokens-ssot/medium-messenger-z-arbitrary.md) |
| TW-2026-003 | TourDetailHero z-20/z-30 | tokens-ssot | medium | fixed | S | [medium-tour-detail-hero-z-arbitrary.md](tokens-ssot/medium-tour-detail-hero-z-arbitrary.md) |
| TW-2026-004 | Calendar arbitrary sizing | tokens-ssot | low | fixed | S | [low-tour-calendar-arbitrary-sizing.md](tokens-ssot/low-tour-calendar-arbitrary-sizing.md) |
| TW-2026-005 | breakpoints.test gap | breakpoints-responsive | medium | fixed | S | [medium-breakpoint-test-gap-tailwind-sync.md](breakpoints-responsive/medium-breakpoint-test-gap-tailwind-sync.md) |
| TW-2026-006 | Breakpoint intent zones | breakpoints-responsive | medium | wont-fix | M | [medium-intentional-breakpoint-zones.md](breakpoints-responsive/medium-intentional-breakpoint-zones.md) |
| TW-2026-007 | Gate md vs team 650 | breakpoints-responsive | low | wont-fix | S | [low-gate-md-vs-team-650.md](breakpoints-responsive/low-gate-md-vs-team-650.md) |
| TW-2026-008 | Debug z-9999 DEV-only | z-index-stacking | info | confirmed | S | [info-debug-overlay-z9999-dev-only.md](z-index-stacking/info-debug-overlay-z9999-dev-only.md) |
| TW-2026-009 | Purge health OK | purge-safelist | info | confirmed | S | [medium-purge-safelist-health-ok.md](purge-safelist/medium-purge-safelist-health-ok.md) |
| TW-2026-010 | Messenger rail vs contact scale | tokens-ssot | info | confirmed | — | [info-contact-messenger-dual-scale-by-design.md](tokens-ssot/info-contact-messenger-dual-scale-by-design.md) |
| TW-2026-011 | Navbar dual opacity | animation-timing | medium | fixed | S | [medium-dual-opacity-navbar-dock.md](animation-timing/medium-dual-opacity-navbar-dock.md) |
| TW-2026-012 | svh + vh fallback | scroll-lenis-overflow | info | confirmed | — | [info-viewport-svh-fallback.md](scroll-lenis-overflow/info-viewport-svh-fallback.md) |
| TW-2026-013 | data-season CSS vars | season-theme | info | confirmed | — | [info-data-season-scrollbar-vars.md](season-theme/info-data-season-scrollbar-vars.md) |
| TW-2026-014 | #contact contrast | contrast-a11y | info | fixed | S | [info-contact-section-text-on-light-surface.md](contrast-a11y/info-contact-section-text-on-light-surface.md) |

## Questions

| id | topic | file |
|----|-------|------|
| TW-Q01 | Breakpoint zones intent | [breakpoint-intent-zones.md](questions/breakpoint-intent-zones.md) |

## Severity rollup

| severity | open |
|----------|------|
| critical | 0 |
| high | 0 |
| medium | 0 |
| low | 1 |
| info | 5 |
| hypothesis | 0 |
