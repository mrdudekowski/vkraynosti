# Архитектура проекта

## Точки входа

- **`src/main.tsx`** — монтирование React, провайдеры (`Season`, `Modal`, `Helmet`, граница ошибок, плавный скролл через Lenis и нативный RAF в `SmoothScrollProvider`), `RouterProvider`.
- **`src/router.tsx`** — `createBrowserRouter`, вложенный `Layout`, дочерние маршруты. Часть страниц подключается через `React.lazy` и обёрнута в `Suspense` внутри `Layout` (см. `src/components/layout/Layout.tsx`). Главная страница импортируется синхронно — осознанный компромисс для первого экрана (при изменении оценивать LCP и размер начального чанка). На **`Home`** ниже сетки туров секции «Безопасность», «Команда» и «Контакты» подгружаются лениво (`React.lazy` + общий `Suspense`, плейсхолдер `HomeBelowFoldSuspenseFallback`).
- **`Layout`** — модалки заявки на тур и карточки участника команды подгружаются через `React.lazy` при первом открытии; на время загрузки чанка показывается `ModalLazyChunkFallback` (оверлей в духе готовых модалок, `aria-*` из `UI.modal.lazyChunkLoadingLabel`).

## Каталоги

| Путь | Роль |
|------|------|
| `src/pages/` | Страницы и маршруты верхнего уровня |
| `src/components/` | Переиспользуемые UI-блоки (layout, home, tours, modals, …) |
| `src/context/` | React Context и провайдеры |
| `src/hooks/` | Переиспользуемая логика (карусели, скролл, медиа-запросы) |
| `src/data/` | Контент туров, команды, безопасности — типизированные константы |
| `src/constants/` | Маршруты, UI-строки, изображения, темы, контакты, анимации |
| `src/validation/` | Схемы (Zod) и валидация форм |
| `e2e/` | Playwright-сценарии |

## Single Source of Truth (данные и конфигурация в коде)

- **Маршруты** — `src/constants/routes.ts`
- **Тексты интерфейса** — `src/constants/ui.ts` и `src/data/*.ts`
- **Пути к изображениям** — `src/constants/images.ts`
- **Внешние ссылки и контакты** (сайт, мессенджеры, телефон) — `src/constants/contacts.ts` — нужны, чтобы пользователи переходили на нужные страницы и каналы связи
- **Визуальные токены** — `tailwind.config.ts` (`theme.extend`), без «магии» в JSX

## Сборка

- **Vite** — dev-сервер и production bundle.
- **`base`** — задан в `vite.config.ts` под деплой в подкаталог GitHub Pages.
- **Разбиение чанков** — в `vite.config.ts` (`manualChunks` для React, роутера, FontAwesome) снижает кэш-инвалидацию и упорядочивает крупные vendor-зависимости.

## Связанные документы

- [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) — контекст продукта, зафиксированные решения и **инженерный TODO** по коду
- [PRODUCTION_READINESS.md](./PRODUCTION_READINESS.md) — чек-лист до коммерческого продакшена
- [PERFORMANCE.md](./PERFORMANCE.md) — метрики и проверки производительности
- Корневой [README.md](../README.md) — команды и CI
