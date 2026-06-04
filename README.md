# Вкрайности (Vkraynosti)

Одностраничное приложение турагентства: React, TypeScript, Vite, Tailwind CSS. Продакшен: **GitHub Pages** с базовым путём приложения `/vkraynosti/`.

## Документация

| Документ | Назначение |
|----------|------------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Структура репозитория, слои, маршрутизация |
| [docs/PROJECT_CONTEXT.md](docs/PROJECT_CONTEXT.md) | Контекст продукта, зафиксированные решения, **инженерный TODO** по коду |
| [docs/PRODUCTION_READINESS.md](docs/PRODUCTION_READINESS.md) | Чек-лист до коммерческого продакшена |
| [TimeWebDoc/README.md](TimeWebDoc/README.md) | Миграция на TimeWeb App + S3: пайплайн по фазам, промпт агента |
| [docs/PERFORMANCE.md](docs/PERFORMANCE.md) | Метрики производительности, **профилирование в Chrome (Profiler / Performance)**, эталоны |
| [docs/MEDIA_OPTIMIZATION_PIPELINE.md](docs/MEDIA_OPTIMIZATION_PIPELINE.md) | Полный pipeline оптимизации видео/медиа до эталонного состояния |
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

### Preview без устаревших чанков

`npm run preview` раздаёт содержимое текущего `dist/`, где имена JS-чанков включают hash сборки. Если вкладка была открыта до нового `npm run build`, старый HTML/JS может попытаться загрузить уже несуществующий `assets/*-<oldhash>.js`. Для проверки production-сборки используйте такой цикл:

1. Остановите старый `vite preview`, если он ещё запущен.
2. Выполните `npm run build`.
3. Запустите `npm run preview` и откройте URL, который напечатал Vite, вместе с префиксом `/vkraynosti/`.
4. После каждой новой сборки открывайте новую вкладку или делайте hard reload страницы.
5. Не держите несколько preview-серверов на разных портах для одной и той же проверки.

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
