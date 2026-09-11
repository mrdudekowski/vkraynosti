# Дизайн: единая система кнопок и аудит админки

## Цель

Применить вид кнопки «Опубликовать на сайте» к действиям публикации во всей админке, привести остальные generic-кнопки к единому набору вариантов и провести полный targeted-аудит admin UI/root-стилей на дубликаты, hardcoded-стили, accessibility и критические проблемы поддерживаемости.

## Границы репозитория

Работа выполняется только в `E:\Cursor Projects\Vkrainosti-cms-crm-phase1-admin-app` на ветке `codex/admin-app`. Боевой/public-репозиторий `E:\Cursor Projects\Vkrainosti-cms-crm-phase1` не изменяется.

Существующие незакоммиченные изменения в `src/admin/components/AdminProfileMenu.tsx`, `src/admin/components/InboxQueueTable.tsx` и `src/index.css` принадлежат пользователю и должны быть сохранены; feature-коммиты не должны их включать.

## Workflow

- Публикация — внешне видимое и permission-sensitive действие. Кнопки публикации должны иметь одинаковую визуальную иерархию, busy/disabled-поведение и доступный focus.
- Сохранение, фильтрация, навигация, destructive-действия и специализированные календарные/menu/tab controls имеют другие семантические роли и не должны автоматически становиться publish-кнопками.
- Generic action button использует `AdminButton`; навигация остаётся `<Link>`/`<a>` с соответствующим admin-классом.

## Система вариантов

В `src/admin/components/AdminButton.tsx` и root admin-стилях сохраняются варианты `primary`, `secondary`, `ghost`, `destructive` и добавляется `publish`.

Вариант `publish` повторяет референс:

- тёмно-зелёный brand-фон;
- белый контрастный текст;
- icon + label в одной строке;
- admin hit-area и скругление;
- явные hover, active, keyboard-focus и disabled состояния;
- сохранение `aria-busy` и существующих permission guards.

`primary` остаётся основным действием общего назначения, например «Сохранить». Publish-вариант применяется только к:

- публикации страницы «Сайт»;
- публикации тура/очереди;
- публикации расписания;
- другим существующим действиям, которые реально изменяют публичную публикацию.

Специализированные controls (tabs, календарные ячейки, dropdown/menu items, icon-only controls, selection cards) не заменяются на большой `AdminButton`, но должны использовать общие токены размеров, focus и disabled там, где это не меняет их layout-контракт.

## Аудит и исправления

Проверить весь `src/admin/**/*.tsx`, `src/admin/**/*.ts`, `src/index.css` и `src/admin/site-page.css`.

Искать:

- raw action `<button>` там, где подходит `AdminButton`;
- прямые повторения `admin-btn-*` и длинные className с тем же назначением;
- hardcoded colors, spacing, radius, transition и focus rules вместо существующих admin-токенов;
- дублирование admin CSS между root и `site-page.css`;
- `transition-all` и `outline-none` без корректной замены;
- controls без label/aria-label, слабые keyboard focus и слишком маленькие hit-area;
- hardcoded UI copy в компонентах вместо `ADMIN_UI`;
- inline styles, оставляя только оправданные динамические значения (проценты, focal point, object position, container configuration).

Исправлять только подтверждённые проблемы, относящиеся к admin UI и влияющие на единообразие, accessibility, layout или поддерживаемость. Не делать несвязанный public UI refactor.

## Проверки

- `AdminButton.test.tsx`: новый `publish` variant и существующие варианты.
- Publish-flow tests: `SitePage`, `SchedulePage`, `InboxPage`, `TourEditorPage` сохраняют permission, disabled и busy semantics.
- Targeted component tests для исправленных raw controls.
- `npm run typecheck`.
- `npm run lint`.
- `npm run build:admin` и, если предусмотрено текущими scripts, `node scripts/verify-admin-build.mjs`.
- `git diff --check`.
- Финальный `git status` подтверждает, что три пользовательских dirty-файла не попали в feature-коммиты.

## Не входит в scope

- Изменение public-site компонентов и backend/public CMS-репозитория.
- Переписывание всех specialized controls в `AdminButton`.
- Создание второго дизайн-системного набора.
- Изменение бизнес-логики публикации, permissions, API или draft/publish state machine.
