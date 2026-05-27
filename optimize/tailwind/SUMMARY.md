# Tailwind / Design System — Summary

**Дата:** 2026-05-27  
**Baseline:** build ✅ (~7s) · tests ✅ 285 · CSS bundle **127.93 kB** (gzip 20.42 kB)  
**Режим:** audit-only → [`optimize/tailwind/`](.)

Полный индекс: [`INDEX.md`](INDEX.md) · Модули M1–M20: [`_module-notes/M1-M20.md`](_module-notes/M1-M20.md)

---

## Critical (C1–C10)

**Нет `confirmed` critical** в этой сессии.

| Критерий | Результат |
|----------|-----------|
| C1 Z-index / clicks blocked | Стек home/nav/modal согласован в коде; rail 99 &lt; navbar 100 &lt; modal 200; mobileNav 95 под navbar — **by design**. Без browser MCP — нет repro кликов. |
| C2 Purge | **TW-2026-009:** ключевые `@apply` классы **в dist CSS** |
| C3 Breakpoint drift JS vs TW | Кастомные px в `breakpoints.ts` → config; **TW-2026-006/007** — осознанные зоны, не автоматический баг |
| C4 SSOT hex/arbitrary | **TW-2026-002, 003, 004** — точечный долг, не prod break |
| C5 Contrast | **TW-2026-014** fixed — WCAG AA test на `#contact` |
| C6 Overflow/Lenis | **TW-2026-012** svh fallback есть; double-scroll не найден статически |
| C7 Animation ms | Navbar chrome ms из constants; tour/safety — theme import pattern OK |
| C8 Safe-area | `pt-navbar-chrome`, `pt-safe-top` в safelist + dist |
| C9 Season theme | **TW-2026-013** `html[data-season]` в CSS + `SeasonContext` |
| C10 Dead breakpoint | `below-nav-desktop` используется в `index.css` @screen |

---

## Top findings (fix-first)

1. **TW-2026-001 (high)** — safelist ~200+ строк, дубли, сопровождение + размер CSS.
2. **TW-2026-005 (medium)** — тесты не ловят drift `screens` ↔ constants.
3. **TW-2026-002, TW-2026-003 (medium)** — arbitrary z → theme tokens.
4. **TW-Q01** — подтвердить намеренность зон 500–949 / 650–767.

---

## Z-index map (главная + chrome)

Фактические токены из `tailwind.config.ts` `theme.extend.zIndex`:

| Layer | Token | Value | Элемент / зона |
|-------|--------|-------|----------------|
| Sky / scroll content | (auto) | 0 | секции main |
| Team backdrop | `z-home-team-backdrop` | 5 | fixed штора `#team` |
| Bridge | `z-home-team-contact-bridge` | 6 | логотип team→contact |
| Stack base | `z-stack-base` | 1 | оверлеи внутри карусели/календаря |
| Hero section | `z-home-hero` | 12 | `#home-hero` isolate |
| Season banner | `z-home-season-banner` | 15 | баннер сезона |
| Gate scroll hint | `z-home-gate-scroll-hint` | 25 | стрелка к hero |
| Gate letterbox / glow / veil | 82–84 | ворота |
| Season dock | `z-season-dock` | 90 | полоса сезонов |
| Mobile nav | `z-mobileNav` | 95 | drawer + overlay (под navbar bar) |
| Hero contact rail | `z-home-hero-contact-rail` | 99 | fixed справа |
| Navbar | `z-navbar` | 100 | fixed top |
| Modal overlay | `z-overlay` | 199 | (если используется) |
| Modal | `z-modal` | 200 | заявка на тур |
| Season flash | `z-season-flash` | 300 | смена сезона |
| Dev debug only | `z-[9999]` | 9999 | `TeamBackdropDebugOverlay` DEV+localStorage |

