# Summary — аудит кодовой базы Vkraynosti

**Дата сессии:** 2026-05-27  
**Режим:** аудит + `optimize/` только (без правок `src/`)  
**Baseline:** `npm run build` ✅ | `npm test` ✅ (264) | `npm run lint` ✅ (после fix 003)

Полный регистр: [`INDEX.md`](INDEX.md).

---

## Executive summary

Репозиторий **собирается и unit-тесты зелёные**; продуктовый стек (React 19, Vite 7, Router 7, SSOT в `data/` / `constants/`) выглядит зрелым. Главные риски сессии — **бизнес-критичный поток заявок** (лиды считаются успешными без проверки ответа сервера из‑за `no-cors` / `sendBeacon`) и **качество конвейера** (`eslint` падает на `Navbar.tsx`). Производительность: тяжёлые `grid.webm` в `public/tours/` и крупный entry chunk на главной. Мёртвый код точечный (`remapTourMediaUrls`, deprecated-алиасы). Баг «клики по турам» задокументирован отдельным промптом, но **не подтверждён** в этой сессии без браузера — см. [`questions/blocked-tour-clicks-repro-2026-05-27.md`](questions/blocked-tour-clicks-repro-2026-05-27.md).

---

## Critical (немедленное внимание)

_Нет открытых critical._ OPT-2026-001 **исправлен** (2026-05-27): `sendTourRequestLead` без `no-cors`/`sendBeacon`, проверка `response.ok`.

---

## High (следом)

_Нет открытых high._ OPT-2026-003 **исправлен**: `NavbarMobileMenuPortal`, выровненная JSX-вложенность, `npm run lint` ✅.

**Закрыто:** OPT-2026-002 (клики туров) — не воспроизводится, `wont-fix`.

---

## Top quick wins (effort S, высокий эффект)

1. **OPT-2026-003** — починить парность JSX / вынести mobile menu → снова зелёный lint.
2. **OPT-2026-004** — удалить неиспользуемый `remapTourMediaUrls.ts`.
3. **OPT-2026-005** — убрать deprecated-алиасы констант.
4. **OPT-2026-006** — вынести `ROUTES.SEASON_LIST` для `SeasonRouteSync`.
5. **OPT-2026-012** — один Playwright-тест home → tour detail.

---

## Strategic debt (effort L/XL)

| Тема | Карточки |
|------|----------|
| Лиды / приватность | OPT-2026-001 |
| Медиа-вес prod | OPT-2026-007 |
| Bundle главной | OPT-2026-008 |
| Tailwind screens | OPT-2026-009 |
| SVG XSS surface | OPT-2026-010 ✅ fixed |

---

## Roadmap (предложение)

| Фаза | Фокус | Карточки |
|------|--------|----------|
| **1 — Prod trust** | Заявки, lint, repro туров | 001, 003, 002, Q01 |
| **2 — SSOT & hygiene** | Маршруты, мёртвый код, e2e | 004–006, 005, 012 |
| **3 — Perf & hardening** | Медиа, bundle, Tailwind, SVG | 007–011 |

---

## Карта репозитория (фаза 1)

| Слой | Канон |
|------|--------|
| Entry | `src/main.tsx` → `router.tsx`, `basename: import.meta.env.BASE_URL` |
| Routes | `src/constants/routes.ts` |
| Pages | `src/pages/` (+ lazy seasons, tour, legal) |
| UI | `src/components/` по доменам |
| Data | `src/data/toursData.ts`, generated media maps |
| Services | `sendTourRequestLead`, `fetchTourSchedule` |
| Стили | `tailwind.config.ts`, `src/index.css` |
| Медиа | `public/tours/`, скрипты `media:*`, `generate:*` |

**Подозрительные зоны:** `Home.tsx` (gate + overlays), `Navbar.tsx` (portal + chrome opacity), `TeamViewportBackdrop`, тяжёлые `public/tours/**/*.webm`.

---

## Открытые вопросы

- [`questions/blocked-tour-clicks-repro-2026-05-27.md`](questions/blocked-tour-clicks-repro-2026-05-27.md) — актуален ли баг кликов?
- OPT-2026-001 — допустим ли serverless-прокси для GAS на GitHub Pages?

---

## Анти-ложные срабатывания (учтено)

- `teamBackdropDebug` — **не** мёртвый код; URL/localStorage флаги для dev overlay.
- `exceljs` / `ffmpeg-static` — **tooling-only**, не в client bundle.
- `fetchTourSchedule` без `VITE_TOUR_SCHEDULE_ENDPOINT_URL` — fallback на `public/data/tour-schedule.json` (by design).
