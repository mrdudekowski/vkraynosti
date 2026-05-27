# Индекс находок (optimize)

> Сессия: **2026-05-27** (полный проход по `docs/CODEBASE_CLEANUP_MASTER_AGENT_PROMPT.md`)  
> Следующий свободный id: **OPT-2026-016**


| id           | title                                                  | category           | severity | status     | effort | file                                                                                                        |
| ------------ | ------------------------------------------------------ | ------------------ | -------- | ---------- | ------ | ----------------------------------------------------------------------------------------------------------- |
| OPT-2026-001 | Заявка на тур — успех UI без проверки ответа (no-cors) | security-privacy   | critical | fixed      | M      | [critical-tour-lead-no-cors-false-success.md](security-privacy/critical-tour-lead-no-cors-false-success.md) |
| OPT-2026-002 | Клики по карточкам туров — открытый debug              | broken-runtime     | high     | wont-fix   | M      | [high-tour-card-clicks-investigation.md](broken-runtime/high-tour-card-clicks-investigation.md)             |
| OPT-2026-003 | ESLint падает на Navbar.tsx                            | tests-and-quality  | high     | fixed      | S      | [high-eslint-navbar-jsx-parse-error.md](tests-and-quality/high-eslint-navbar-jsx-parse-error.md)            |
| OPT-2026-004 | remapTourMediaUrls не импортируется                    | dead-code          | medium   | fixed      | S      | [medium-remap-tour-media-urls-unused.md](dead-code/medium-remap-tour-media-urls-unused.md)                  |
| OPT-2026-005 | Deprecated-алиасы без потребителей                     | dead-code          | low      | fixed      | S      | [low-deprecated-export-aliases.md](dead-code/low-deprecated-export-aliases.md)                              |
| OPT-2026-006 | SeasonRouteSync — хардкод /tours/:season               | ssot-duplication   | medium   | fixed      | S      | [medium-season-route-sync-hardcoded-path.md](ssot-duplication/medium-season-route-sync-hardcoded-path.md)   |
| OPT-2026-007 | Grid webm over media:budget                            | performance-bundle | medium   | confirmed  | L      | [medium-grid-videos-over-media-budget.md](performance-bundle/medium-grid-videos-over-media-budget.md)       |
| OPT-2026-008 | Крупный entry chunk index ~338 kB                      | performance-bundle | medium   | fixed      | L      | [medium-main-bundle-338kb.md](performance-bundle/medium-main-bundle-338kb.md)                               |
| OPT-2026-009 | Tailwind min/max + object screens warn                 | design-system      | low      | fixed      | M      | [low-tailwind-min-max-screens-warning.md](design-system/low-tailwind-min-max-screens-warning.md)            |
| OPT-2026-010 | SafetyStatus SVG innerHTML                             | security-privacy   | medium   | fixed      | M      | [medium-svg-dangerously-set-inner-html.md](security-privacy/medium-svg-dangerously-set-inner-html.md)       |
| OPT-2026-011 | npm audit exceljs → uuid                               | dependencies       | medium   | fixed      | S      | [medium-exceljs-uuid-npm-audit.md](dependencies/medium-exceljs-uuid-npm-audit.md)                           |
| OPT-2026-012 | Нет e2e home → tour detail                             | tests-and-quality  | low      | fixed      | S      | [low-no-e2e-tour-navigation.md](tests-and-quality/low-no-e2e-tour-navigation.md)                            |
| OPT-2026-013 | Два контекста меню (season/mobile)                     | architecture       | info     | confirmed  | S      | [info-dual-nav-menu-providers.md](architecture/info-dual-nav-menu-providers.md)                             |
| OPT-2026-014 | Agent prompts в docs вне git                           | documentation-dx   | low      | confirmed  | S      | [low-untracked-agent-prompts-in-docs.md](documentation-dx/low-untracked-agent-prompts-in-docs.md)           |
| OPT-2026-015 | Contact SVG в public не в git                          | media-assets       | low      | fixed      | S      | [low-untracked-contact-logos-public.md](media-assets/low-untracked-contact-logos-public.md)                 |
| OPT-2026-Q01 | Воспроизводится ли баг кликов туров?                   | questions          | —        | resolved   | —      | [blocked-tour-clicks-repro-2026-05-27.md](questions/blocked-tour-clicks-repro-2026-05-27.md)                |


## Статистика


| severity | count |
| -------- | ----- |
| critical | 0     |
| high     | 0     |
| medium   | 1     |
| low      | 0     |
| info     | 1     |


## По категориям


| category           | count |
| ------------------ | ----- |
| architecture       | 1     |
| dead-code          | 2     |
| ssot-duplication   | 1     |
| legacy-patterns    | 0     |
| broken-runtime     | 1     |
| dependencies       | 1     |
| tests-and-quality  | 2     |
| performance-bundle | 2     |
| security-privacy   | 2     |
| design-system      | 1     |
| media-assets       | 1     |
| documentation-dx   | 1     |
| questions          | 1     |


## Tailwind / Design System (2026-05-27)

Отдельный проход: [`tailwind/INDEX.md`](tailwind/INDEX.md) · [`tailwind/SUMMARY.md`](tailwind/SUMMARY.md)

| id | title | severity | status | file |
|----|-------|----------|--------|------|
| TW-2026-001 | Safelist bloat ~200+ | high | fixed | [tailwind/purge-safelist/high-safelist-bloat-maintenance.md](tailwind/purge-safelist/high-safelist-bloat-maintenance.md) |
| TW-2026-002 | Messenger `z-[1]` → token | medium | fixed | [tailwind/tokens-ssot/medium-messenger-z-arbitrary.md](tailwind/tokens-ssot/medium-messenger-z-arbitrary.md) |
| TW-2026-003 | TourDetailHero z-20/z-30 | medium | fixed | [tailwind/tokens-ssot/medium-tour-detail-hero-z-arbitrary.md](tailwind/tokens-ssot/medium-tour-detail-hero-z-arbitrary.md) |
| TW-2026-005 | breakpoints.test ↔ screens gap | medium | fixed | [tailwind/breakpoints-responsive/medium-breakpoint-test-gap-tailwind-sync.md](tailwind/breakpoints-responsive/medium-breakpoint-test-gap-tailwind-sync.md) |
| TW-2026-006 | Breakpoint intent zones (500–949) | medium | wont-fix | [tailwind/breakpoints-responsive/medium-intentional-breakpoint-zones.md](tailwind/breakpoints-responsive/medium-intentional-breakpoint-zones.md) |

**Critical (TW):** 0 · **High (TW):** 0 open

---

## Baseline (_runs/)


| Команда                | Результат                 | Лог                                                      |
| ---------------------- | ------------------------- | -------------------------------------------------------- |
| `npm run build`        | pass (~6.3s)              | [_runs/2026-05-27-build.log](_runs/2026-05-27-build.log) |
| `npm test`             | pass 68 files / 264 tests | [_runs/2026-05-27-test.log](_runs/2026-05-27-test.log)   |
| `npm run lint`         | **fail** (Navbar parse)   | [_runs/2026-05-27-lint.log](_runs/2026-05-27-lint.log)   |
| `npm run media:budget` | warnings (heavy webm)     | stdout в сессии                                          |