**X4 team→bridge:** backdrop fade (opacity JS) + bridge `z-6` + navbar hide via `homeNavbarBridgeChrome` (opacity/pointer-events) — см. `Navbar.tsx` `computeHomeNavbarEffectiveTopChromeOpacity`.

**X6 burger:** overlay/drawer `z-mobileNav` 95; navbar shell `z-navbar` 100 — шапка остаётся над панелью; overlay `top-16` при `mainUsesNavbarTopPadding`.

---

## Safelist / purge health

| Метрика | Значение |
|---------|----------|
| Safelist literals (approx.) | ~200+ в `tailwind.config.ts` |
| Дубли найдены | `bg-home-gate-return-veil` ×2 |
| Purge spot-check | ✅ messenger, navbar chrome, rail z |
| CSS output | 127.93 kB |

---

## Breakpoint drift matrix

| px range | Tailwind / JS | Эффект |
|----------|---------------|--------|
| &lt;500 | — | SeasonSwitcher в navbar скрыт (`hidden season-md:block`) |
| 500–949 | `season-md` + burger | Switcher в navbar, без desktop links |
| 576–649 | `sm` vs `team-hero-below` | sm utilities vs mobile team до 650 |
| 640+ | `mobile-nav-drawer-compact` | ширина drawer |
| 650+ | `team-hero-desktop` | desktop team grid |
| 650–767 | gap | team desktop, gate still `hidden md:block` (**TW-2026-007**) |
| 768+ | `md` | desktop gate DOM, tablet home logic (`BREAKPOINT_MD_PX` JS) |
| 950+ | `nav-desktop` | полный navbar, без burger |
| 620+ | `tour-cover-wide` | spring 3/6 cover crop |

Стандартные tiers **sm/md/lg/xl/2xl** импортируются из `breakpoints.ts` в config ✅.

---

## Сценарии X1–X10 (статический trace)

| ID | Статус | Заметка |
|----|--------|---------|
| X1 Gate→hero | OK | navbar opacity + gate veil tokens |
| X2 Hero→tours | OK | rail hide hook `useHomeHeroContactRailMotion` @ md |
| X3 Tours→safety→team | OK | backdrop progress `teamZoneScroll` |
| X4 Team→bridge | OK | z-5/6/10 stack; navbar bridge chrome |
| X5 Bridge→contact | OK | TW-2026-014 contrast test |
| X6 Burger | OK | z-95/100, body overflow lock in Navbar |
| X7 Tour modal | OK | z-modal 200 |
| X8 Season switch | OK | TW-2026-013 |
| X9 reduced-motion | OK | index.css + motion-safe: utilities |
| X10 basename / safe-area | OK | pt-safe-top in theme; GHP basename не ломает CSS |

---

## Стартовые гипотезы (10) — итог

| # | Гипотеза | Вердикт |
|---|----------|---------|
| 1 | z-9999 debug | **DEV-only** TW-2026-008 |
| 2 | z-[1] wells | **confirmed** TW-2026-002 |
| 3 | rail vs contact drift | **by design** TW-2026-010 |
| 4 | dead safelist | **partial** TW-2026-001 (не полный аудит) |
| 5 | @apply fonts safelist | **OK** в dist |
| 6 | nav-desktop vs md | **intentional zone** TW-2026-006 |
| 7 | team 650 vs sm 576 | **documented zone** TW-2026-006 |
| 8 | scroll opacity desync | **medium** TW-2026-011, no repro |
| 9 | messenger glow hit-area | **not critical**; pointer-events on pseudo |
| 10 | min-h-app-viewport | **OK** TW-2026-012 svh fallback |

---

## Roadmap (после утверждения)

| Фаза | Действие |
|------|----------|
| 1 | TW-Q01 → wont-fix или align breakpoints |
| 2 | TW-2026-002, 003, 004 — tokenize z/sizes |
| 3 | TW-2026-001 — safelist audit script + dedupe |
| 4 | TW-2026-005 — screen sync test |
| 5 | Visual (опц.): TW-2026-011 e2e scroll opacity |
