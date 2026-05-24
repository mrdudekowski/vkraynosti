# Мобильная адаптивность (навбар и сезоны)



Канонические брейкпоинты и токены — в [`tailwind.config.ts`](../tailwind.config.ts).



## Подпись сезона в шапке



- Текст названия сезона **справа от логотипа** в [`Navbar`](../src/components/layout/Navbar.tsx): виден от **`xs` (360px)** (`xs:inline`), с `truncate` при нехватке места.

- При **&lt;500px** справа от подписи — **статичный значок** активного сезона (иконка в круге) и отдельная **кнопка со стрелкой вниз**; панель [`SeasonNavDock`](../src/components/layout/SeasonNavDock.tsx) **под навбаром** (три остальных сезона: иконка + подпись) открывается и закрывается **только по этой стрелке**, без отдельной «плашки» у каждой кнопки сезона в панели.

- Состояние открыто/закрыто — [`SeasonNavMenuProvider`](../src/context/SeasonNavMenuProvider.tsx) / [`useSeasonNavMenu`](../src/context/useSeasonNavMenu.ts). Панель **сворачивается** при скролле, клике вне, Escape, выборе сезона, открытии бургер-меню.



## Иконки сезонов в строке навбара



- От **500px** размер фиксирован (`w-nav-season-circle-fixed`, `w-nav-season-icon-fixed`).

- До 500px полный ряд иконок в навбаре скрыт; мобильный выбор — кнопка в navbar + dock.



## iOS safe area и viewport



- Meta viewport: `viewport-fit=cover` в [`index.html`](../index.html).

- SSOT chrome: [`src/constants/layoutChrome.ts`](../src/constants/layoutChrome.ts) — CSS-переменные `--safe-area-top`, `--navbar-chrome-height` в [`src/index.css`](../src/index.css).

- Navbar: строка контента `h-16` от `top-0` (оверлей, «потолок» hero = 64px). Backing-слои с `-top-safe-top` закрывают safe area на iOS без сдвига navbar.
- `main`: **`pt-navbar-chrome`** на страницах с отступом под navbar (мобильная главная, внутренние). Десктопные ворота — `pt-0`, gate под оверлеем.

- Hero / gate: **`h-hero-viewport`**, **`min-h-home-gate-viewport`** — `100svh` (fallback `100vh` в `index.css` для старых браузеров).

- Якорный скролл и «потолок» hero: `getNavbarScrollOffsetPx()` = `-64` (`h-16`); safe area — только в padding `main` и backing navbar.



### Ручная проверка (iPhone Safari)



- Загрузка главной: нет полоски hero над navbar.

- Navbar/dock: фон доходит до физического верха экрана (notch / Dynamic Island).

- Landscape и portrait: отступ `main` совпадает с высотой chrome.

- Hash-якоря на главной: секция не перекрывается navbar.



## Запуск e2e



```bash

npm run test:e2e

```



Требуется: `npx playwright install chromium`.
