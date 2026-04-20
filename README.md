# Вкрайности (Vkraynosti)

Одностраничное приложение турагентства: React, TypeScript, Vite, Tailwind CSS. Продакшен: **GitHub Pages** с базовым путём приложения `/vkraynosti/`.

## Документация

| Документ | Назначение |
|----------|------------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Структура репозитория, слои, маршрутизация |
| [docs/PROJECT_CONTEXT.md](docs/PROJECT_CONTEXT.md) | Контекст продукта, зафиксированные решения, **инженерный TODO** по коду |
| [docs/PRODUCTION_READINESS.md](docs/PRODUCTION_READINESS.md) | Чек-лист до коммерческого продакшена |
| [docs/PERFORMANCE.md](docs/PERFORMANCE.md) | Метрики производительности, **профилирование в Chrome (Profiler / Performance)**, эталоны |
| [.cursor/rules/vkraynosti.mdc](.cursor/rules/vkraynosti.mdc) | Правила кода для агентов и разработчиков (SSOT по стилю и данным) |

## Требования

- Node.js **20** (как в CI, см. `.github/workflows/deploy.yml`)
- npm

## Команды

| Команда | Описание |
|---------|----------|
| `npm run dev` | Разработка (Vite HMR) |
| `npm run build` | `tsc -b` и production-сборка в `dist/` |
| `npm run preview` | Локальный просмотр сборки |
| `npm run lint` | ESLint |
| `npm run audit` | Проверка уязвимостей зависимостей (`npm audit`) |
| `npm test` | Vitest (unit / изолированные тесты в `src/**/*.test.*`) |
| `npm run test:coverage` | Vitest с отчётом покрытия |
| `npm run test:watch` | Vitest в режиме watch |
| `npm run test:e2e` | Playwright (поднимает dev-сервер; см. `playwright.config.ts`) |
| `npm run test:e2e:perf` | E2E-сценарий нагрузки страницы тура |

## Локальная разработка и базовый путь

В `vite.config.ts` задано `base: '/vkraynosti/'`. Роутер использует `import.meta.env.BASE_URL`. В dev Vite обычно открывают корень сервера; для проверки путей как на проде можно использовать preview после `npm run build` или следовать настройкам Playwright (`baseURL` с префиксом).

Публичный URL сайта и внешние контакты (соцсети, телефон) задаются в **`src/constants/contacts.ts`** — единый источник правды для ссылок в интернете.

## CI и деплой

При пуше в ветку `main` GitHub Actions выполняет: `npm ci` → **`npm audit --audit-level=high`** → `lint` → `test` → `build` → публикация **`dist/`** на GitHub Pages. См. `.github/workflows/deploy.yml`. При появлении уязвимостей уровня **high** и выше сборка остановится, пока их не устранят (часто помогает `npm audit fix`).

Локально: **`npm run audit`** (или `npm audit`). После **`npm audit fix`** — снова `npm test` и `npm run build`. Зависимости отслеживаются через `package.json` и `package-lock.json`.

## Стек (кратко)

- React 19, React Router 7, react-helmet-async  
- Плавный скролл: Lenis + нативный `requestAnimationFrame` (без отдельной motion-библиотеки)  
- Tailwind CSS v3, дизайн-токены в `tailwind.config.ts`  
- Контекст для глобального UI-состояния (без Redux)  
- Zod для валидации форм  
- Vitest + Testing Library; e2e — Playwright  

Подробнее о границах модулей и данных — в [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
