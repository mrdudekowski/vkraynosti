# Витрина нового фона Вкрайности Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Создать автономную HTML-витрину фонового решения с секциями «Безопасность» и «Туры».

**Architecture:** В корне проекта появится изолированная папка `background-showcase/`. HTML отвечает за структуру, CSS — за фон/адаптивную композицию, JS — за загрузку локального JSON и фильтрацию, JSON — за зафиксированный активный каталог туров. В существующее приложение и его стили изменения не вносятся.

**Tech Stack:** Семантический HTML, CSS custom properties/grid, vanilla JavaScript ES modules, JSON.

## Global Constraints

- Сохранять `.ocean-backdrop`, `.island-backdrop` и SVG-фильтр `handDrawnNoise`.
- Показывать только туры с `publicationStatus: "active"` из `scripts/fixtures/tour-schedule/tours_list.json`.
- Не изменять `src/`, `public/`, конфигурацию сборки и существующие незакоммиченные файлы.
- Сделать страницу usable при 360, 768 и 1440 px, с visible focus и `prefers-reduced-motion`.
- Не использовать внешние изображения или зависимости; декоративные формы строятся CSS/SVG.

## File Map

- Create: `background-showcase/index.html` — семантическая страница, SVG filter, hero, безопасность, туры, CTA.
- Create: `background-showcase/styles.css` — токены, фон, слои читаемости, карточки и responsive rules.
- Create: `background-showcase/script.js` — fetch JSON, render cards, filters, counters, smooth navigation, fallback.
- Create: `background-showcase/tours.json` — локальный snapshot active-туров с метаданными источника.

### Task 1: Prepare the local tour snapshot

**Files:**
- Create: `background-showcase/tours.json`

- [ ] **Step 1: Copy only active catalog entries**

Перенести из `scripts/fixtures/tour-schedule/tours_list.json` записи со статусом `active`, сохранив `id`, `title`, `priceRub`, `durationType`, `publicationStatus`; добавить верхнеуровневые `source` и `snapshotDate`.

- [ ] **Step 2: Validate the snapshot**

Run: `node -e "const x=require('./background-showcase/tours.json'); if(!x.tours.length || x.tours.some(t=>t.publicationStatus!=='active')) process.exit(1); console.log(x.tours.length+' active tours')"`

Expected: выводит положительное число active-туров и завершается с кодом 0.

- [ ] **Step 3: Commit**

```bash
git add background-showcase/tours.json
git commit -m "feat: add background showcase tour snapshot"
```

### Task 2: Build the semantic showcase shell

**Files:**
- Create: `background-showcase/index.html`

- [ ] **Step 1: Add document structure**

Создать доступный документ с skip-link, header/nav, hero, section `#safety`, section `#tours`, live region для статуса фильтров и footer CTA. Вставить исходный SVG filter с `feTurbulence` и `feDisplacementMap`; декоративные элементы пометить `aria-hidden="true"`.

- [ ] **Step 2: Add stable render hooks**

Добавить `data-tours-grid`, `data-tour-count`, `data-empty-state`, `data-season-filter`, `data-type-filter`, `data-reset-filters` и `data-source-note`, чтобы JS не зависел от визуальных классов.

### Task 3: Implement the visual system

**Files:**
- Create: `background-showcase/styles.css`

- [ ] **Step 1: Define visual tokens and backdrop**

Задать глубокие морские цвета, молочный текст, coral accent, радиусы и тени. Реализовать `.ocean-backdrop` как fixed canvas с градиентами, `.island-backdrop` как крупные размытые формы, а поверх добавить veil/texture layers для читаемости.

- [ ] **Step 2: Style sections and cards**

Сделать hero с большой типографикой, safety grid на 6 карточек и tours grid с фильтр-панелью. Ограничить текстовые строки, добавить `backdrop-filter` с безопасным fallback и усилить контраст у карточек.

- [ ] **Step 3: Add responsive and motion rules**

На 360 px перейти в одну колонку и компактную навигацию; на 768 px — в две; на desktop — в широкую сетку. Для `prefers-reduced-motion: reduce` отключить animation/transition и smooth scrolling.

### Task 4: Add data rendering and interactions

**Files:**
- Create: `background-showcase/script.js`

- [ ] **Step 1: Load and normalize local data**

Загрузить `./tours.json`, отфильтровать `publicationStatus === 'active'`, нормализовать сезон из id (`winter`, `spring`, `summer`, `fall`) и отформатировать цену через `Intl.NumberFormat('ru-RU')`.

- [ ] **Step 2: Render tour cards**

Рендерить безопасные text nodes через `textContent`; при отсутствии результатов показывать `data-empty-state`; обновлять количество карточек и source note.

- [ ] **Step 3: Wire filters and navigation**

Связать season/type selects и reset с единым `renderTours()`; обновлять live region; добавить делегирование кликов для якорной навигации. При ошибке fetch показать fallback с понятным сообщением.

### Task 5: Verify the standalone artifact

**Files:**
- Verify: `background-showcase/index.html`, `background-showcase/styles.css`, `background-showcase/script.js`, `background-showcase/tours.json`

- [ ] **Step 1: Run static checks**

Run: `node --check background-showcase/script.js`

Expected: команда завершается без синтаксических ошибок.

- [ ] **Step 2: Serve and inspect**

Run: `npx vite --host 127.0.0.1 --port 4178`

Open: `http://127.0.0.1:4178/background-showcase/`

Проверить hero, обе секции, фильтры, reset, отсутствие неактивных туров, клавиатурный focus и responsive widths 360/768/1440 px.

- [ ] **Step 3: Review scope and commit**

Run: `git status --short`

Expected: среди новых изменений только `background-showcase/` (плюс ранее существующие изменения пользователя). Затем:

```bash
git add background-showcase
git commit -m "feat: add background showcase page"
```
